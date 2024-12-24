function OperationEnums() {
    const Operations = {
        SIGNIN:1,
        GETREQPASS:2,
        GETREQPASSBYID:3,
        ADETAIL:4,
        CONTINSRT:5,
        GETCONTRACT:6,
        GETQRPASS:7,
        GETSHFTTIMES:8,
        UPDTCONTRACT:9,
        ADDUSER:10,
        UPDTUSER:11,
        MOMSUBMIT:12,
        GETUSERS:13,
        DELTUSER:14,
        PASSCHECKIN:15,
        PASSCHECKOUT:16,
        QRCHECKIN:17,
        QRCHECKOUT:18,
        GETROLES:19,
        RSECURSEL:20,
        GETREPORTHEAD:21
    };

    return Operations;
}

module.exports = {
    OperationEnums
};
