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

import { MongoDatabase } from '../..';

const collectionName = 'test';

describe('count() method', () => {
    it('should return 0 on init (collection)', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const collection = mongo.collection(collectionName);

        const countTest = await collection.count();

        expect(typeof countTest).toBe('number');
        expect(countTest).toBe(0);
    });

    it('should return the count based on the inserted documents (collection)', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        const collection = mongo.collection(collectionName);

        for (let i = 0; i < 100; i++) {
            const expectedCount = i + 1;

            // insert next test data
            await collection.insertOne({
                expectedCount
            });

            const count = await mongo.count(collectionName);

            // check count
            expect(typeof count).toBe('number');
            expect(count).toBe(expectedCount);
        }
    });
});
