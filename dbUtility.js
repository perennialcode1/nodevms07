const sql = require('mssql');
require('dotenv').config(); // Load Environment Variables

const sqlConfig = {
    user: process.env[`DB_USER`],
    password: process.env[`DB_PASSWORD`],
    server: process.env[`DB_SERVER`],
    database: process.env[`DB_DATABASE`],
    connectionTimeout: 30000, 
    requestTimeout: 30000,   
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    driver: 'tedious',
    pool: {
		max: 10, // Maximum number of connections in the pool
		min: 0,  // Minimum number of connections in the pool
		idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
	  },
};
// Create a connection pool
const poolPromise = new sql.ConnectionPool(sqlConfig)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    //console.log(`Swagger docs available at http://192.168.1.64:4000/api-docs`);
    return pool;
  })
  .catch(err => {
    console.error('Database Connection Failed! Bad Config:', err);
    throw err;
  });

async function executeQuery(query) {
    try {
        const pool = await poolPromise; // Get the pool
        const result = await pool.request().query(query);
        console.log(result);
        return result.recordset;
    } catch (err) {
        console.error('Error executing query:', err);
        throw err;
    } 
}

async function executeQueryrowsAffected(query) {
  try {
      const pool = await poolPromise; // Get the pool
      const result = await pool.request().query(query);
      return result.rowsAffected;
  } catch (err) {
      console.error('Error executing query:', err);
      throw err;
  } 
}


// Closing the pool when your application exits (if needed)
process.on('exit', async () => {
    try {
      const pool = await poolPromise;
      await pool.close();
      console.log('Connection pool closed.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing the pool:', err);
      process.exit(1);
    }
  });

module.exports = {
    executeQuery,
    executeQueryrowsAffected
};
