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
        await connection.ping();
        connection.release();

        console.log('✅ Pool de conexiones MySQL inicializado');
        return pool;
    } catch (error) {
        console.error('❌ Error al conectar con MySQL:', error.message);
        throw error;
    }
};

const getConnection = async () => {
    if (!pool) {
        throw new Error('Pool no inicializado. Llama a initializePool primero.');
    }
    return await pool.getConnection();
};

const getPool = () => {
    if (!pool) {
        throw new Error('Database not initialized. Call initializePool first.');
    }
    return pool;
};

module.exports = {
    initializePool,
    getConnection,
    getPool
};
