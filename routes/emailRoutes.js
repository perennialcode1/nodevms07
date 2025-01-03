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
        pass: 'sznn fsaj jawu gsjr'       // Your App Password
    }
});

//#region Menu

router.get('/UserPermissions', (req, res) => {
    const {OrgId, RoleId, ModuleId } = req.query;
    const data = { "OrgId": OrgId, "RoleId":RoleId, "ModuleId": ModuleId };
    handleRecord(req, res, data, OperationEnums().RSECURSEL);
});

router.get('/getmenu', (req, res) => {
    const {OrgId, RoleId } = req.query;
    const JsonData = { "OrgId": OrgId, "RoleId":RoleId };
    exeQuery.GetMenu(JsonData, (error, results) => {
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        //console.log(results);
        exeQuery.GetMenuNodes(results, (err, MenuList) => {
            if (err) {
                return res.status(500).json({ error: err.message, Status: false });
            }
            res.json({
                ResultData: MenuList,
                Status: true
            });
        });
    });
});
router.post('/UpdateUserMenu', (req, res) => {
    const UpdateJson = req.body; 
     exeQuery.SpSetRoleSecurity(UpdateJson, (error, results) => {
        if (error) {
           res.status(400).send({ error: error.message });
          return;
       }
       res.status(200).send(results);
    });      
});
//#endregion Menu

//#region Users
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

router.post('/POSTUsers', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().ADDUSER);
});

router.post('/UPDTUsers', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().UPDTUSER);
});

router.get('/getUsers', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETUSERS);
});
router.post('/UsersInActive', async (req, res) => {
    const data = req.body; 
    handleRecord(req, res, data, OperationEnums().DELTUSER);
});

router.get('/getRoles', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETROLES);
});
//#endregion Users

//#region Manual Check IN/OUT
router.post('/PassCheckIn', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().PASSCHECKIN);
});
router.post('/PassCheckOut', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().PASSCHECKOUT);
});
router.post('/LaborCheckIn', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().QRCHECKIN);
});
router.post('/LaborCheckOut', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().QRCHECKOUT);
});
//#endregion Manual Check IN/OUT

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
//#region filter service
router.post('/getReqPasswithFilters', async (req, res) => {
    try {
        // Destructuring parameters from the request body
        const { OrgId, FromDate, ToDate, VisitorType, Status, AutoIncNo, UserId, RoleId } = req.body;

        // Validate OrgId
        if (!OrgId) {
            return res.status(400).json({ message: 'OrgId is required', Status: false });
        }

        // Start building the query string
        let query = `
            SELECT RequestId, VisitorName, RequestDate, CAST(MeetingDate AS DATE) AS MeetingDate,
                   FORMAT(CAST(MeetingDate AS DATE), 'dd-MM-yyyy') AS FormattedMeetingDate, 
                   NoOfMembers, VisitorType, Status, AutoIncNo, VehicleInfo, Email, Mobile, Remarks 
            FROM dbo.RequestPass 
            WHERE OrgId = ${OrgId} 
            AND IsActive = 1`;

        // Role-based filtering
        if (RoleId === 4) { // Security
            query += ` AND Status = 'APPROVED' AND MeetingDate = CAST(GETDATE() AS DATE)`;
        } else if (RoleId === 2) { // HR
            query += ` AND Status IN ('REJECTED', 'DRAFT')`;
        } else if (RoleId === 3) { // Employee
            query += ` AND CreatedBy = ${UserId}`;
        }

        // Adding optional filters dynamically
        if (FromDate != 0) {
            query += ` AND CAST(MeetingDate AS DATE) BETWEEN '${FromDate}' AND '${ToDate}'`;
        }
        if (VisitorType != 0) {
            query += ` AND VisitorType = ${VisitorType}`;
        }
        if (Status != 0) {
            query += ` AND Status = '${Status}'`;
        }
        if (AutoIncNo != 0) {
            query += ` AND AutoIncNo = '${AutoIncNo}'`;
        }

        // Append ORDER BY clause
        query += ` ORDER BY RequestId DESC`;

        // Debugging: log the constructed query
        console.log('Generated Query:', query);

        // Execute query using the constructed query string
        const results = await dbUtility.executeQuery(query);

        // Send response
        if (results && results.length > 0) {
            return res.status(200).json(results);
        } else {
            return res.status(404).json({ message: 'No records found', Status: false });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ message: 'Error fetching data', Status: false });
    }
});




router.get('/getReqPassById', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().GETREQPASSBYID);
});
router.post('/MOMSubmit', async (req, res)=>{
    const data = req.body;
    handleRecord(req, res, data, OperationEnums().MOMSUBMIT);
});
router.post('/AttendeInActive', async (req, res) => {
    const data = req.body; 
    handleRecord(req, res, data, OperationEnums().ADETAIL);
});

//#endregion ManageRequestPass


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
        if (Status.toLowerCase() === 'approved') {
            try {
                //console.log('hi');
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
});

//#endregion PassApproval&email

//#region QrCheckin

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
                SET CheckInTime = '${currentTime}', Status = 'CHECKIN', 
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
                    Status = 'PENDINGMOM', 
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
});


//#endregion QrCheckin


//#region Dashboard

router.get('/VMSDashboard', async (req, res) => {
    try {
        const { OrgId } = req.query;
        
        /*const RecentSuppliersQuery = `
        select top 5 VisitorName, CAST(MeetingDate AS Date) as MeetingDate from dbo.RequestPass
        where OrgId = ${OrgId} AND Isactive = 1 AND VisitorType = 1
        ORDER BY RequestId DESC
        `;*/
        /*const RecentCustomersQuery = `
        select top 5 VisitorName, CAST(MeetingDate AS Date) as MeetingDate from dbo.RequestPass
        where OrgId = ${OrgId} AND Isactive = 1 AND VisitorType = 2
        ORDER BY RequestId DESC
        `;*/
        /*const SuppliersCountQuery = `
        SELECT COUNT(*) AS SuppliersCount
        FROM dbo.RequestPass 
        WHERE CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) AND OrgId = ${OrgId}
        AND VisitorType = 1;
        `;*/
        /*
        const CustomersCountQuery = `
        SELECT COUNT(*) AS CustomersCount
        FROM dbo.RequestPass 
        WHERE CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) AND OrgId = ${OrgId}
        AND VisitorType = 2;
        `;*/
        const TodayActiveLaborCheckInsQuery= 
        `
        SELECT count(*) AS TodayActiveLaborCheckins FROM dbo.LaborQRPass 
         WHERE  OrgId = ${OrgId} AND Date = CAST(GETDATE() AS DATE) AND CheckIn IS NOT NULL AND CheckOut IS NULL;
        `;
        //console.log(TodayActiveLaborCheckInsQuery);
        const TodayActiveVisitorsCheckInsQuery = `
        SELECT count(*) AS TodayActiveVisitorsCheckins  FROM dbo.RequestPass 
        WHERE OrgId = ${OrgId} AND CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE) 
        AND CheckInTime IS NOT NULL AND CheckOutTime IS NULL;`;
        //console.log(TodayActiveVisitorsCheckInsQuery);
         const TodayVisitorsCountsQuery = `
        select Count(*) TodayVisitorsCountQUery from dbo.RequestPass where OrgId = ${OrgId} AND 
        CAST(MeetingDate AS DATE) = CAST(GETDATE() AS DATE)`;
        const CLsCOuntQuery = `
        SELECT SUM(RequiredPasses) AS CLsCOunt
        FROM dbo.Contractors
        WHERE OrgId = ${OrgId}
        AND ValidStartDt <= CAST(GETDATE() AS DATE)
        AND ValidEndDt >= CAST(GETDATE() AS DATE);
        `;
        const MonthWiseVisitorsCountQuery = `
        SELECT DATENAME(MONTH, MeetingDate) AS [MonthName],COUNT(RequestId) AS [VisitorCount]
        FROM [dbo].[RequestPass] WHERE OrgId = ${OrgId} AND YEAR(MeetingDate) = YEAR(GETDATE()) 
        GROUP BY DATENAME(MONTH, MeetingDate), MONTH(MeetingDate) 
        ORDER BY MONTH(MeetingDate); 
        `;
        const MonthWiseCLsCountQuery = `
        SELECT DATENAME(MONTH, [Date]) AS [MonthName],COUNT(Id) AS [CLsCount]
        FROM [dbo].[LaborQRPass] WHERE OrgId = ${OrgId} AND YEAR(Date) = YEAR(GETDATE()) 
        GROUP BY DATENAME(MONTH, Date), MONTH(Date) 
        ORDER BY MONTH(Date); 
        `;
       

        const [
          
            TodayActiveLaborCheckIns,
            TodayVisitorsCounts,
            TodayActiveVisitorsCheckIns,
            TodayCLsCount,
            MonthWiseVisitorsCount,
            MonthWiseCLsCount
        ] = await Promise.all([ 
            dbUtility.executeQuery(TodayActiveLaborCheckInsQuery),
            dbUtility.executeQuery(TodayVisitorsCountsQuery),
            dbUtility.executeQuery(TodayActiveVisitorsCheckInsQuery ),
            dbUtility.executeQuery(CLsCOuntQuery),
            dbUtility.executeQuery(MonthWiseVisitorsCountQuery),
            dbUtility.executeQuery(MonthWiseCLsCountQuery)
            
           
        ]);
        res.json({
            TodayActiveLaborCheckIns,
            TodayVisitorsCounts,
            TodayActiveVisitorsCheckIns,
            TodayCLsCount,
            MonthWiseVisitorsCount,
            MonthWiseCLsCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/getActiveCheckIns', (req, res) => {
    const data = req.query; 
    handleRecord(req, res, data, OperationEnums().LABORCHECKINS);
});
//#endregion Dashboard

module.exports = router;
