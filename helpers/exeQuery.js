const dbUtility = require('../dbUtility');


class exeQuery {

    //#region ManageRequestPass
    SpManageRequestPass(TotJson, callback) {
        if (!TotJson) {
            return callback(new Error('TotJson is undefined'));
        }
    
        const { orgid, userid, Operation, RequestPass, Attendees } = TotJson;
        const RequestPassJSON = JSON.stringify(RequestPass);
        const AttendeesJSON = JSON.stringify(Attendees);
    
        const sqlQuery = `
            EXEC [dbo].[SP_ManageRequestPass]
                @orgid = '${orgid}',
                @userid = '${userid}',
                @Operation = '${Operation}',
                @RequestPass = N'${RequestPassJSON.replace(/'/g, "''")}',
                @Attendees = N'${AttendeesJSON.replace(/'/g, "''")}'
        `;
        console.log(sqlQuery);
        dbUtility.executeQuery(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }
    //#endregion ManageRequestPass
    
    

    //#region ScreenOperations
    Execute_SP(data, OperationId, callback) {
        //console.log(data);
        const sqlQuery = `
        DECLARE @ResultMessage NVARCHAR(MAX);
        DECLARE @STATUS NVARCHAR(MAX); -- Corrected declaration
        EXEC [dbo].[SP_ScreenOperations]
            @OperationId = '${OperationId}',
            @JsonData = '${data}',
            @ResultMessage = @ResultMessage OUTPUT,
            @STATUS = @STATUS OUTPUT; -- Passing @STATUS as an output parameter
        SELECT @ResultMessage AS ResultMessage, @STATUS AS Status; -- Retrieving both output parameters
        `;
        console.log(sqlQuery);
        dbUtility.executeQuery(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }
    //#region ScreenOperations
   


}

module.exports = new exeQuery();