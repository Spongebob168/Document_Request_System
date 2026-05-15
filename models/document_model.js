const pool = require('../config/db');

const getDocumentTypes = async () => {

    const result = await pool.query(
        `
        SELECT *
        FROM drs.document_types
        WHERE is_deleted = FALSE
        `
    );

    return result.rows;
};

module.exports = {
    getDocumentTypes
};