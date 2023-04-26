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

describe("MongoDatabase.updateMany() method", () => {
    it("should return documents with updated data after updating many with a filter", async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => {
            return db.collection(collectionName).find({}).toArray();
        });

        // must be 0 / empty at beginning
        expect(typeof docs1.length).toBe("number");
        expect(docs1.length).toBe(0);

        for (let i = 0; i < 100; i++) {
            const docsToInsert = [{
                "foo": 1,
                "bar": 11
            }, {
                "foo": "2",
                "bar": 222
            }];

            const expectedCount = (i + 1) * 2;

            // insert documents and get new array of documents
            const docs2 = await mongo.withClient(async (client, db) => {
                const collection = db.collection(collectionName);

                await collection.insertMany(docsToInsert);

                return collection.find().toArray();
            });

            // check count
            expect(typeof docs2.length).toBe("number");
            expect(docs2.length).toBe(expectedCount);

            // update all with foo === 1
            await mongo.updateMany<any>(collectionName, {
                "foo": 1
            }, {
                "$set": {
                    "foo": "11"
                }
            });

            // check current data
            const docs3 = await mongo.withClient(async (client, db) => {
                const collection = db.collection(collectionName);

                return collection.find({}).toArray();
            });

            // if count did not change
            expect(typeof docs3.length).toBe("number");
            expect(docs3.length).toBe(expectedCount);

            // get updated documents
            const docs4 = await mongo.withClient(async (client, db) => {
                const collection = db.collection(collectionName);

                return collection.find({
                    "foo": "11"
                }).toArray();
            });

            // and check count
            expect(typeof docs4.length).toBe("number");
            expect(docs4.length).toBe(expectedCount / 2);  // must be half of total count
        }
    });
});
