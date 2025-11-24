const mysql = require('mysql2/promise');

let pool;

const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    user: process.env.DB_USER || 'user_agendamiento',
    password: process.env.DB_PASSWORD || 'pass_agendamiento',
    database: process.env.DB_NAME || 'db_agendamiento',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00',
    dateStrings: true
};

async function initializePool() {
    try {
        pool = mysql.createPool(config);
        const connection = await pool.getConnection();
        console.log('✅ Conectado a MySQL (Agendamiento)');
        connection.release();
    } catch (error) {
        console.error('❌ Error conectando a MySQL:', error.message);
        throw error;
    }
}

function getPool() {
    if (!pool) {
        throw new Error('Pool no inicializado. Llama a initializePool() primero.');
    }
    return pool;
}

module.exports = { initializePool, getPool };
