import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp } from './create-test-app';
import { prepareTestDatabase } from './test-database';

// The migrations are hand-written, so a column an entity declares that no
// migration creates (or the reverse) surfaces only at runtime, on whichever
// path first touches it — as a 500 on a NOT NULL the code never fills, not
// as a failing check. This spec is that check: after every migration runs,
// TypeORM's schema builder must find NOTHING left to change.
describe('schema drift (integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    await prepareTestDatabase();
    app = await createTestApp();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('migrations produce exactly the schema the entities declare', async () => {
    const pending = await dataSource.driver.createSchemaBuilder().log();
    expect(pending.upQueries.map((query) => query.query)).toEqual([]);
  });
});
