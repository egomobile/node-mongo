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

import { MongoDatabase } from '..';

const collectionName = 'test';

describe('MongoDatabase.findOne() method', () => {
    it('should return (null) if test collection is empty at beginning', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const doc = await mongo.findOne(collectionName, {});

        expect(doc).toBe(null);
    });

    it('should return a document if using no filter in test collection', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => db.collection(collectionName).find({}).toArray());

        // should be 0 / empty at the beginning
        expect(typeof docs1.length).toBe('number');
        expect(docs1.length).toBe(0);

        for (let i = 0; i < 100; i++) {
            const docsToInsert = [{
                foo: '1',
                bar: 11
            }, {
                foo: 1,
                bar: '11'
            }, {
                foo: 2
            }, {}, {
                foo: null
            }, {
                foo: 1
            }, {
                foo: new Date()
            }, {
                foo: true
            }];

            // insert test data
            await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.insertMany(docsToInsert);
            });

            const doc: any = await mongo.findOne(collectionName, {});

            // check data
            expect(typeof doc).toBe('object');
            expect(typeof doc.foo).toBe('string');
            expect(doc.foo).toBe('1');
            expect(typeof doc.bar).toBe('number');
            expect(doc.bar).toBe(11);
        }
    });

    it('should return a document if using a matching filter in test collection', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => db.collection(collectionName).find({}).toArray());

        // should be 0 / empty at the beginning
        expect(typeof docs1.length).toBe('number');
        expect(docs1.length).toBe(0);

        for (let i = 0; i < 100; i++) {
            const docsToInsert = [{
                foo: 1,
                bar: 11
            }, {
                foo: 1,
                bar: '11'
            }, {
                foo: 2
            }, {}, {
                foo: null
            }, {
                foo: '1'
            }, {
                foo: new Date()
            }, {
                foo: true
            }];

            // insert test data
            await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.insertMany(docsToInsert);
            });

            const doc: any = await mongo.findOne(collectionName, {
                foo: 1
            });

            // check data
            expect(typeof doc).toBe('object');
            expect(typeof doc.foo).toBe('number');
            expect(doc.foo).toBe(1);
            expect(typeof doc.bar).toBe('number');
            expect(doc.bar).toBe(11);
        }
    });

    it('should return (null) if using a non-matching filter in test collection', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => db.collection(collectionName).find({}).toArray());

        // should be 0 / empty at the beginning
        expect(typeof docs1.length).toBe('number');
        expect(docs1.length).toBe(0);

        for (let i = 0; i < 100; i++) {
            const docsToInsert = [{
                foo: 1
            }, {
                foo: 2
            }, {}, {
                foo: null
            }, {
                foo: '1'
            }, {
                foo: new Date()
            }, {
                foo: 1
            }, {
                foo: true
            }];

            // insert test data
            await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.insertMany(docsToInsert);
            });

            const doc: any = await mongo.findOne(collectionName, {
                foo: 3
            });

            // check data
            expect(doc).toBe(null);
        }
    });
});
