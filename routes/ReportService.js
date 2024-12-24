const express = require('express');
const axios = require('axios');
const { handleRecord } = require('../helpers/RecordHandler.js');
const { OperationEnums } = require('../helpers/utilityEnum.js');
const { headertoRptHeader } = require('../helpers/utilityFunctions.js');
const exeQuery = require('../helpers/exeQuery');
const router = express.Router();

router.use(express.json());

//#region getReport Prep Details
router.get('/getreporthead', (req, res) => {
    //const {OrgId} = req.query;
    const {OrgId,UserId,ReportId} = req.query;
    const data = { "OrgId": OrgId,"UserId": UserId,"ReportId":ReportId };
    handleRecord(req, res, data, OperationEnums().GETREPORTHEAD);
});
// #endregion getReport Prep Details
router.post('/getreport', async (req, res) => {
    const ReportBdy = req.body; 
    exeQuery.Exec_SpReport(ReportBdy, async (error, results) => {
        if (error) {
            res.status(400).send({ error: error.message });
            return;
        }

        // Step 1: Extract the ColumnHeader value
        headers = headertoRptHeader(results.headers);
        results.headers = headers;
        res.status(200).send(results);
        // Parse Report Data    
      // Send the report to the client
     });      
});
// #endregion getReport Prep Details
router.post('/BuildReport', async (req, res) => {
    const ReportBdy = req.body; 
    exeQuery.Exec_SpReport(ReportBdy, async (error, results) => {
        if (error) {
            res.status(400).send({ error: error.message });
            return;
        }
        // Step 1: Extract the ColumnHeader value
        headers = headertoRptHeader(results.headers);
        // Parse Report Data    
        const data = JSON.stringify(results.data);
        // Step 2: Parse the JSON string
        const parsedDataJson = JSON.parse(data);
        // Log the parsed JSON
        const rows = parsedDataJson.map(row => Object.values(row));
         // Render the report with the data
        const report = await axios.post('http://reportdesign.ibizaccounts.in/api/report',{
            template: { name: 'iBizReport' }, // Replace with your template name
            data: { headers, rows, "title":"Test Title Report"}
        });
  
      // Send the report to the client
      //res.contentType('application/pdf');
      console.log(report.data);
      res.send(report.data);
       //res.status(200).send(results);
     });      
});
module.exports = router;