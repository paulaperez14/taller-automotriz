import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ userRole }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Determinar el rol actual (de props o de user)
    const currentRole = userRole || user?.rol || 'ADMINISTRADOR';
    const baseRoute = currentRole === 'MECANICO' ? '/mecanico' : '/admin';
    const roleLabel = currentRole === 'MECANICO' ? 'Mecánico' : 'Administrador';

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="layout">
            <nav className="navbar">
                <div className="navbar-brand">
                    <h1>🚗 Taller Automotriz</h1>
                </div>
                <div className="navbar-user">
                    <span className={`role-badge ${currentRole === 'MECANICO' ? 'role-badge-mecanico' : 'role-badge-admin'}`}>
                        {roleLabel}
                    </span>
                    <span>Hola, {user?.username || user?.email}</span>
                    <button onClick={handleLogout} className="btn btn-secondary">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <div className="layout-container">
                <aside className="sidebar">
                    <ul className="menu">
                        <li>
                            <Link to={`${baseRoute}/dashboard`}>📊 Dashboard</Link>
                        </li>
                        <li>
                            <Link to={`${baseRoute}/clientes`}>👥 Clientes</Link>
                        </li>
                        <li>
                            <Link to={`${baseRoute}/vehiculos`}>🚙 Vehículos</Link>
                        </li>
                        <li>
                            <Link to={`${baseRoute}/citas`}>📅 Citas</Link>
                        </li>
                        <li>
                            <Link to={`${baseRoute}/ordenes`}>🔧 Órdenes de Servicio</Link>
                        </li>
                        <li>
                            <Link to={`${baseRoute}/servicios`}>🛠️ Servicios</Link>
                        </li>
                        <li>
                            <Link to={`${baseRoute}/repuestos`}>⚙️ Repuestos</Link>
                        </li>
                    </ul>
                </aside>

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
