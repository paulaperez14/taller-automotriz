const mysql = require('mysql2/promise');

let pool;

const initializePool = async () => {
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
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL (Reparaciones)');
        connection.release();
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        throw error;
    }
};

const getPool = () => {
    if (!pool) {
        throw new Error('Pool no inicializado. Llama a initializePool() primero.');
    }
    return pool;
};

module.exports = {
    initializePool,
    getPool
};
