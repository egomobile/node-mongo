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

import { MongoDatabase } from "..";

const collectionName = "test";

describe("MongoDatabase.deleteOne() method", () => {
    it("should return 0 if test collection is empty at beginning", async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => {
            return db.collection(collectionName).find({}).toArray();
        });

        // should be 0 / empty at the beginning
        expect(typeof docs1.length).toBe("number");
        expect(docs1.length).toBe(0);

        await mongo.deleteOne(collectionName, {
            "foo": 1
        });

        const docs2 = await mongo.withClient((client, db) => {
            return db.collection(collectionName).find({}).toArray();
        });

        // should still be 0 / empty at the beginning
        expect(typeof docs2.length).toBe("number");
        expect(docs2.length).toBe(0);
    });

    it("should return more than 0 if documents in test collection are deleted by filter", async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => {
            return db.collection(collectionName).find({}).toArray();
        });

        // should be 0 / empty at the beginning
        expect(typeof docs1.length).toBe("number");
        expect(docs1.length).toBe(0);

        let expectedCount = 0;

        for (let i = 0; i < 100; i++) {
            const docsToInsert = [{
                "foo": 1
            }, {
                "foo": 1
            }, {
                "foo": 2
            }, {}, {
                "foo": null
            }, {
                "foo": "1"
            }, {
                "foo": new Date()
            }, {
                "foo": true
            }];

            expectedCount += docsToInsert.length;
            expectedCount += -1;

            // insert test data
            await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.insertMany(docsToInsert);
            });

            // remove first with foo === 1
            await mongo.deleteOne(collectionName, {
                "foo": 1
            });

            // reload data
            const docs = await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.find({}).toArray();
            });

            // check count
            expect(typeof docs.length).toBe("number");
            expect(docs.length).toBe(expectedCount);
        }
    });
});
