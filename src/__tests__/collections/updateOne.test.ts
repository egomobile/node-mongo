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

describe("MongoCollection.updateOne() method", () => {
    it("should return documents with updated data after updating single one with a filter", async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const collection = mongo.collection(collectionName);

        const docs1 = await collection.find({});

        // must be 0 / empty at the beginning
        expect(typeof docs1.length).toBe("number");
        expect(docs1.length).toBe(0);

        for (let i = 0; i < 100; i++) {
            const docsToInsert = [{
                "foo": 1,
                "bar": 11,
                "index": i * 2
            }, {
                "foo": "2",
                "bar": 222,
                "index": i * 2 + 1
            }];

            const expectedCount = (i + 1) * 2;

            await collection.insertMany(docsToInsert);

            // insert and return new array of documents
            const docs2 = await collection.find({});

            // check count
            expect(typeof docs2.length).toBe("number");
            expect(docs2.length).toBe(expectedCount);

            // update first one
            await collection.updateOne({
                "foo": 1
            }, {
                "$set": {
                    "foo": "11"
                }
            });

            // recheck current data
            const docs3 = await collection.find({});

            // should be same count
            expect(typeof docs3.length).toBe("number");
            expect(docs3.length).toBe(expectedCount);

            // get updated documents
            const docs4 = await collection.find({
                "foo": "11"
            });

            // check its count
            expect(typeof docs4.length).toBe("number");
            expect(docs4.length).toBe(expectedCount / 2);  // should be half of total count
        }
    });
});
