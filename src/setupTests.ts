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

import dotenv from 'dotenv';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoDatabase } from './classes/MongoDatabase';

dotenv.config({
    path: path.join(__dirname, '.env.tests')
});

let m: MongoDatabase | undefined;
let server: MongoMemoryServer | undefined;

beforeAll(async () => {
    server = new MongoMemoryServer();

    const url = await server.getUri();
    const db = 'test';

    process.env.MONGO_DB = db;
    process.env.MONGO_URL = url;

    m = new MongoDatabase(() => ({
        db,
        isCosmosDB: true,
        url
    }));

    (global as any).mongo = m;
});

beforeEach(async () => {
    await m!.connect();

    // keep sure to delete all data before running a test
    await m!.withClient(async (client, db) => {
        const collections = await db.collections();

        for (const c of collections) {
            await c.deleteMany({});
        }
    });
});

afterEach(async () => {
    await m!.disconnect();
});

afterAll(async () => {
    await server!.stop();

    delete process.env.MONGO_DB;
    delete process.env.MONGO_URL;
});
