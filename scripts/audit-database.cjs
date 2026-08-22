const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

async function main() {
    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        await client.connect();

        console.log('\n========================================');
        console.log('DATABASE AUDIT');
        console.log('========================================\n');

        const databaseInfo = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        current_schema() AS current_schema,
        version() AS postgres_version,
        NOW() AS server_time;
    `);

        console.table(databaseInfo.rows);

        const schemas = await client.query(`
      SELECT
        schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN (
        'pg_catalog',
        'information_schema',
        'pg_toast'
      )
      ORDER BY schema_name;
    `);

        console.log('\n========================================');
        console.log('SCHEMAS');
        console.log('========================================\n');

        console.table(schemas.rows);

        const tables = await client.query(`
      SELECT
        table_schema,
        table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN (
          'pg_catalog',
          'information_schema'
        )
      ORDER BY table_schema, table_name;
    `);

        console.log('\n========================================');
        console.log('TABLES');
        console.log('========================================\n');

        console.table(tables.rows);

        const views = await client.query(`
      SELECT
        table_schema,
        table_name
      FROM information_schema.views
      WHERE table_schema NOT IN (
        'pg_catalog',
        'information_schema'
      )
      ORDER BY table_schema, table_name;
    `);

        console.log('\n========================================');
        console.log('VIEWS');
        console.log('========================================\n');

        console.table(views.rows);

        const functions = await client.query(`
      SELECT
        n.nspname AS schema_name,
        p.proname AS function_name,
        pg_get_function_identity_arguments(p.oid) AS arguments,
        pg_get_function_result(p.oid) AS return_type
      FROM pg_proc p
      JOIN pg_namespace n
        ON n.oid = p.pronamespace
      WHERE n.nspname NOT IN (
        'pg_catalog',
        'information_schema'
      )
      ORDER BY
        n.nspname,
        p.proname;
    `);

        console.log('\n========================================');
        console.log('FUNCTIONS');
        console.log('========================================\n');

        console.table(functions.rows);

        const triggers = await client.query(`
      SELECT
        event_object_schema AS table_schema,
        event_object_table AS table_name,
        trigger_name,
        event_manipulation,
        action_timing,
        action_statement
      FROM information_schema.triggers
      WHERE trigger_schema NOT IN (
        'pg_catalog',
        'information_schema'
      )
      ORDER BY
        event_object_schema,
        event_object_table,
        trigger_name;
    `);

        console.log('\n========================================');
        console.log('TRIGGERS');
        console.log('========================================\n');

        console.table(triggers.rows);

        const indexes = await client.query(`
      SELECT
        schemaname AS schema_name,
        tablename AS table_name,
        indexname AS index_name,
        indexdef AS index_definition
      FROM pg_indexes
      WHERE schemaname NOT IN (
        'pg_catalog',
        'information_schema'
      )
      ORDER BY
        schemaname,
        tablename,
        indexname;
    `);

        console.log('\n========================================');
        console.log('INDEXES');
        console.log('========================================\n');

        console.table(indexes.rows);

        const constraints = await client.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema NOT IN (
        'pg_catalog',
        'information_schema'
      )
      ORDER BY
        tc.table_schema,
        tc.table_name,
        tc.constraint_name;
    `);

        console.log('\n========================================');
        console.log('CONSTRAINTS');
        console.log('========================================\n');

        console.table(constraints.rows);

        const policies = await client.query(`
      SELECT
        schemaname AS schema_name,
        tablename AS table_name,
        policyname AS policy_name,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname NOT IN (
        'pg_catalog',
        'information_schema'
      )
      ORDER BY
        schemaname,
        tablename,
        policyname;
    `);

        console.log('\n========================================');
        console.log('RLS POLICIES');
        console.log('========================================\n');

        console.table(policies.rows);

        console.log('\n========================================');
        console.log('AUDIT COMPLETE');
        console.log('========================================\n');
    } catch (error) {
        console.error('\nDatabase audit failed.');
        console.error(error.message);
        process.exitCode = 1;
    } finally {
        await client.end().catch(() => { });
    }
}

main();