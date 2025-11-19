const mysql = require('mysql2/promise');

let pool;

const connectDatabase = async () => {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Test connection
        await pool.query('SELECT 1');
        return pool;
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call connectDatabase first.');
    }
    return pool;
};

module.exports = {
    connectDatabase,
    getPool
};
