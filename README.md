[![npm](https://img.shields.io/npm/v/@egomobile/mongo.svg)](https://www.npmjs.com/package/@egomobile/mongo)
[![last build](https://img.shields.io/github/workflow/status/egomobile/node-mongo/Publish)](https://github.com/egomobile/node-mongo/actions?query=workflow%3APublish)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/egomobile/node-mongo/pulls)

# @egomobile/mongo

> Classes, functions and tools, that help connecting to Mongo DB servers, written in [TypeScript](https://www.typescriptlang.org/).

## Install

Execute the following command from your project folder, where your `package.json` file is stored:

```bash
npm install --save @egomobile/mongo
```

## Usage

```typescript
import { MongoDatabase } from "@egomobile/mongo";

async function main() {
  // alternative:
  //
  // mongo = new MongoDatabase();
  // await mongo.connect();
  const mongo = await MongoDatabase.open();
  // mongo.isConnected should be (true) now

  // terminate process if connection is closed
  // --or-- close connection if process is exiting
  //
  // then return 3 as exit code
  mongo.exitOnClose(3);

  const my_collection = mongo.collection("my_collection");

  // count documents; should be 0
  const count1 = await my_collection.count({});
  const count2 = await my_collection.count({ foo: 1 });

  // insert single or many documents
  await my_collection.insertOne({ foo: 1 });
  await my_collection.insertMany([
    {
      foo: 1,
    },
    {
      foo: 2,
      bar: "3",
    },
  ]);

  // find documents
  const firstMatchingDoc = await my_collection.findOne({ foo: 1 });
  const matchingDocs = await my_collection.find({ foo: 2 });

  // update documents
  await my_collection.updateOne(
    { foo: 1 },
    {
      foo: "11",
    }
  );
  await my_collection.updateMany(
    { foo: 2 },
    {
      foo: "222",
    }
  );

  // delete documents
  await my_collection.deleteOne({ foo: 1 });
  await my_collection.deleteMany({ foo: 2 });

  // do some low-level operations
  await mongo.withClient(async (client, db) => {
    const collection = db.collection("my_collection");

    return collection.find({ foo: 2 }).toArray();
  });

  // close connection
  await mongo.disconnect();
}

main().catch(console.error);
```

## Documentation

The API documentation can be found [here](https://egomobile.github.io/node-mongo/).
