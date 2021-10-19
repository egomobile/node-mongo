/* eslint-disable no-underscore-dangle */
/* eslint-disable unicorn/filename-case */

// This file is part of the @egomobile/mongo distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/mongo is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/mongo is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import { MongoClient } from 'mongodb';
import type { BulkWriteOptions, CountDocumentsOptions, CreateIndexesOptions, Db as MongoDb, DeleteOptions, DeleteResult, Document, Filter, FindOptions, IndexSpecification, InsertManyResult, InsertOneResult, MongoClient as MongoDBClient, UpdateFilter, UpdateOptions, UpdateResult } from 'mongodb';
import type { IMongoSchema } from '../types';
import { isTruely } from '../utils';
import { Nilable } from '../types';

/**
 * A function, that returns the options for a mongo database connection.
 */
export type GetMongoDatabaseOptions = () => IMongoDatabaseOptions;

/**
 * Options for a 'MongoDatabase' instance.
 */
export interface IMongoDatabaseOptions {
    /**
     * The name of the database.
     */
    db?: Nilable<string>;
    /**
     * Is Cosmos DB or not.
     */
    isCosmosDB?: Nilable<boolean>;
    /**
     * Use TLS or not.
     */
    isTls?: Nilable<boolean>;
    /**
     * TLS can be insecure or not.
     */
    isTlsInsecure?: Nilable<boolean>;
    /**
     * The URI.
     */
    url: string;
}

/**
 * Action for 'withClient()' method of 'MongoDatabase' class.
 *
 * @param {MongoDBClient} client The open client.
 * @param {MongoDb} db The underlying default database instance.
 *
 * @returns {Promise<TResult>} The promise with the result.
 */
export type WithMongoClientAction<TResult extends any = any> =
    (client: MongoDBClient, db: MongoDb) => Promise<TResult>;

/**
 * Creates a function, that returns the options for a 'MongoDatabase' instance,
 * which are stored in environment variables:
 *
 * - MONGO{name}_DB => the name of the default database
 * - MONGO{name}_IS_COSMOSDB => (optional) is Cosmos DB or not; default: (false)
 * - MONGO{name}_TLS => (optional) use TLS or not; default: (false)
 * - MONGO{name}_TLS_INSECURE => (optional) can use insecure TLS connection or not; default: (false)
 * - MONGO{name}_URL => (optional) the URL to the connection; default: 'mongodb://localhost:27017'
 *
 * @param {string} name The name (or category) of the Mongo DB settings.
 *
 * @returns {GetMongoDatabaseOptions} The new function.
 */
export function createGetMongoDatabaseOptionsFunc(name: string): GetMongoDatabaseOptions {
    if (typeof name !== 'string') {
        throw new TypeError('category must be of type string');
    }

    let envNameExtension = name.toUpperCase().trim();
    if (envNameExtension.length) {
        envNameExtension = '_' + envNameExtension;
    }

    return () => {
        const MONGO_IS_COSMOSDB = process.env[`MONGO${envNameExtension}_IS_COSMOSDB`];
        const MONGO_DB = process.env[`MONGO${envNameExtension}_DB`]!.trim();
        const MONGO_URL = process.env[`MONGO${envNameExtension}_URL`]?.trim() || 'mongodb://localhost:27017';
        const MONGO_TLS = process.env[`MONGO${envNameExtension}_TLS`];
        const MONGO_TLS_INSECURE = process.env[`MONGO${envNameExtension}_TLS_INSECURE`];

        return {
            isCosmosDB: isTruely(MONGO_IS_COSMOSDB),
            db: MONGO_DB,
            url: MONGO_URL,
            isTls: isTruely(MONGO_TLS),
            isTlsInsecure: isTruely(MONGO_TLS_INSECURE)
        };
    };
}

/**
 * Default action, that returns options, defined in following environment variables:
 *
 * - MONGO_DB => the name of the default database
 * - MONGO_IS_COSMOSDB => (optional) is Cosmos DB or not; default: (false)
 * - MONGO_TLS => (optional) use TLS or not; default: (false)
 * - MONGO_TLS_INSECURE => (optional) can use insecure TLS connection or not; default: (false)
 * - MONGO_URL => (optional) the URL to the connection; default: 'mongodb://localhost:27017'
 */
export const defaultGetMongoDatabaseOptions = createGetMongoDatabaseOptionsFunc('');

/**
 * A connection to a MongoDB database.
 */
export class MongoDatabase {
    /**
     * The current connect.
     */
    protected _client: Nilable<MongoDBClient>;

    /**
     * Initializes a new instance of that class.
     *
     * @param {IMongoDatabaseOptions} [optionsOrFunc] Custom options or the function, that provides it.
     */
    constructor(optionsOrFunc: IMongoDatabaseOptions | GetMongoDatabaseOptions = defaultGetMongoDatabaseOptions) {
        let getOptions: GetMongoDatabaseOptions;
        if (typeof optionsOrFunc === 'function') {
            getOptions = optionsOrFunc;
        } else {
            getOptions = () => optionsOrFunc;
        }

        if (typeof getOptions !== 'function') {
            throw new TypeError('optionsOrFunc must be a function or object');
        }

        this.getOptions = getOptions;
    }

    /**
     * connect to database
     */
    public async connect() {
        const options = this.getOptions();

        try {
            this._client = await MongoClient.connect(options.url, {
                tls: options.isTls || undefined,
                tlsInsecure: options.isTlsInsecure || undefined
            });
        } catch (ex) {
            console.error('ex', ex);
        }
    }

    /**
     * Does a count on a MongoDB collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = new MongoDatabase()
     *
     * // count all documents
     * const count1 = await mongo.count('my_collection')
     * // count with filter
     * const count2 = await mongo.count('my_collection', { foo: 'bar' })
     * ```
     *
     * @param {string} collectionName The collection's name.
     * @param {Filter<T>} [filter] The filter.
     * @param {CountDocumentsOptions} [options] Custom options.
     *
     * @returns {Promise<number>} The promise with the number of documents.
     */
    public async count<T = Document>(
        collectionName: string,
        filter?: Filter<T>,
        options?: CountDocumentsOptions
    ): Promise<number> {
        const opts = this.getOptions();

        if (opts.isCosmosDB) {
            // some versions of Cosmos DB instances
            // do not support 'count()' operations
            // so we have to do a 'find()' first
            return (await this.find<T>(collectionName, filter || {}, options)).length;
        }

        return this.withClient((client, db) => {
            const collection = db.collection<T>(collectionName);

            if (filter) {
                if (options) {
                    return collection.countDocuments(filter, options) as Promise<number>;
                } else {
                    return collection.countDocuments(filter) as Promise<number>;
                }
            } else {
                return collection.countDocuments() as Promise<number>;
            }
        });
    }

    /**
     * Create an index on a collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = new MongoDatabase()
     *
     * await mongo.createIndex('my_collection', {
     *   foo: 1,
     *   bar: -1
     * })
     * ```
     *
     * @param {string} collectionName The collection's name.
     * @param {IndexSpecification} indexSpec The field or spec.
     * @param {CreateIndexesOptions} [options] Custom options.
     *
     * @returns {Promise<string>} The promise with the result.
     */
    public createIndex(collectionName: string, indexSpec: IndexSpecification, options?: CreateIndexesOptions): Promise<string> {
        return this.withClient((client, db) => {
            const collection = db.collection(collectionName);

            if (options) {
                return collection.createIndex(indexSpec, options);
            } else {
                return collection.createIndex(indexSpec);
            }
        });
    }

    /**
     * Delete documents from a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {Filter<T>} filter The filter.
     * @param {DeleteOptions} [options] Custom options.
     *
     * @returns {Promise<DeleteResult>} The promise with the result.
     */
    public deleteMany<T = Document>(collectionName: string, filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
        return this.withClient((client, db) => {
            const collection = db.collection<T>(collectionName);

            if (options) {
                return collection.deleteMany(filter, options);
            } else {
                return collection.deleteMany(filter);
            }
        });
    }

    /**
     * Delete a document from a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {Filter<T>} filter The filter.
     * @param {DeleteOptions} [options] Custom options.
     *
     * @returns {Promise<DeleteResult>} The promise with the result.
     */
    public deleteOne<T = Document>(collectionName: string, filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
        return this.withClient((client, db) => {
            const collection = db.collection<T>(collectionName);

            if (options) {
                return collection.deleteOne(filter, options);
            } else {
                return collection.deleteOne(filter);
            }
        });
    }

    /**
     * disconnect from database
     */
    public async disconnect() {
        await this._client?.close();

        this._client = null;
    }

    /**
     * Registers the process events to close the connect on exit.
     *
     * @param {number} exitCode The custom exit code.
     *
     * @returns {this} This instance.
     */
    public exitOnClose(exitCode = 2): this {
        if (typeof exitCode !== 'number') {
            throw new TypeError('exitCode must be of a number');
        }

        const client = this.getClient();

        // close process, if connection to MongoDB
        // is terminated
        client.once('close', () => process.exit());

        // try to close connection, if process closes
        process.once('exit', () => tryCloseClient(client));
        process.once('SIGINT', () => tryCloseClient(client));
        process.once('SIGUSR1', () => tryCloseClient(client));
        process.once('SIGUSR2', () => tryCloseClient(client));
        process.once('uncaughtException', (error) => {
            process.exitCode = exitCode;
            console.error('[ERROR]', '@egomobile/mongo', error);

            tryCloseClient(client);
        });

        return this;
    }

    /**
     * Does a find on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {Filter<T>} filter The filter.
     * @param {FindOptions<T>} [options] Custom options.
     *
     * @returns {Promise<T[]>} The promise with the result.
     */
    public find<T = IMongoSchema>(
        collectionName: string,
        filter: Filter<T>,
        options?: FindOptions<T>
    ): Promise<T[]> {
        return this.withClient((client, db) => {
            const collection = db.collection<T>(collectionName);

            return collection.find(filter, options)
                .toArray();
        });
    }

    /**
     * Does a findOne on a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {Filter<T>} filter The filter.
     * @param {FindOptions<T>} [options] Custom options.
     *
     * @returns {Promise<T|null>} The promise with the result or (null) if not found.
     */
    public findOne<T = IMongoSchema>(
        collectionName: string,
        filter: Filter<T>,
        options?: FindOptions<T extends IMongoSchema ? IMongoSchema : T>
    ): Promise<T | null> {
        return this.withClient((client, db) => {
            const collection = db.collection<T>(collectionName);

            return collection.findOne(filter as any, options as any) as any;
        });
    }

    /**
     * Get the MongoDB client.
     *
     * @returns {MongoDBClient } The MongoDB client.
     */
    public getClient(): MongoDBClient {
        if (!this._client) {
            throw new Error('No connection to a Mongo DB opened');
        }

        return this._client;
    }

    /**
     * The function, that returns the options for that instance.
     */
    public readonly getOptions: GetMongoDatabaseOptions;

    /**
     * Insert many documents into a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {T[]} docs The documents to insert.
     * @param {BulkWriteOptions} [options] Custom options.
     *
     * @returns {Promise<InsertManyResult<T>>} The promise with the result.
     */
    public insertMany<T = IMongoSchema>(collectionName: string, docs: T[], options?: BulkWriteOptions): Promise<InsertManyResult<T>> {
        return this.withClient((client, db) => {
            const collection = db.collection(collectionName);

            if (options) {
                return collection.insertMany(docs, options);
            } else {
                return collection.insertMany(docs);
            }
        });
    }

    /**
     * Insert one document into a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {T} doc The document to insert.
     * @param {BulkWriteOptions} [options] Custom options.
     *
     * @returns {Promise<InsertManyResult<T>>} The promise with the result.
     */
    public insertOne<T = IMongoSchema>(collectionName: string, doc: T, options?: BulkWriteOptions): Promise<InsertOneResult<T>> {
        return this.withClient((client, db) => {
            const collection = db.collection(collectionName);

            if (options) {
                return collection.insertOne(doc, options);
            } else {
                return collection.insertOne(doc);
            }
        });
    }

    /**
     * Update documents in a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {FilterQuery<T>} filter The filter for the documents.
     * @param {UpdateQuery<T>} update The update query for the documents.
     * @param {UpdateManyOptions} [options] Custom options.
     *
     * @returns {Promise<WriteOpResult>} The promise with the result.
     */
    public updateMany<T = Document>(collectionName: string, filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<Document | UpdateResult> {
        return this.withClient((client, db) => {
            const collection = db.collection<T>(collectionName);

            if (options) {
                return collection.updateMany(filter, update, options);
            } else {
                return collection.updateMany(filter, update);
            }
        });
    }

    /**
     * Update one document in a MongoDB collection.
     *
     * @param {string} collectionName The collection's name.
     * @param {Filter<T>} filter The filter for the document.
     * @param {UpdateFilter<T>} update The update query for the document.
     * @param {UpdateOptions} [options] Custom options.
     *
     * @returns {Promise<UpdateResult | Document>} The promise with the result.
     */
    public updateOne<T = Document>(collectionName: string, filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<UpdateResult | Document> {
        return this.withClient((client, db) => {
            const collection = db.collection<T>(collectionName);

            if (options) {
                return collection.updateOne(filter, update, options);
            } else {
                return collection.updateOne(filter, update);
            }
        });
    }

    /**
     * Opens a new client connection if it doesn't exist and executes an action on it.
     *
     * @param {WithMongoClientAction<TResult>} action The action to invoke.
     *
     * @returns {Promise<TResult>} The promise with the result.
     */
    public async withClient<TResult extends any = any>(
        action: WithMongoClientAction<TResult>
    ): Promise<TResult> {
        const client = this.getClient();

        const options = this.getOptions();

        const db = client.db(options.db!);

        return await action(client, db);
    }
}

async function tryCloseClient(client: Nilable<MongoDBClient>) {
    try {
        client?.close();
    } catch (error) {
        console.warn('[WARN]', '@egomobile/mongo', error);
    }
}
