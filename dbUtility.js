const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true, // Change to true for local dev
    },
};

let pool;

async function initializePool() {
    try {
        if (!pool) {
            pool = await sql.connect(config);
            console.log('Database connection pool created.');
        }
    } catch (err) {
        console.error('Error initializing the connection pool:', err);
        throw err;
    }
}

async function executeQuery(query) {
    try {
        await initializePool(); // Ensure the pool is initialized
        const result = await pool.request().query(query);
        console.log(query);
        return result.recordset;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    }
}

// Optionally expose a method to close the pool
async function closePool() {
    if (pool) {
        await pool.close();
        pool = null;
        console.log('Database connection pool closed.');
    }
}

module.exports = {
    executeQuery,
    closePool,
};

/*
const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT),
    options: {
        encrypt: true,
        trustServerCertificate: true, // Change to true for local dev
    },
};

async function executeQuery(query) {
    try {
        console.log("hiop");
        const pool = await sql.connect(config);
        const result = await pool.request().query(query);
        console.log(query);
        return result.recordset;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } finally {
        await sql.close();
    }
}





module.exports = {
    executeQuery
    
};
*/
