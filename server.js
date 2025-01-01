// const express = require('express');
// const bodyParser = require('body-parser');
// const swaggerUi = require('swagger-ui-express');
// const emailRoutes = require('./routes/emailRoutes');
// const contractorRoutes = require('./routes/contractorRoutes');

// const swaggerDocument = require('./swagger/swagger.json');
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 4000;

// // Middleware
// app.use(bodyParser.json());
// app.use(cors());

// // Swagger Documentation
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// // Routes
// app.use('/api/auth', emailRoutes);
// app.use('/api/contractor', contractorRoutes);


// // Start Server
// // app.listen(PORT, () => {
// //     console.log(`Server is running on http://localhost:${PORT}`);
// //     console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
// // });

// // app.listen(PORT, '192.168.0.182', () => {
// //     console.log(`Server is running on port ${PORT}`);
// //     console.log(`Swagger docs available at http://192.168.0.182:4000/api-docs`);
// // });
// app.listen(PORT, '0.0.0.0', () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//     console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
// });
// //192.168.253.161
// /*
// const port = process.env.PORT || 3009;
// app.listen(port, '0.0.0.0', () => {
//     console.log(`Server is running on port ${port}`);
// });*/


require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const emailRoutes = require('./routes/emailRoutes');
const contractorRoutes = require('./routes/contractorRoutes');
const ReportRoutes = require('./routes/ReportService.js');
const helmet = require('helmet');
const cors = require('cors');

const swaggerDocument = require('./swagger/swagger.json');

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/auth', emailRoutes);
app.use('/contractor', contractorRoutes);
app.use('/Report',ReportRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

const port = process.env.PORT || 3009;
const host = '0.0.0.0'; // This makes the server accessible externally (from any IP)

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
    console.log(`Swagger docs available at http://${host}:${port}/api-docs`);
});


// const port = process.env.PORT || 3009;
// app.listen(port, '0.0.0.0', () => {
//     console.log(`Server is running on port ${port}`);
// });
// app.listen(PORT, HOST, () => {
//     console.log(`Server is running on http://${HOST}:${PORT}`);
//     console.log(`Swagger docs available at http://${HOST}:${PORT}/api-docs`);
// });

// const port = process.env.PORT || 3009;
// app.listen(port, '0.0.0.0', () => {
//     console.log(`Server is running on port ${port}`);
// });
