const dbUtility = require('../dbUtility');


class exeQuery {

    GetMenu(JsonData, callback) {
        /*const sqlQuery = `
            SELECT *
        FROM V_RoleMenu
        WHERE RoleId = ${JsonData.RoleId} AND (OrgId = ${JsonData.OrgId} OR OrgId = 9333);
        `;*/
        const sqlQuery = `SELECT * FROM V_RoleMenu WHERE RoleId = ${JsonData.RoleId} AND OrgId = ${JsonData.OrgId} AND IsActive = 1 
        AND EXISTS (SELECT 1 FROM RoleMenu WHERE OrgId =  ${JsonData.OrgId} AND RoleId = ${JsonData.RoleId})
        UNION ALL
        SELECT * FROM V_RoleMenu WHERE RoleId = ${JsonData.RoleId}  AND OrgId = 9333 AND IsActive = 1
        AND NOT EXISTS (SELECT 1 FROM RoleMenu WHERE OrgId =  ${JsonData.OrgId} AND RoleId = ${JsonData.RoleId}) ORDER BY SortOrder;`;
        console.log(sqlQuery);
        dbUtility.executeQuery(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }
    
    GetMenuNodes(results,callback){
        if (!results || results.length === 0) {
            return callback(new Error('no Results'));
        }
        const menuNodes = this.buildMenuHierarchy(results);
        // Output the menu Nodes as JSON
        callback(null, menuNodes);
    }
    
    // Function to build menu hierarchy supporting multiple sublevels
    buildMenuHierarchy(menuItems) {
        // Step 1: Lookup object for all menu items by their AppMenuId
        const menuLookup = {};
        menuItems.forEach(menu => {
        menuLookup[menu.AppMenuId] = { 
            AppMenuId: menu.AppMenuId, 
            ReportId: menu.ReportId,
            MenuName: menu.MenuName,
            MenuPath: menu.MenuPath,
            IconName: menu.IconName,
            SubItems: [] };
        });
    
        // Step 2: Organize the items into the correct hierarchy
        const rootMenus = [];
    
        menuItems.forEach(menu => {
        if (menu.ParentId === 0) {
            // It's a root menu
            rootMenus.push(menuLookup[menu.AppMenuId]);
        } else {
            // It's a child, so add it to its parent's SubItems array
            if (menuLookup[menu.ParentId]) {
            menuLookup[menu.ParentId].SubItems.push(menuLookup[menu.AppMenuId]);
            }
        }
        });
        return rootMenus; // Return the structured menu hierarchy
    }

    SpSetRoleSecurity(TotJson, callback) {
        if (!TotJson) {
            return callback(new Error('RoleSecurity is undefined'));
        }
        const { orgid, RoleId, MenuId, IsChecked, CanWrite, CanDelete, CanExport, UpdatedBy } = TotJson;
        console.log(TotJson);

        const sqlQuery = `
            EXEC [dbo].[SP_SetRoleSecurity]
            @orgid = '${orgid}',
            @RoleId = '${RoleId}',
            @MenuId = '${MenuId}',
            @IsChecked = '${IsChecked}',
            @CanWrite = '${CanWrite}',
            @CanDelete = '${CanDelete}',
            @CanExport = '${CanExport}',
            @UpdatedBy = '${UpdatedBy}'
        `;

        console.log('sqlQuery:', sqlQuery);

        dbUtility.executeQuery(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }

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

    //#region ManageLaborQRPass
    SpManageLaborQRPass(TotJson, callback) {
        if (!TotJson) {
            return callback(new Error('TotJson is undefined'));
        }

        const { orgid, userid, Time, Date, QRCode, ContractorId } = TotJson;
        
        // Validate required fields
        if (!Time || !Date || !QRCode || !ContractorId) {
            return callback(new Error('Missing required fields: Time, Date, QRCode, ContractorId'));
        }

        const sqlQuery = `
            EXEC [dbo].[ManageLaborQRPass]
                @Time = '${Time}',
                @UserId = '${userid}',
                @Date = '${Date}',
                @QRCode = '${QRCode.replace(/'/g, "''")}',
                @ContractorId = '${ContractorId}',
                @OrgId = '${orgid}'
        `;
        
        console.log(sqlQuery);
        dbUtility.executeQuery(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }
    //#endregion ManageLaborQRPass

    
    

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

    Exec_SpReport(rptJson, callback) {
        if (!rptJson) {
            return callback(new Error('Report Params is undefined'));
        }
        const { OrgId, UserId, ReportId, ReportCriteria } = rptJson;
        console.log(rptJson);
        const ReportJSON = JSON.stringify(ReportCriteria);
        console.log(ReportJSON);
        const sqlQuery = `
            EXEC [dbo].[Sp_GenerateReport]
            @OrgId = '${OrgId}',
            @Userid = '${UserId}',
            @ReportId = '${ReportId}',
            @ReportCritieria = N'${ReportJSON.replace(/'/g, "''")}'
        `;

        console.log('sqlQuery:', sqlQuery);

        dbUtility.executeForMultipleDS(sqlQuery)
            .then(results => callback(null, results))
            .catch(callback);
    }
   


}

module.exports = new exeQuery();
