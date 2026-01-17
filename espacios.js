// ===== GESTIÓN DE LOS 12 ESPACIOS =====

class SistemaEspacios {
    constructor() {
        this.espacios = [];
        this.cargarEspacios();
    }

    async cargarEspacios() {
        this.espacios = await obtenerEspacios();
    }

    getEspacioPorId(id) {
        return this.espacios.find(espacio => espacio.id === id);
    }

    getEspaciosPorEstado(estado) {
        return this.espacios.filter(espacio => espacio.estado === estado);
    }

    getEspaciosOcupados() {
        return this.espacios.filter(espacio => 
            espacio.estado === 'ocupada' || 
            espacio.estado === 'preparacion' || 
            espacio.estado === 'listo' ||
            espacio.estado === 'porcobrar'
        );
    }

    getEspaciosLibres() {
        return this.espacios.filter(espacio => espacio.estado === 'libre');
    }

    async asignarCliente(id, cliente, mesero, comensales = 2) {
        const espacio = this.getEspacioPorId(id);
        
        if (!espacio || espacio.estado !== 'libre') {
            return false;
        }

        const datosActualizados = {
            estado: 'ocupada',
            cliente: cliente,
            mesero: mesero,
            comensales: comensales,
            horaInicio: new Date().toISOString(),
            pedido: { items: [], total: 0 }
        };

        const exito = await actualizarEstadoEspacio(id, datosActualizados);
        
        if (exito) {
            await this.cargarEspacios();
        }
        
        return exito;
    }

    async agregarPedido(id, items) {
        const espacio = this.getEspacioPorId(id);
        
        if (!espacio || espacio.estado === 'libre') {
            return false;
        }

        // Calcular total del pedido
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        
        // Actualizar pedido
        const pedidoActualizado = espacio.pedido || { items: [], total: 0 };
        pedidoActualizado.items.push(...items);
        pedidoActualizado.total += total;

        const datosActualizados = {
            pedido: pedidoActualizado,
            total: pedidoActualizado.total
        };

        // Si es el primer pedido, cambiar estado a preparación
        if (pedidoActualizado.items.length === items.length) {
            datosActualizados.estado = 'preparacion';
        }

        const exito = await actualizarEstadoEspacio(id, datosActualizados);
        
        if (exito) {
            await this.cargarEspacios();
        }
        
        return exito;
    }

    async actualizarEstado(id, estado, datosAdicionales = {}) {
        const datosActualizados = { estado, ...datosAdicionales };
        
        const exito = await actualizarEstadoEspacio(id, datosActualizados);
        
        if (exito) {
            await this.cargarEspacios();
        }
        
        return exito;
    }

    async liberarEspacio(id) {
        const datosActualizados = {
            estado: 'libre',
            cliente: null,
            comensales: null,
            mesero: null,
            pedido: null,
            total: null,
            horaInicio: null
        };

        const exito = await actualizarEstadoEspacio(id, datosActualizados);
        
        if (exito) {
            await this.cargarEspacios();
        }
        
        return exito;
    }

    getEstadisticas() {
        const ahora = new Date();
        const ocupados = this.getEspaciosOcupados().length;
        const libres = this.getEspaciosLibres().length;
        
        // Calcular tiempo promedio por mesa
        let tiempoTotal = 0;
        let mesasActivas = 0;
        
        this.espacios.forEach(espacio => {
            if (espacio.horaInicio) {
                const inicio = new Date(espacio.horaInicio);
                const minutos = (ahora - inicio) / (1000 * 60);
                tiempoTotal += minutos;
                mesasActivas++;
            }
        });
        
        const tiempoPromedio = mesasActivas > 0 ? Math.round(tiempoTotal / mesasActivas) : 0;
        
        // Calcular ventas totales
        const ventasTotales = this.espacios.reduce((total, espacio) => {
            return total + (espacio.total || 0);
        }, 0);
        
        return {
            total: this.espacios.length,
            ocupados,
            libres,
            tiempoPromedio,
            ventasTotales,
            mesasActivas
        };
    }

    renderizarEspacios(containerId, onclickCallback = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const estadisticas = this.getEstadisticas();
        
        let html = `
            <div class="estadisticas-espacios">
                <div class="estadistica">
                    <span class="valor">${estadisticas.total}</span>
                    <span class="label">Total Espacios</span>
                </div>
                <div class="estadistica">
                    <span class="valor ${estadisticas.libres > 0 ? 'text-success' : 'text-danger'}">
                        ${estadisticas.libres}
                    </span>
                    <span class="label">Libres</span>
                </div>
                <div class="estadistica">
                    <span class="valor">${estadisticas.ocupados}</span>
                    <span class="label">Ocupados</span>
                </div>
                <div class="estadistica">
                    <span class="valor">$${estadisticas.ventasTotales.toFixed(2)}</span>
                    <span class="label">Ventas Totales</span>
                </div>
            </div>
            
            <div class="espacios-grid-interno">
        `;

        this.espacios.forEach(espacio => {
            const tiempo = espacio.horaInicio ? 
                Math.round((new Date() - new Date(espacio.horaInicio)) / (1000 * 60)) : 0;
            
            html += `
                <div class="espacio-card ${espacio.estado}" 
                     ${onclickCallback ? `onclick="${onclickCallback}('${espacio.id}')"` : ''}>
                    <div class="espacio-header">
                        <div class="espacio-numero">${espacio.nombre}</div>
                        <div class="estado-badge badge-${espacio.estado}">
                            ${espacio.estado.toUpperCase()}
                        </div>
                    </div>
                    
                    <div class="espacio-info">
                        ${espacio.cliente ? `
                            <div class="cliente-nombre">${espacio.cliente}</div>
                            <div class="mesero-nombre">Mesero: ${espacio.mesero || 'N/A'}</div>
                            ${espacio.comensales ? `
                                <div class="comensales">${espacio.comensales} comensales</div>
                            ` : ''}
                        ` : '<div class="cliente-nombre">Libre</div>'}
                    </div>
                    
                    <div class="espacio-estadisticas">
                        ${espacio.total ? `
                            <div class="pedido-info">Total: $${espacio.total.toFixed(2)}</div>
                        ` : ''}
                        ${tiempo > 0 ? `
                            <div class="tiempo-info">
                                <i class="fas fa-clock"></i>
                                ${tiempo} min
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="espacio-acciones">
                        ${espacio.estado === 'libre' ? `
                            <button class="btn btn-sm btn-success" 
                                    onclick="event.stopPropagation(); asignarClienteEspacio('${espacio.id}')">
                                <i class="fas fa-user-plus"></i> Asignar
                            </button>
                        ` : ''}
                        
                        ${espacio.estado === 'ocupada' ? `
                            <button class="btn btn-sm btn-primary" 
                                    onclick="event.stopPropagation(); verPedidoEspacio('${espacio.id}')">
                                <i class="fas fa-edit"></i> Ver Pedido
                            </button>
                        ` : ''}
                        
                        ${espacio.estado === 'porcobrar' ? `
                            <button class="btn btn-sm btn-warning" 
                                    onclick="event.stopPropagation(); cobrarEspacio('${espacio.id}')">
                                <i class="fas fa-cash-register"></i> Cobrar
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    }
}

// Funciones globales para uso desde HTML
window.obtenerEspacios = obtenerEspacios;
window.obtenerEspacioPorId = obtenerEspacioPorId;
window.actualizarEstadoEspacio = actualizarEstadoEspacio;

// Funciones helper
function asignarClienteEspacio(espacioId) {
    // Esta función se implementa en cada página según sea necesario
    console.log('Asignar cliente a espacio:', espacioId);
}

function verPedidoEspacio(espacioId) {
    console.log('Ver pedido de espacio:', espacioId);
}

function cobrarEspacio(espacioId) {
    console.log('Cobrar espacio:', espacioId);
}

// Inicializar sistema de espacios global
let sistemaEspacios = null;

document.addEventListener('DOMContentLoaded', function() {
    sistemaEspacios = new SistemaEspacios();
});

// Exportar para uso global
window.SistemaEspacios = SistemaEspacios;
window.sistemaEspacios = sistemaEspacios;