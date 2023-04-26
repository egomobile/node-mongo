/* eslint-disable jsdoc/valid-types */
/* eslint-disable unicorn/filename-case */

import type { BulkWriteOptions, CountDocumentsOptions, Collection, CreateIndexesOptions, DeleteOptions, DeleteResult, Document, Filter, FindOptions, IndexSpecification, InsertManyResult, InsertOneResult, UpdateFilter, UpdateOptions, UpdateResult, WithId } from "mongodb";
import type { MongoDatabase } from "./MongoDatabase";

/**
 * A typed Mongo collection.
 */
export class MongoCollection<T extends Document = Document> {
    /**
     * Creates a new instance of that class.
     *
     * @param {MongoDatabase} db The database.
     * @param {Collection} collection The underlying collection.
     */
    public constructor(
        public readonly db: MongoDatabase,
        public readonly collection: Collection<any>
    ) { }

    /**
     * Does a count on a MongoDB collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // count all documents
     * const count1 = await my_collection.count()
     * // count with filter
     * const count2 = await my_collection.count({ foo: 'bar' })
     * ```
     *
     * @param {Filter<T>} [filter] The filter.
     * @param {CountDocumentsOptions} [options] Custom options.
     *
     * @returns {Promise<number>} The promise with the number of documents.
     */
    public async count(
        filter?: Filter<T>,
        options?: CountDocumentsOptions
    ): Promise<number> {
        return this.db.count(this.collection.collectionName, filter, options);
    }

    /**
     * Create an index on that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * await my_collection.createIndex({
     *   foo: 1,
     *   bar: -1
     * })
     * ```
     *
     * @param {IndexSpecification} indexSpec The field or spec.
     * @param {CreateIndexesOptions} [options] Custom options.
     *
     * @returns {Promise<string>} The promise with the result.
     */
    public createIndex(indexSpec: IndexSpecification, options?: CreateIndexesOptions): Promise<string> {
        return this.db.createIndex(this.collection.collectionName, indexSpec, options);
    }

    /**
     * Delete documents from that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // delete all documents with foo === 1
     * await my_collection.deleteMany({
     *   foo: 1,
     * })
     * ```
     *
     * @param {Filter<T>} filter The filter.
     * @param {DeleteOptions} [options] Custom options.
     *
     * @returns {Promise<DeleteResult>} The promise with the result.
     */
    public deleteMany(filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
        return this.db.deleteMany(this.collection.collectionName, filter, options);
    }

    /**
     * Delete a document from that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // delete first document with foo === 1
     * await my_collection.deleteOne({
     *   foo: 1,
     * })
     * ```
     *
     * @param {Filter<T>} filter The filter.
     * @param {DeleteOptions} [options] Custom options.
     *
     * @returns {Promise<DeleteResult>} The promise with the result.
     */
    public deleteOne(filter: Filter<T>, options?: DeleteOptions): Promise<DeleteResult> {
        return this.db.deleteOne(this.collection.collectionName, filter, options);
    }

    /**
     * Does a find on that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // all, where foo === 1
     * const docs: any[] = await my_collection.find({
     *   foo: 1,
     * })
     * ```
     *
     * @param {Filter<T>} filter The filter.
     * @param {FindOptions<T>} [options] Custom options.
     *
     * @returns {Promise<WithId<T>[]>} The promise with the result.
     */
    public find(filter: Filter<T>, options?: FindOptions<any>): Promise<WithId<T>[]> {
        return this.db.find(this.collection.collectionName, filter, options);
    }

    /**
     * Does a findOne on that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // (null) if not found
     * const doc: any = await my_collection.findOne({
     *   foo: 1,
     * })
     * ```
     *
     * @param {Filter<T>} filter The filter.
     * @param {FindOptions<T>} [options] Custom options.
     *
     * @returns {Promise<WithId<T>|null>} The promise with the result or (null) if not found.
     */
    public findOne(filter: Filter<T>, options?: FindOptions<any>): Promise<WithId<T> | null> {
        return this.db.findOne(this.collection.collectionName, filter, options);
    }

    /**
     * Insert many documents into that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // insert an array of two documents
     * await my_collection.insertMany([{
     *   foo: 1,
     * }, {
     *   foo: 2,
     * }])
     * ```
     *
     * @param {T[]} docs The documents to insert.
     * @param {BulkWriteOptions} [options] Custom options.
     *
     * @returns {Promise<InsertManyResult<T>>} The promise with the result.
     */
    public insertMany(docs: T[], options?: BulkWriteOptions): Promise<InsertManyResult<T>> {
        return this.db.insertMany(this.collection.collectionName, docs, options);
    }

    /**
     * Insert one document into that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // insert a single document
     * await my_collection.insertOne({
     *   foo: 1,
     * })
     * ```
     *
     * @param {T} doc The document to insert.
     * @param {BulkWriteOptions} [options] Custom options.
     *
     * @returns {Promise<InsertManyResult<T>>} The promise with the result.
     */
    public insertOne(doc: T, options?: BulkWriteOptions): Promise<InsertOneResult<T>> {
        return this.db.insertOne(this.collection.collectionName, doc, options);
    }

    /**
     * Update documents in that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // update all with foo === 1
     * // and set foo = 2 and remove bar prop
     * await my_collection.updateMany({
     *   foo: 1
     * }, {
     *   '$set': {
     *     foo : 2
     *   },
     *   '$unset': {
     *     bar: 1
     *   }
     * })
     * ```
     *
     * @param {FilterQuery<T>} filter The filter for the documents.
     * @param {UpdateQuery<T>} update The update query for the documents.
     * @param {UpdateManyOptions} [options] Custom options.
     *
     * @returns {Promise<WriteOpResult>} The promise with the result.
     */
    public updateMany(filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<Document | UpdateResult> {
        return this.db.updateMany(this.collection.collectionName, filter, update, options);
    }

    /**
     * Update one document in that collection.
     *
     * @example
     * ```
     * import MongoDatabase from '@egomobile/mongo'
     *
     * const mongo = await MongoDatabase.open()
     *
     * const my_collection = mongo.collection('my_collection')
     *
     * // update first matching one with foo === 1
     * // and set foo = 2 and remove bar prop
     * await my_collection.updateOne({
     *   foo: 1
     * }, {
     *   '$set': {
     *     foo : 2
     *   },
     *   '$unset': {
     *     bar: 1
     *   }
     * })
     * ```
     *
     * @param {Filter<T>} filter The filter for the document.
     * @param {UpdateFilter<T>} update The update query for the document.
     * @param {UpdateOptions} [options] Custom options.
     *
     * @returns {Promise<UpdateResult | Document>} The promise with the result.
     */
    public updateOne(filter: Filter<T>, update: UpdateFilter<T>, options?: UpdateOptions): Promise<UpdateResult | Document> {
        return this.db.updateOne(this.collection.collectionName, filter, update, options);
    }
}
