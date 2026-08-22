const { Client } = require('pg');
const {
    connectionString,
    ssl,
} = require('./database-config.cjs');

async function main() {
    const client = new Client({
        connectionString,
        ssl,
    });

    try {
        await client.connect();

        const result = await client.query(`
      SELECT
        current_database() AS database_name,
        current_user AS database_user,
        current_schema() AS current_schema,
        NOW() AS server_time;
    `);

        console.log('Database connection successful.');
        console.log({
            databaseName: result.rows[0].database_name,
            databaseUser: result.rows[0].database_user,
            currentSchema: result.rows[0].current_schema,
            serverTime: result.rows[0].server_time,
        });
    } catch (error) {
        console.error('Database connection failed.');
        console.error(error.message);

        process.exitCode = 1;
    } finally {
        await client.end().catch(() => { });
    }
}

main();