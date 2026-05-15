const pool = require('./config/db');

async function testDB() {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Database connected');
        console.log(res.rows);
    } catch (err) {
        console.error(err.message);
    } finally {
        pool.end();
    }
}

testDB();