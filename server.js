const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const emailRoutes = require('./routes/emailRoutes');
const contractorRoutes = require('./routes/contractorRoutes');

const swaggerDocument = require('./swagger/swagger.json');
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', emailRoutes);
app.use('/api/contractor', contractorRoutes);


// Start Server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//     console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
// });

app.listen(PORT, '192.168.0.182', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger docs available at http://192.168.0.182:4000/api-docs`);
});
//192.168.253.161
/*
const port = process.env.PORT || 3009;
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});*/