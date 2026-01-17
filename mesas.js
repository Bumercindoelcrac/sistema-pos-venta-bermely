/**
 * BER-MELY POS - Gestión REAL de Mesas
 * Sistema completo para manejar las 12 mesas en tiempo real
 */

class SistemaMesas {
    constructor() {
        this.mesas = [];
        this.mesaSeleccionada = null;
        this.intervaloActualizacion = null;
        this.inicializar();
    }
    
    inicializar() {
        this.cargarMesas();
        
        // Actualizar cada 3 segundos
        this.intervaloActualizacion = setInterval(() => this.cargarMesas(), 3000);
        
        // Escuchar eventos
        window.addEventListener('bermelyNotificacion', (e) => {
            this.manejarNotificacion(e.detail);
        });
    }
    
    cargarMesas() {
        if (!window.BermelyDB) {
            console.error('Base de datos no disponible');
            return;
        }
        
        this.mesas = window.BermelyDB.obtenerMesas();
        this.actualizarUI();
    }
    
    actualizarUI() {
        // Actualizar contadores
        this.actualizarContadores();
        
        // Actualizar grid de mesas
        this.actualizarGridMesas();
        
        // Actualizar información de mesa seleccionada
        if (this.mesaSeleccionada) {
            this.actualizarInfoMesaSeleccionada();
        }
        
        // Actualizar notificaciones
        this.actualizarNotificaciones();
    }
    
    actualizarContadores() {
        const total = this.mesas.length;
        const ocupadas = this.mesas.filter(m => m.estado !== 'libre').length;
        const libres = total - ocupadas;
        const porCobrar = this.mesas.filter(m => m.estado === 'por_cobrar').length;
        
        // Actualizar elementos en la UI
        ['totalMesas', 'mesasOcupadas', 'mesasLibres', 'porCobrar'].forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) {
                const valores = [total, ocupadas, libres, porCobrar];
                element.textContent = valores[index];
            }
        });
    }
    
    actualizarGridMesas() {
        const container = document.getElementById('mesasGrid');
        if (!container) return;
        
        let html = '';
        
        // Renderizar las 10 mesas normales
        for (let i = 1; i <= 10; i++) {
            const mesaId = `mesa${i}`;
            const mesa = this.mesas.find(m => m.id === mesaId) || {
                id: mesaId,
                nombre: `Mesa ${i}`,
                estado: 'libre',
                cliente: '',
                total: 0
            };
            
            html += this.crearTarjetaMesa(mesa);
        }
        
        // Renderizar mesas especiales
        const mesasEspeciales = ['llevar', 'envios'];
        mesasEspeciales.forEach(id => {
            const mesa = this.mesas.find(m => m.id === id) || {
                id: id,
                nombre: id === 'llevar' ? 'PARA LLEVAR' : 'ENVÍOS',
                estado: 'libre',
                cliente: '',
                total: 0
            };
            
            html += this.crearTarjetaMesa(mesa, true);
        });
        
        container.innerHTML = html;
    }
    
    crearTarjetaMesa(mesa, especial = false) {
        const estadoConfig = this.obtenerConfiguracionEstado(mesa.estado);
        const numero = especial ? 
            (mesa.id === 'llevar' ? '🚗' : '🏍️') : 
            mesa.nombre.replace('Mesa ', '');
        
        return `
            <div class="mesa-card ${estadoConfig.clase}" onclick="SistemaMesasInstancia.seleccionarMesa('${mesa.id}')">
                <div class="mesa-numero">${numero}</div>
                <div class="mesa-estado" style="background: ${estadoConfig.color}; color: white;">
                    ${estadoConfig.texto}
                </div>
                <div class="mesa-cliente">${mesa.cliente || '-'}</div>
                <div class="mesa-total">$${(mesa.total || 0).toFixed(2)}</div>
                ${mesa.comensales > 0 ? `<div class="mesa-comensales">👥 ${mesa.comensales}</div>` : ''}
            </div>
        `;
    }
    
    obtenerConfiguracionEstado(estado) {
        const configuraciones = {
            'libre': { texto: 'LIBRE', color: '#10b981', clase: 'libre' },
            'ocupada': { texto: 'OCUPADA', color: '#ef4444', clase: 'ocupada' },
            'en_preparacion': { texto: 'EN PREPARACIÓN', color: '#f59e0b', clase: 'preparacion' },
            'listo': { texto: 'LISTO', color: '#3b82f6', clase: 'listo' },
            'por_cobrar': { texto: 'POR COBRAR', color: '#8b5cf6', clase: 'por-cobrar' }
        };
        
        return configuraciones[estado] || configuraciones['libre'];
    }
    
    seleccionarMesa(mesaId) {
        const mesa = this.mesas.find(m => m.id === mesaId);
        if (!mesa) {
            console.error('Mesa no encontrada:', mesaId);
            return;
        }
        
        // Si la mesa está libre, abrir modal para asignar cliente
        if (mesa.estado === 'libre') {
            this.mostrarModalAbrirMesa(mesa);
            return;
        }
        
        // Si ya está ocupada, seleccionarla
        this.mesaSeleccionada = mesa;
        this.mostrarDetallesMesa(mesa);
        
        // En móviles, mostrar carrito
        if (window.innerWidth <= 768) {
            const carritoSection = document.getElementById('carritoSection');
            if (carritoSection) {
                carritoSection.classList.add('active');
            }
        }
        
        // Disparar evento
        window.dispatchEvent(new CustomEvent('mesaSeleccionada', { detail: mesa }));
    }
    
    mostrarModalAbrirMesa(mesa) {
        const modalHTML = `
            <div class="modal-abrir-mesa" id="modalAbrirMesa">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-door-open"></i> Abrir ${mesa.nombre}</h3>
                        <button class="close-modal" onclick="SistemaMesasInstancia.cerrarModalAbrirMesa()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="nombreCliente">
                                <i class="fas fa-user"></i> Nombre del cliente
                            </label>
                            <input type="text" id="nombreCliente" placeholder="Ej: Familia Rodríguez" autofocus>
                        </div>
                        
                        <div class="form-group">
                            <label for="numeroPersonas">
                                <i class="fas fa-users"></i> Número de personas
                            </label>
                            <input type="number" id="numeroPersonas" value="2" min="1" max="${mesa.capacidad || 6}">
                        </div>
                        
                        <div class="form-group">
                            <label for="notaMesa">
                                <i class="fas fa-sticky-note"></i> Nota (opcional)
                            </label>
                            <textarea id="notaMesa" placeholder="Ej: Mesa cerca de la ventana, sin picante, etc."></textarea>
                        </div>
                        
                        <div class="modal-actions">
                            <button class="btn-cancelar" onclick="SistemaMesasInstancia.cerrarModalAbrirMesa()">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button class="btn-confirmar" onclick="SistemaMesasInstancia.confirmarAbrirMesa('${mesa.id}')">
                                <i class="fas fa-check"></i> Abrir Mesa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar modal al documento
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        // Aplicar estilos
        this.aplicarEstilosModal();
    }
    
    aplicarEstilosModal() {
        const style = document.createElement('style');
        style.textContent = `
            .modal-abrir-mesa {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .modal-abrir-mesa .modal-content {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 400px;
                animation: slideUp 0.3s;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .modal-header h3 {
                color: #1e293b;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #64748b;
                float: right;
            }
            
            .modal-body {
                padding: 20px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 8px;
                color: #4a5568;
                font-weight: 600;
            }
            
            .form-group input,
            .form-group textarea {
                width: 100%;
                padding: 12px;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                font-size: 16px;
            }
            
            .modal-actions {
                display: flex;
                gap: 10px;
                margin-top: 30px;
            }
            
            .modal-actions button {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .btn-cancelar {
                background: #e2e8f0;
                color: #64748b;
            }
            
            .btn-confirmar {
                background: #4f46e5;
                color: white;
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    cerrarModalAbrirMesa() {
        const modal = document.getElementById('modalAbrirMesa');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }
    
    confirmarAbrirMesa(mesaId) {
        const cliente = document.getElementById('nombreCliente')?.value?.trim();
        const personas = document.getElementById('numeroPersonas')?.value || '2';
        const nota = document.getElementById('notaMesa')?.value?.trim();
        
        if (!cliente) {
            this.mostrarAlerta('Por favor ingresa el nombre del cliente', 'error');
            return;
        }
        
        // Obtener mesero actual
        const userData = JSON.parse(localStorage.getItem('bermely_user_data') || '{}');
        const mesero = userData.nombre || userData.username || 'Mesero';
        
        // Abrir mesa usando la base de datos
        const exito = window.BermelyDB.abrirMesa(mesaId, cliente, mesero, parseInt(personas), nota);
        
        if (exito) {
            this.mostrarAlerta(`${mesaId.replace('mesa', 'Mesa ')} abierta para ${cliente}`, 'success');
            this.cerrarModalAbrirMesa();
            
            // Recargar y seleccionar la mesa
            setTimeout(() => {
                this.cargarMesas();
                this.seleccionarMesa(mesaId);
            }, 500);
        } else {
            this.mostrarAlerta('Error al abrir la mesa', 'error');
        }
    }
    
    mostrarDetallesMesa(mesa) {
        // Actualizar elementos de la UI
        const elementos = {
            'selectedMesaTitle': mesa.nombre,
            'selectedMesaClient': mesa.cliente || 'Sin cliente',
            'selectedMesaIcon': mesa.nombre.includes('Mesa') ? 
                mesa.nombre.replace('Mesa ', '') : 
                mesa.id === 'llevar' ? '🚗' : '🏍️',
            'selectedMesero': mesa.mesero || 'Sin asignar',
            'selectedMesaTime': mesa.horaApertura ? 
                this.calcularTiempoTranscurrido(mesa.horaApertura) : 'Nueva',
            'selectedMesaComensales': mesa.comensales > 0 ? `👥 ${mesa.comensales} personas` : ''
        };
        
        Object.keys(elementos).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elementos[id];
            }
        });
        
        // Actualizar carrito
        this.actualizarCarritoMesa(mesa);
    }
    
    actualizarCarritoMesa(mesa) {
        const container = document.getElementById('cartItems');
        const subtotalEl = document.getElementById('subtotal');
        const ivaEl = document.getElementById('iva');
        const totalEl = document.getElementById('total');
        
        if (!container || !subtotalEl) return;
        
        let html = '';
        let subtotal = 0;
        
        if (mesa.carrito && mesa.carrito.length > 0) {
            mesa.carrito.forEach(item => {
                const precioItem = item.precio || 0;
                const extrasTotal = item.extras ? 
                    item.extras.reduce((sum, extra) => sum + (extra.precio || 0), 0) : 0;
                const totalItem = (precioItem + extrasTotal) * (item.cantidad || 1);
                
                subtotal += totalItem;
                
                const estadoColor = this.obtenerColorEstadoItem(item.estado);
                
                html += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-header">
                            <div class="item-nombre">${item.nombre}</div>
                            <div class="item-estado" style="background: ${estadoColor}">
                                ${this.obtenerTextoEstadoItem(item.estado)}
                            </div>
                        </div>
                        
                        <div class="item-detalles">
                            <div class="item-cantidad">Cantidad: ${item.cantidad || 1}</div>
                            <div class="item-precio">$${totalItem.toFixed(2)}</div>
                        </div>
                        
                        ${item.extras && item.extras.length > 0 ? `
                            <div class="item-extras">
                                <strong>Extras:</strong> ${item.extras.map(e => e.nombre).join(', ')}
                            </div>
                        ` : ''}
                        
                        ${item.comentario ? `
                            <div class="item-comentario">
                                <i class="fas fa-comment"></i> ${item.comentario}
                            </div>
                        ` : ''}
                        
                        <div class="item-acciones">
                            ${item.estado === 'pendiente' ? `
                                <button class="btn-editar" onclick="SistemaMesasInstancia.editarItem('${item.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-eliminar" onclick="SistemaMesasInstancia.eliminarItem('${item.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
        } else {
            html = `
                <div class="carrito-vacio">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Carrito vacío</p>
                    <small>Agrega productos del menú</small>
                </div>
            `;
        }
        
        const iva = subtotal * 0.16;
        const total = subtotal + iva;
        
        container.innerHTML = html;
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        ivaEl.textContent = `$${iva.toFixed(2)}`;
        totalEl.textContent = `$${total.toFixed(2)}`;
    }
    
    obtenerColorEstadoItem(estado) {
        const colores = {
            'pendiente': '#f59e0b',
            'en_preparacion': '#3b82f6',
            'listo': '#10b981',
            'entregado': '#64748b'
        };
        return colores[estado] || '#64748b';
    }
    
    obtenerTextoEstadoItem(estado) {
        const textos = {
            'pendiente': 'PENDIENTE',
            'en_preparacion': 'EN PREPARACIÓN',
            'listo': 'LISTO',
            'entregado': 'ENTREGADO'
        };
        return textos[estado] || estado;
    }
    
    editarItem(itemId) {
        // Implementar edición de item
        this.mostrarAlerta('Función de edición en desarrollo', 'info');
    }
    
    eliminarItem(itemId) {
        if (!this.mesaSeleccionada) return;
        
        if (confirm('¿Eliminar este producto del carrito?')) {
            const exito = window.BermelyDB.eliminarItemCarrito(this.mesaSeleccionada.id, itemId);
            
            if (exito) {
                this.mostrarAlerta('Producto eliminado del carrito', 'success');
                this.cargarMesas(); // Recargar para actualizar
            } else {
                this.mostrarAlerta('Error al eliminar producto', 'error');
            }
        }
    }
    
    actualizarInfoMesaSeleccionada() {
        if (!this.mesaSeleccionada) return;
        
        const mesaActual = this.mesas.find(m => m.id === this.mesaSeleccionada.id);
        if (mesaActual) {
            this.mesaSeleccionada = mesaActual;
            this.mostrarDetallesMesa(this.mesaSeleccionada);
        }
    }
    
    actualizarNotificaciones() {
        if (!window.BermelyDB) return;
        
        const userData = JSON.parse(localStorage.getItem('bermely_user_data') || '{}');
        let area = 'todos';
        
        switch(userData.role) {
            case 'mesero': area = 'meseros'; break;
            case 'cocina': area = 'cocina'; break;
            case 'cafeteria': area = 'cafeteria'; break;
        }
        
        const notificaciones = window.BermelyDB.obtenerNotificaciones(area, true);
        
        // Actualizar badge
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = notificaciones.length;
            badge.style.display = notificaciones.length > 0 ? 'block' : 'none';
        }
        
        // Actualizar panel
        this.actualizarPanelNotificaciones(notificaciones);
    }
    
    actualizarPanelNotificaciones(notificaciones) {
        const panel = document.getElementById('notificationsPanel');
        if (!panel) return;
        
        let html = '';
        
        if (notificaciones.length === 0) {
            html = `
                <div class="sin-notificaciones">
                    <i class="fas fa-bell-slash"></i>
                    <p>No hay notificaciones</p>
                </div>
            `;
        } else {
            notificaciones.forEach(notif => {
                const icono = this.obtenerIconoNotificacion(notif.tipo);
                const color = this.obtenerColorNotificacion(notif.tipo);
                
                html += `
                    <div class="notificacion-item" onclick="SistemaMesasInstancia.abrirNotificacion('${notif.id}')">
                        <div class="notificacion-icono" style="background: ${color}20; color: ${color}">
                            <i class="fas ${icono}"></i>
                        </div>
                        <div class="notificacion-contenido">
                            <div class="notificacion-titulo">${notif.titulo}</div>
                            <div class="notificacion-mensaje">${notif.mensaje}</div>
                            <div class="notificacion-tiempo">${this.formatearTiempo(notif.timestamp)}</div>
                        </div>
                    </div>
                `;
            });
        }
        
        panel.innerHTML = html;
    }
    
    obtenerIconoNotificacion(tipo) {
        const iconos = {
            'nuevo_pedido': 'fa-utensils',
            'pedido_listo': 'fa-check-circle',
            'mesa_abierta': 'fa-door-open',
            'mesa_cerrada': 'fa-cash-register'
        };
        return iconos[tipo] || 'fa-bell';
    }
    
    obtenerColorNotificacion(tipo) {
        const colores = {
            'nuevo_pedido': '#3b82f6',
            'pedido_listo': '#10b981',
            'mesa_abierta': '#f59e0b',
            'mesa_cerrada': '#8b5cf6'
        };
        return colores[tipo] || '#64748b';
    }
    
    abrirNotificacion(notificacionId) {
        // Marcar como leída
        window.BermelyDB.marcarNotificacionesLeidas([notificacionId]);
        
        // Cerrar panel
        const panel = document.getElementById('notificationsPanel');
        if (panel) {
            panel.style.display = 'none';
        }
        
        // Actualizar notificaciones
        this.actualizarNotificaciones();
    }
    
    manejarNotificacion(notificacion) {
        // Mostrar toast
        this.mostrarToastNotificacion(notificacion);
        
        // Reproducir sonido si es necesario
        if (notificacion.tipo === 'pedido_listo') {
            this.reproducirSonidoNotificacion();
        }
        
        // Actualizar UI
        this.actualizarNotificaciones();
    }
    
    mostrarToastNotificacion(notificacion) {
        const toast = document.createElement('div');
        toast.className = 'toast-notificacion';
        toast.innerHTML = `
            <div class="toast-icono">
                <i class="fas ${this.obtenerIconoNotificacion(notificacion.tipo)}"></i>
            </div>
            <div class="toast-contenido">
                <div class="toast-titulo">${notificacion.titulo}</div>
                <div class="toast-mensaje">${notificacion.mensaje}</div>
            </div>
            <button class="toast-cerrar" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 10px;
            padding: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 9999;
            animation: slideInRight 0.3s;
            border-left: 4px solid ${this.obtenerColorNotificacion(notificacion.tipo)};
            max-width: 350px;
        `;
        
        document.body.appendChild(toast);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }
    
    reproducirSonidoNotificacion() {
        // Crear audio simple
        const audio = new Audio();
        audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==';
        audio.play().catch(e => console.log('Audio no soportado:', e));
    }
    
    calcularTiempoTranscurrido(fechaString) {
        if (!fechaString) return '-';
        
        const fecha = new Date(fechaString);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) {
            return `${diffMins} min`;
        } else {
            const horas = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            return `${horas}h ${mins}min`;
        }
    }
    
    formatearTiempo(timestamp) {
        const fecha = new Date(timestamp);
        const ahora = new Date();
        const diffMs = ahora - fecha;
        
        if (diffMs < 60000) return 'Ahora';
        if (diffMs < 3600000) return `Hace ${Math.floor(diffMs / 60000)} min`;
        if (diffMs < 86400000) return `Hace ${Math.floor(diffMs / 3600000)} h`;
        
        return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    
    mostrarAlerta(mensaje, tipo = 'info') {
        const alerta = document.createElement('div');
        alerta.className = `alerta alerta-${tipo}`;
        alerta.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : 
                              tipo === 'error' ? 'exclamation-circle' : 
                              tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        alerta.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${tipo === 'success' ? '#10b981' : 
                         tipo === 'error' ? '#ef4444' : 
                         tipo === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideDown 0.3s;
        `;
        
        document.body.appendChild(alerta);
        
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 3000);
    }
    
    // Métodos públicos
    getMesaSeleccionada() {
        return this.mesaSeleccionada;
    }
    
    limpiarMesaSeleccionada() {
        this.mesaSeleccionada = null;
    }
    
    actualizar() {
        this.cargarMesas();
    }
}

// Crear instancia global
window.SistemaMesasInstancia = new SistemaMesas();