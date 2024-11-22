// helper.js
const exeQuery = require('../helpers/exeQuery');
const { handleResponse } = require('../helpers/responseHandler');

const handleRecord = (req, res, data, OperationId) => {
    const jsonData = JSON.stringify(data);
    exeQuery.Execute_SP(jsonData, OperationId.toString(), (error, results) => {
        handleResponse(res, error, results);
    });
};

module.exports = { handleRecord };
