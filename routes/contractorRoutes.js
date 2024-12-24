const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const { handleRecord } = require('../helpers/RecordHandler.js');
const { OperationEnums } = require('../helpers/utilityEnum.js');
const exeQuery = require('../helpers/exeQuery');
const dbUtility = require('../dbUtility');
const { Console } = require('winston/lib/winston/transports/index.js');


router.use(express.json());


// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yaswanthpg9@gmail.com', 
        pass: 'bigmixvfocxidpme'       // Your App Password
    }
});



router.get('/SignIn', (req, res) => {
try {
    const data = req.query;
    console.log(data);
    handleRecord(req, res, data, OperationEnums().SIGNIN);
} catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error While SIGNIN' });
}
});

// Email Service
router.post('/send-email', async (req, res) => {
    const { to, subject, text, html } = req.body;
    
    // Email options
    const mailOptions = {
        from: '"Gireesh" <yaswanthpg9@gmail.com>', // Sender's name and email
        to: to,                                     // Recipient email
        subject: subject,                           // Email subject
        text: text,                                 // Plain text body
        html: html                                  // HTML body
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        res.status(200).json({ message: 'Email sent successfully', info: info.response });
    } catch (error) {
        console.error('Error while sending email:', error);
        res.status(500).json({ message: 'Error while sending email', error: error.message });
    }
});

//#region ManageLaborQRPass
router.post('/ManageLaborQRPass', async (req, res) => {
    try {
       
        if (!req.body || !req.body.orgid || !req.body.userid || !req.body.Time || !req.body.Date || !req.body.QRCode || !req.body.ContractorId) {
            return res.status(400).send({ error: 'Missing required parameters' });
        }

        // Call the stored procedure handler with the request body data
        exeQuery.SpManageLaborQRPass(req.body, (error, results) => {
            if (error) {
                
                return res.status(400).send({ error: error.message });
            }
            console.log(results);
            return res.status(200).send(results);
        });
    } catch (error) {
        
        return res.status(400).send({ error: error.message });
    }
});


router.post('/POSTContractors', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().CONTINSRT);
});

router.post('/UPDTContractors', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().UPDTCONTRACT);
});

router.get('/getContractors', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETCONTRACT);
});

router.get('/getContractorQrPasses', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETQRPASS);
});


router.get('/getShiftTimings', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETSHFTTIMES);
});


//#endregion ManageLaborQRPass






/*
//region PassApproval&Email
router.post('/PassApproval&Email', async (req, res) => {
    const { RequestId, Status, UserId, to, subject, text, html } = req.body;

    // Validate required fields
    if (!RequestId || !Status || !UserId) {
        return res.status(400).json({ message: 'Missing required fields', Status: false });
    }

    // SQL query to update status
    const updateStatusQuery = `
        UPDATE dbo.RequestPass
        SET Status = '${Status}',
            UpdatedBy = '${UserId}',
            UpdatedOn = dbo.GetISTTime()
        WHERE RequestId = '${RequestId}'
    `;

    try {
        // Execute the update query
        const rowsAffected = await dbUtility.executeQueryrowsAffected(updateStatusQuery);

        if (rowsAffected === 0) {
            return res.status(200).json({ message: 'Status not updated', Status: false });
        }

        // Check if email should be sent
        if (Status.toLowerCase() === 'approve') {
            try {
                // Email options
                const mailOptions = {
                    from: '"Gireesh" <yaswanthpg9@gmail.com>', // Sender's name and email
                    to: to,
                    subject: subject,
                    text: text,
                    html: html
                };

                // Send the email
                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);

                return res.status(200).json({
                    message: 'Status updated and email sent successfully',
                    Status: true,
                    emailResponse: info.response
                });
            } catch (emailError) {
                console.error('Error while sending email:', emailError);
                return res.status(500).json({
                    message: 'Status updated, but email sending failed',
                    Status: false,
                    error: emailError.message
                });
            }
        }

        // If no email is sent, respond with status update success
        res.status(200).json({
            message: 'Status updated successfully',
            Status: true
        });
    } catch (dbError) {
        console.error('Database error:', dbError);
        res.status(500).json({
            message: 'Error while updating status',
            Status: false,
            error: dbError.message
        });
    }
});*/

//#endregion PassApproval&email

//#region QrCheckin
/*
router.post('/QrCheckinOrCheckOut', async (req, res) => {
    try {
        const { OrgId, IncNo, UserId, currentTime } = req.body;

        // Validate input
        if (!OrgId || !IncNo || !UserId || !currentTime) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Query to fetch the record
        const GetPassQuery = `
            SELECT * 
            FROM dbo.RequestPass 
            WHERE OrgId = ${OrgId} 
              AND AutoIncNo = '${IncNo}' 
              AND CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE);
        `;
        console.log(GetPassQuery);

        const recordData = await dbUtility.executeQuery(GetPassQuery);

        // Check if any record is found
        if (recordData.length === 0) {
            return res.status(404).json({ error: 'No active record found' });
        }

        const record = recordData[0]; // Assuming executeQuery returns an array of records
        let UPDTCheckTime;

        // Check the status of CheckInTime and CheckOutTime
        if (!record.CheckInTime) {
            // Update CheckInTime if it's NULL
            UPDTCheckTime = `
                UPDATE dbo.RequestPass 
                SET CheckInTime = '${currentTime}', 
                    UpdatedBy = '${UserId}', 
                    UpdatedOn = dbo.GetISTTime() 
                WHERE RequestId = '${record.RequestId}';
            `;
            // Execute the update query
             await dbUtility.executeQuery(UPDTCheckTime);
            // Success response
            res.status(200).json({ message: 'CheckInTime updated successfully', time: currentTime });
        } else if (!record.CheckOutTime) {
            // Update CheckOutTime if it's NULL
            UPDTCheckTime = `
                UPDATE dbo.RequestPass 
                SET CheckOutTime = '${currentTime}', 
                    Status = 'COMPLETED', 
                    UpdatedBy = '${UserId}', 
                    UpdatedOn = dbo.GetISTTime() 
                WHERE RequestId = '${record.RequestId}';
            `;
            // Execute the update query
            await dbUtility.executeQuery(UPDTCheckTime);
            // Success response
            res.status(200).json({ message: 'CheckOutTime updated successfully', time: currentTime });
        } else {
            // If both are not NULL, return QR Code expired
            return res.status(400).json({ error: 'QR Code expired' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});*/


//#endregion QrCheckin

module.exports = router;
