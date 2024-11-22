const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const { handleRecord } = require('../helpers/RecordHandler.js');
const { OperationEnums } = require('../helpers/utilityEnum.js');
const exeQuery = require('../helpers/exeQuery');


router.use(express.json());


// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yaswanthpg9@gmail.com', 
        pass: 'bigmixvfocxidpme'       // Your App Password
    }
});

/*
router.post('/SignIn', async (req, res) => {
    try {
        const data = req.body;
        handleRecord(req, res, data, OperationEnums().SIGNIN);
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Error updating Users' });
    }
});*/

router.get('/SignIn', (req, res) => {
try {
    const data = req.query;
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
        from: '"Your Name" <yaswanthpg9@gmail.com>', // Sender's name and email
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

//#region ManageRequestPass
router.post('/ManageRequestPass', async (req, res) => {
    try {
    
        if (!req.body || !req.body.orgid || !req.body.userid || !req.body.Operation || !req.body.RequestPass || !req.body.Attendees) {
            return res.status(400).send({ error: 'Missing required parameters' });
        }

        exeQuery.SpManageRequestPass(req.body, (error, results) => {
            if (error) {
                res.status(400).send({ error: error.message });
                return;
            }

            res.status(200).send(results);
        });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});




router.get('/getReqPass', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETREQPASS);
});

router.get('/getReqPassById', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETREQPASSBYID);
});
//#endregion ManageRequestPass


module.exports = router;
