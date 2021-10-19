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

describe('disconnect() method', () => {
    it('should throw error if connection is closed', async () => {
        const mongo: MongoDatabase = (global as any).mongo;

        expect(typeof mongo.isConnected).toBe('boolean');
        expect(mongo.isConnected).toBe(true);

        await expect((async () => {
            await mongo.withClient(async (client, db) => db.collection(collectionName).countDocuments());
        })()).resolves.not.toThrowError();

        await mongo.disconnect();

        expect(typeof mongo.isConnected).toBe('boolean');
        expect(mongo.isConnected).toBe(false);

        await expect((async () => {
            await mongo.withClient(async (client, db) => db.collection(collectionName).countDocuments());
        })()).rejects.toThrowError();
    });
});
