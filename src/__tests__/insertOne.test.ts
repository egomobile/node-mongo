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
    it('should increase documents by 1 when inserting single document', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const docs1 = await mongo.withClient((client, db) => db.collection(collectionName).find({}).toArray());

        // should be empty / 0 at the beginning
        expect(typeof docs1.length).toBe('number');
        expect(docs1.length).toBe(0);

        let expectedCount = 0;

        for (let i = 0; i < 100; i++) {
            const docToInsert = {
                foo: 1,
                bar: '11'
            };

            ++expectedCount;

            // insert single
            await mongo.insertOne(collectionName, docToInsert);

            const docs = await mongo.withClient((client, db) => {
                const collection = db.collection(collectionName);

                return collection.find({}).toArray();
            });

            // check count
            expect(typeof docs.length).toBe('number');
            expect(docs.length).toBe(expectedCount);

            // check data
            for (const d of docs) {
                expect(typeof d.foo).toBe('number');
                expect(d.foo).toBe(1);
                expect(typeof d.bar).toBe('string');
                expect(d.bar).toBe('11');
            }
        }
    });
});
