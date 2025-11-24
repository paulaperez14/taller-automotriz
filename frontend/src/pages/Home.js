import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const servicios = [
        {
            id: 1,
            icono: '🔧',
            titulo: 'Mantenimiento Preventivo',
            descripcion: 'Revisión completa de tu vehículo para evitar problemas futuros.',
            precio: 'Desde $150.000'
        },
        {
            id: 2,
            icono: '🛠️',
            titulo: 'Reparación',
            descripcion: 'Reparación profesional de cualquier componente de tu vehículo.',
            precio: 'Desde $200.000'
        },
        {
            id: 3,
            icono: '🔍',
            titulo: 'Diagnóstico',
            descripcion: 'Escaneo computarizado para identificar problemas.',
            precio: 'Desde $80.000'
        },
        {
            id: 4,
            icono: '📋',
            titulo: 'Revisión Técnica',
            descripcion: 'Preparación y apoyo para la revisión técnico-mecánica.',
            precio: 'Desde $100.000'
        },
        {
            id: 5,
            icono: '🛢️',
            titulo: 'Cambio de Aceite',
            descripcion: 'Cambio de aceite y filtros con productos de calidad.',
            precio: 'Desde $120.000'
        },
        {
            id: 6,
            icono: '⚙️',
            titulo: 'Alineación y Balanceo',
            descripcion: 'Alineación de dirección y balanceo de llantas.',
            precio: 'Desde $80.000'
        },
        {
            id: 7,
            icono: '🛑',
            titulo: 'Sistema de Frenos',
            descripcion: 'Revisión y reparación completa del sistema de frenos.',
            precio: 'Desde $200.000'
        },
        {
            id: 8,
            icono: '🚗',
            titulo: 'Suspensión',
            descripcion: 'Mantenimiento y reparación de amortiguadores y suspensión.',
            precio: 'Desde $250.000'
        },
        {
            id: 9,
            icono: '⚡',
            titulo: 'Sistema Eléctrico',
            descripcion: 'Diagnóstico y reparación eléctrica y electrónica.',
            precio: 'Desde $150.000'
        }
    ];

    const caracteristicas = [
        { icono: '✓', texto: 'Técnicos certificados con más de 10 años de experiencia' },
        { icono: '✓', texto: 'Equipos de última tecnología para diagnóstico' },
        { icono: '✓', texto: 'Garantía en todos nuestros servicios' },
        { icono: '✓', texto: 'Repuestos originales y de calidad' },
        { icono: '✓', texto: '4 sedes en diferentes puntos de la ciudad' },
        { icono: '✓', texto: 'Sistema de reservas en línea 24/7' }
    ];

    return (
        <div className="home-container">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-overlay">
                    <div className="hero-content">
                        <h1 className="hero-title">🚗 Taller Automotriz</h1>
                        <p className="hero-subtitle">Tu vehículo en las mejores manos</p>
                        <p className="hero-description">
                            Servicio profesional de mantenimiento y reparación con más de 15 años de experiencia
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-hero btn-primary" onClick={() => navigate('/agendar-cita')}>
                                📅 Reservar Cita
                            </button>
                            <button className="btn-hero btn-secondary" onClick={() => navigate('/login')}>
                                🔐 Iniciar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Características */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">¿Por qué elegirnos?</h2>
                    <div className="features-grid">
                        {caracteristicas.map((item, index) => (
                            <div key={index} className="feature-item">
                                <span className="feature-icon">{item.icono}</span>
                                <p>{item.texto}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Servicios */}
            <section className="services-section">
                <div className="container">
                    <h2 className="section-title">Nuestros Servicios</h2>
                    <p className="section-subtitle">Ofrecemos una amplia gama de servicios para tu vehículo</p>
                    <div className="services-grid">
                        {servicios.map((servicio) => (
                            <div key={servicio.id} className="service-card">
                                <div className="service-icon">{servicio.icono}</div>
                                <h3 className="service-title">{servicio.titulo}</h3>
                                <p className="service-description">{servicio.descripcion}</p>
                                <p className="service-price">{servicio.precio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sedes */}
            <section className="locations-section">
                <div className="container">
                    <h2 className="section-title">Nuestras Sedes</h2>
                    <div className="locations-grid">
                        <div className="location-card">
                            <h3>📍 Sede Norte</h3>
                            <p>Calle 100 # 15-30, Bogotá</p>
                            <p>📞 (601) 234-5678</p>
                        </div>
                        <div className="location-card">
                            <h3>📍 Sede Sur</h3>
                            <p>Carrera 30 # 45-20, Bogotá</p>
                            <p>📞 (601) 234-5679</p>
                        </div>
                        <div className="location-card">
                            <h3>📍 Sede Occidente</h3>
                            <p>Avenida 68 # 25-10, Bogotá</p>
                            <p>📞 (601) 234-5680</p>
                        </div>
                        <div className="location-card">
                            <h3>📍 Sede Oriente</h3>
                            <p>Calle 45 # 70-15, Bogotá</p>
                            <p>📞 (601) 234-5681</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Horarios */}
            <section className="schedule-section">
                <div className="container">
                    <h2 className="section-title">Horarios de Atención</h2>
                    <div className="schedule-content">
                        <div className="schedule-item">
                            <strong>Lunes a Viernes:</strong> 8:00 AM - 5:00 PM
                        </div>
                        <div className="schedule-item">
                            <strong>Sábados y Domingos:</strong> 8:00 AM - 4:00 PM
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="cta-section">
                <div className="container">
                    <h2>¿Listo para agendar tu servicio?</h2>
                    <p>Reserva tu cita en línea en menos de 2 minutos</p>
                    <button className="btn-cta" onClick={() => navigate('/agendar-cita')}>
                        Agendar Cita Ahora
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>&copy; 2025 Taller Automotriz. Todos los derechos reservados.</p>
                    <p>Sistema de Gestión Integral</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
