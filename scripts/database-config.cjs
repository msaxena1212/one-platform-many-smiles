const path = require('path');
const dotenv = require('dotenv');

/*
 * Environment loading strategy
 *
 * Local development:
 *   .env.local
 *
 * Production:
 *   Environment variables supplied by the hosting platform.
 *
 * Existing process.env values always take precedence.
 */

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: path.resolve(process.cwd(), '.env.local'),
        override: false,
    });
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error(
        'DATABASE_URL is not configured. ' +
        'Set DATABASE_URL in .env.local for local development ' +
        'or configure it in the production environment.'
    );
}

module.exports = {
    connectionString,

    ssl: {
        rejectUnauthorized: false,
    },
};