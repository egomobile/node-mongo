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

describe('insertOne() method', () => {
    it('should return documents if inserting single elements to test collection', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => db.collection(collectionName).find({}).toArray());

        expect(typeof docs1.length).toBe('number');
        expect(docs1.length).toBe(0);

        let expectedCount = 0;

        for (let i = 0; i < 100; i++) {
            const docToInsert = {
                foo: 1,
                bar: 11
            };

            ++expectedCount;

            await mongo.insertOne(collectionName, docToInsert);

            const count = await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.countDocuments();
            });

            expect(typeof count).toBe('number');
            expect(expectedCount).toBe(expectedCount);
        }
    });
});
