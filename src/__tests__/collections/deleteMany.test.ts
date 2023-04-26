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

import { MongoDatabase } from "../..";

const collectionName = "test";

describe("MongoCollection.deleteMany() method", () => {
    it("should return 0 if test collection is empty at beginning", async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const collection = mongo.collection(collectionName);

        const docs1 = await collection.find({});

        expect(typeof docs1.length).toBe("number");
        expect(docs1.length).toBe(0);

        await collection.deleteMany({
            "foo": 1
        });

        const docs2 = await collection.find({});

        expect(typeof docs2.length).toBe("number");
        expect(docs2.length).toBe(0);
    });

    it("should return more than 0 if documents in test collection are deleted by filter", async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const collection = mongo.collection(collectionName);

        const docs1 = await collection.find({});

        // should be 0 / empty at the beginning
        expect(typeof docs1.length).toBe("number");
        expect(docs1.length).toBe(0);

        for (let i = 0; i < 100; i++) {
            const docsToInsert = [{
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

            const expectedCount = (i + 1) * (docsToInsert.length - 1);

            // insert test data
            await collection.insertMany(docsToInsert);

            // delete elements
            await collection.deleteMany({
                "foo": 1
            });

            // reload data
            const docs = await collection.find({});

            // check count
            expect(typeof docs.length).toBe("number");
            expect(docs.length).toBe(expectedCount);
        }
    });
});
