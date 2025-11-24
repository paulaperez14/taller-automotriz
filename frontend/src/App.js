import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import ClienteLayout from './components/ClienteLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Vehiculos from './pages/Vehiculos';
import Citas from './pages/Citas';
import Ordenes from './pages/Ordenes';
import Repuestos from './pages/Repuestos';
import Servicios from './pages/Servicios';
import AgendarCita from './pages/AgendarCita';

// Páginas del mecánico
import ClientesMecanico from './pages/mecanico/ClientesMecanico';
import VehiculosMecanico from './pages/mecanico/VehiculosMecanico';
import CitasMecanico from './pages/mecanico/CitasMecanico';
import OrdenesMecanico from './pages/mecanico/OrdenesMecanico';
import RepuestosMecanico from './pages/mecanico/RepuestosMecanico';

// Páginas del cliente
import HistorialCliente from './pages/cliente/HistorialCliente';

import './App.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/agendar-cita" element={<AgendarCita />} />

                    {/* Rutas protegidas (admin) - Solo lectura */}
                    <Route path="/admin" element={<PrivateRoute allowedRoles={['ADMINISTRADOR']}><Layout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="clientes" element={<Clientes />} />
                        <Route path="vehiculos" element={<Vehiculos />} />
                        <Route path="citas" element={<Citas />} />
                        <Route path="ordenes" element={<Ordenes />} />
                        <Route path="servicios" element={<Servicios />} />
                        <Route path="repuestos" element={<Repuestos />} />
                    </Route>

                    {/* Rutas protegidas (mecánico) - CRUD completo */}
                    <Route path="/mecanico" element={<PrivateRoute allowedRoles={['MECANICO']}><Layout userRole="MECANICO" /></PrivateRoute>}>
                        <Route index element={<Navigate to="/mecanico/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="clientes" element={<ClientesMecanico />} />
                        <Route path="vehiculos" element={<VehiculosMecanico />} />
                        <Route path="citas" element={<CitasMecanico />} />
                        <Route path="ordenes" element={<OrdenesMecanico />} />
                        <Route path="servicios" element={<Servicios />} />
                        <Route path="repuestos" element={<RepuestosMecanico />} />
                    </Route>

                    {/* Rutas protegidas (cliente) */}
                    <Route path="/cliente" element={<PrivateRoute allowedRoles={['CLIENTE']}><ClienteLayout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/cliente/historial" replace />} />
                        <Route path="historial" element={<HistorialCliente />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
