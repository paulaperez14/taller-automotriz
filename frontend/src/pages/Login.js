import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar error anterior solo cuando se intenta de nuevo
        setLoading(true);

        try {
            const response = await login(email, password);

            // Redirigir según el rol del usuario
            const userRole = response.usuario?.rol;
            if (userRole === 'MECANICO') {
                navigate('/mecanico/dashboard');
            } else if (userRole === 'ADMINISTRADOR') {
                navigate('/admin/dashboard');
            } else if (userRole === 'CLIENTE') {
                navigate('/cliente/historial');
            } else {
                navigate('/admin/dashboard'); // Default
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.error || 'Credenciales inválidas. Por favor verifica tu email y contraseña.');
            console.log('Login error:', err);
            return; // Evitar que continúe el flujo
        }

        setLoading(false);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>🚗 Taller Automotriz</h1>
                    <p>Sistema de Gestión</p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError(''); // Limpiar error al escribir
                            }}
                            placeholder="correo@ejemplo.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError(''); // Limpiar error al escribir
                            }}
                            placeholder="********"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <div className="login-footer">
                    <p><strong>Usuarios de prueba:</strong></p>
                    <p>👨‍💼 Admin: admin@taller.com / admin123</p>
                    <p>🔧 Mecánico: mecanico@taller.com / admin123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
