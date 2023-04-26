# Change Log (@egomobile/mongo)

## 2.0.0

- refactored to use it with [mongodb 5.3+](https://www.npmjs.com/package/mongodb)
- upgrade to new [linter rules](https://github.com/egomobile/eslint-config-ego)
- changed `Nilable`, `Nullable` and `Optional` types to internal ones
- other bug fixes and improvements

## 1.2.0

- add wrapper class `MongoCollection`, which can be created by `MongoDatabase.collection()` e.g.

## 1.0.0

- stable release
- **BREAKING CHANGES**: remove support for `MONGO_IS_COSMOSDB`, `MONGO_TLS` and `MONGO_TLS_INSECURE` environment variables and their properties in [IMongoDatabaseOptions](https://egomobile.github.io/node-mongo/interfaces/IMongoDatabaseOptions.html)
- (bug-)fixes

## 0.1.2

- initial release
