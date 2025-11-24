const axios = require('axios');

const usuarios = [
    {
        username: 'test123',
        password: '123',
        email: 'test@gmail.com',
        rol: 'CLIENTE'
    },
    {
        username: '11111111',
        password: '1111',
        email: '111@gmail.com',
        rol: 'CLIENTE'
    },
    {
        username: 'jesus8658',
        password: '1103738658',
        email: 'jesus.castillor@cecar.edu.co',
        rol: 'CLIENTE'
    }
];

async function crearUsuarios() {
    for (const user of usuarios) {
        try {
            const response = await axios.post('http://localhost:3001/api/register', user);
            console.log(`✅ Usuario creado: ${user.username} - Email: ${user.email}`);
        } catch (error) {
            if (error.response?.data?.error?.includes('ya existe')) {
                console.log(`ℹ️  Usuario ya existe: ${user.username}`);
            } else {
                console.error(`❌ Error creando ${user.username}:`, error.response?.data || error.message);
            }
        }
    }
}

crearUsuarios().then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
}).catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
