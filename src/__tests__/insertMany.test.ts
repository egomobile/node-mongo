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

describe("MongoDatabase.insertMany() method", () => {
    it("should return documents if inserting elements to test collection", async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => {
            return db.collection(collectionName).find({}).toArray();
        });

        // should be 0 / empty at the beginning
        expect(typeof docs1.length).toBe("number");
        expect(docs1.length).toBe(0);

        for (let i = 0; i < 100; i++) {
            const docsToInsert = [{
                "foo": 1,
                "bar": 11
            }, {
                "foo": 1,
                "bar": "11"
            }, {
                "foo": 2
            }, {
                "foo": null
            }, {
                "foo": "1"
            }, {
                "foo": new Date()
            }, {
                "foo": true
            }];

            const expectedCount = docsToInsert.length * (i + 1);

            // insert bulk of data
            await mongo.insertMany(collectionName, docsToInsert);

            // reload documents
            const docs = await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.find({}).toArray();
            });

            // check count
            expect(typeof docs.length).toBe("number");
            expect(docs.length).toBe(expectedCount);

            // check data
            for (const d of docs) {
                expect(typeof d.foo).not.toBe("undefined");
            }
        }
    });
});
