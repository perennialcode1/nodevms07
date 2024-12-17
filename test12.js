const sql = require('mssql');

// Database configuration
const config = {
  user: 'sa',              // Your username
  password: 'sadguru',     // Your password
  server: 'DESKTOP-NMEHM98\MSSQLSERVER2022', // Your server name (replace URI with the actual server name or IP)
  database: 'QAVMS1', // Your database name
  options: {
    encrypt: true,          // Use encryption for connections (set to false if you don't use encryption)
    trustServerCertificate: true // For self-signed certificates
  }
};

// Connect to SQL Server
sql.connect(config)
  .then(pool => {
    console.log("Connected to SQL Server!");

    // Example query: Replace with your actual query
    return pool.request().query('select * from [dbo].[ScreenOperations]');
  })
  .then(result => {
    console.log(result.recordset);  // Output the result of the query
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  })
  .finally(() => {
    sql.close();  // Close the connection pool
  });
