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

describe('find() method', () => {
    it('should return 0 if test collection is empty at beginning', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs = await mongo.find(collectionName, {});

        expect(typeof docs.length).toBe('number');
        expect(docs.length).toBe(0);
    });

    it('should return more than 0 if not using a filter in test collection', async () => {
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
                foo: true
            }];

            const expectedCount = docsToInsert.length * (i + 1);

            // insert test data
            await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.insertMany(docsToInsert);
            });

            const docs = await mongo.find(collectionName, {});

            // check new count
            expect(typeof docs.length).toBe('number');
            expect(docs.length).toBe(expectedCount);

            // check data
            for (let j = 0; j < docs.length; j++) {
                const currentDoc = docs[j];
                const sourceDoc = docsToInsert[j % docsToInsert.length];

                expect(typeof currentDoc).toBe('object');
                expect(currentDoc).toMatchObject(sourceDoc);
            }
        }
    });

    it('should return more than 0 if using a matching filter in test collection', async () => {
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
            }, {
                foo: null
            }, {
                foo: '1'
            }, {
                foo: 1
            }, {
                foo: true
            }];

            const expectedCount = (i + 1) * 2;

            // insert test data
            await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.insertMany(docsToInsert);
            });

            // use a filter
            const docs = await mongo.find(collectionName, {
                foo: 1
            });

            // check count
            expect(typeof docs.length).toBe('number');
            expect(docs.length).toBe(expectedCount);

            // check data
            for (let j = 0; j < docs.length; j++) {
                const currentDoc = docs[j];

                expect(typeof currentDoc).toBe('object');
                expect(currentDoc).toMatchObject({ foo: 1 });
            }
        }
    });

    it('should return 0 if using a non-matching filter in test collection', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => db.collection(collectionName).find({}).toArray());

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

            const expectedCount = 0;

            await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.insertMany(docsToInsert);
            });

            const docs = await mongo.find(collectionName, {
                foo: 3
            });

            expect(typeof docs.length).toBe('number');
            expect(docs.length).toBe(expectedCount);
        }
    });
});
