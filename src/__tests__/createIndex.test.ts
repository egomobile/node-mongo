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

describe('MongoDatabase.createIndex() method', () => {
    it('should have indicies after creation', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        // create index
        await mongo.createIndex(collectionName, {
            foo: 1,
            bar: -1
        });

        const indexes = await mongo.withClient((client, db) => {
            const collection = db.collection(collectionName);

            return collection.indexes();
        });

        // check data
        expect(Array.isArray(indexes)).toBe(true);
        expect(indexes.length).toBe(2);
        expect(typeof indexes[1]).toBe('object');
        expect(typeof indexes[1].key).toBe('object');
        expect(typeof indexes[1].key.foo).toBe('number');
        expect(indexes[1].key.foo).toBe(1);
        expect(typeof indexes[1].key.bar).toBe('number');
        expect(indexes[1].key.bar).toBe(-1);
        expect(typeof indexes[1].name).toBe('string');
        expect(indexes[1].name).toBe('foo_1_bar_-1');
    });
});
