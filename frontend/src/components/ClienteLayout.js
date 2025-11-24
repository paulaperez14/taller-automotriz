import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { clienteService } from '../services';
import './Layout.css';

const ClienteLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [clienteNombre, setClienteNombre] = useState('Cliente');

    useEffect(() => {
        const cargarDatosCliente = async () => {
            if (user?.usuario_id) {
                try {
                    const response = await clienteService.getById(user.usuario_id);
                    const cliente = response.data.data || response.data;
                    setClienteNombre(`${cliente.nombres} ${cliente.apellidos}`);
                } catch (error) {
                    console.error('Error cargando datos del cliente:', error);
                    setClienteNombre(user.username);
                }
            }
        };
        cargarDatosCliente();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="cliente-layout">
            <aside className="cliente-sidebar-left">
                <div className="sidebar-brand">
                    <span className="brand-icon">🚗</span>
                    <div className="brand-text">
                        <h2>Taller Automotriz</h2>
                        <p>Portal del Cliente</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link to="/cliente/historial" className="sidebar-nav-link">
                        <span className="nav-icon">📋</span>
                        <span>Mi Historial</span>
                    </Link>
                    <Link to="/agendar-cita" className="sidebar-nav-link">
                        <span className="nav-icon">📅</span>
                        <span>Agendar Cita</span>
                    </Link>
                </nav>

                <div className="sidebar-user-section">
                    <div className="sidebar-user-info">
                        <div className="user-avatar">👤</div>
                        <div className="user-text">
                            <span className="user-role-badge">CLIENTE</span>
                            <p className="username">{clienteNombre}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="sidebar-logout-btn">
                        🚪 Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main className="cliente-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default ClienteLayout;
