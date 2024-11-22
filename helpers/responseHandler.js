function handleResponse(res, error, results) {
    if (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } else {
        if (results && results.length > 0) {
            res.json({
                ResultData: results,
                Status: true
            });
        } else {
            res.status(200).json({ error: 'No records found', Status: false });
        }
    }
}



module.exports = {
    handleResponse
};
