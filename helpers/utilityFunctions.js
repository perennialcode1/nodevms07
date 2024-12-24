

function headertoRptHeader(jsondata)
{
    const headerinfo = jsondata.map(row => Object.values(row));
    const columnHeaderString = headerinfo[0][0];
    // Split the string into an array of values
    const headers = columnHeaderString.split(',');
    console.log(headers);
    return headers;
}
module.exports = {
    headertoRptHeader
}