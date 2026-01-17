/**
 * BER-MELY POS - Sistema REAL de Cobro
 * Manejo completo de pagos y cierre de cuentas
 */

class SistemaCobro {
    constructor() {
        this.mesaPagoActual = null;
        this.totalPagar = 0;
    }
    
    abrirModalPago() {
        const mesaSeleccionada = window.SistemaMesasInstancia?.getMesaSeleccionada();
        if (!mesaSeleccionada || mesaSeleccionada.estado === 'libre') {
            this.mostrarAlerta('Selecciona una mesa primero', 'warning');
            return;
        }
        
        if (!mesaSeleccionada.carrito || mesaSeleccionada.carrito.length === 0) {
            this.mostrarAlerta('La mesa no tiene productos', 'info');
            return;
        }
        
        this.mesaPagoActual = mesaSeleccionada;
        this.totalPagar = mesaSeleccionada.total || 0;
        
        this.crearModalPago();
    }
    
    crearModalPago() {
        const modalHTML = `
            <div class="modal-pago" id="modalPago">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-cash-register"></i> Cerrar Cuenta</h2>
                        <button class="close-modal" onclick="SistemaCobroInstancia.cerrarModalPago()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <!-- Información de la mesa -->
                        <div class="info-mesa">
                            <div class="mesa-info">
                                <div class="mesa-nombre">${this.mesaPagoActual.nombre}</div>
                                <div class="mesa-cliente">${this.mesaPagoActual.cliente}</div>
                            </div>
                            <div class="mesa-tiempo">
                                <i class="fas fa-clock"></i>
                                ${this.calcularTiempoMesa(this.mesaPagoActual.horaApertura)}
                            </div>
                        </div>
                        
                        <!-- Resumen -->
                        <div class="resumen-pago">
                            <h3><i class="fas fa-receipt"></i> Resumen de Compra</h3>
                            <div class="detalles-resumen">
                                <div class="fila-resumen">
                                    <span>Subtotal:</span>
                                    <span>$${this.mesaPagoActual.subtotal?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div class="fila-resumen">
                                    <span>IVA (16%):</span>
                                    <span>$${this.mesaPagoActual.iva?.toFixed(2) || '0.00'}</span>
                                </div>
                                <div class="fila-resumen total">
                                    <span>TOTAL A PAGAR:</span>
                                    <span id="totalPagar">$${this.totalPagar.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Método de pago -->
                        <div class="metodo-pago">
                            <h3><i class="fas fa-credit-card"></i> Método de Pago</h3>
                            <div class="opciones-metodo">
                                <label class="opcion-metodo ${this.mesaPagoActual.metodoPagoPreferido === 'efectivo' ? 'selected' : ''}" 
                                       onclick="SistemaCobroInstancia.seleccionarMetodo('efectivo')">
                                    <input type="radio" name="metodoPago" value="efectivo" 
                                           ${this.mesaPagoActual.metodoPagoPreferido === 'efectivo' ? 'checked' : ''}>
                                    <div class="metodo-icono">
                                        <i class="fas fa-money-bill-wave"></i>
                                    </div>
                                    <div class="metodo-info">
                                        <div class="metodo-nombre">Efectivo</div>
                                        <div class="metodo-desc">Pago en efectivo</div>
                                    </div>
                                </label>
                                
                                <label class="opcion-metodo ${this.mesaPagoActual.metodoPagoPreferido === 'tarjeta' ? 'selected' : ''}" 
                                       onclick="SistemaCobroInstancia.seleccionarMetodo('tarjeta')">
                                    <input type="radio" name="metodoPago" value="tarjeta"
                                           ${this.mesaPagoActual.metodoPagoPreferido === 'tarjeta' ? 'checked' : ''}>
                                    <div class="metodo-icono">
                                        <i class="fas fa-credit-card"></i>
                                    </div>
                                    <div class="metodo-info">
                                        <div class="metodo-nombre">Tarjeta</div>
                                        <div class="metodo-desc">Débito/Crédito</div>
                                    </div>
                                </label>
                                
                                <label class="opcion-metodo ${this.mesaPagoActual.metodoPagoPreferido === 'transferencia' ? 'selected' : ''}" 
                                       onclick="SistemaCobroInstancia.seleccionarMetodo('transferencia')">
                                    <input type="radio" name="metodoPago" value="transferencia"
                                           ${this.mesaPagoActual.metodoPagoPreferido === 'transferencia' ? 'checked' : ''}>
                                    <div class="metodo-icono">
                                        <i class="fas fa-mobile-alt"></i>
                                    </div>
                                    <div class="metodo-info">
                                        <div class="metodo-nombre">Transferencia</div>
                                        <div class="metodo-desc">Pago móvil</div>
                                    </div>
                                </label>
                            </div>
                        </div>
                        
                        <!-- Sección de efectivo -->
                        <div class="seccion-efectivo" id="seccionEfectivo" style="display: ${this.mesaPagoActual.metodoPagoPreferido === 'efectivo' ? 'block' : 'none'}">
                            <h3><i class="fas fa-calculator"></i> Pago en Efectivo</h3>
                            <div class="input-efectivo">
                                <label>Monto recibido:</label>
                                <div class="input-group">
                                    <span class="input-prefix">$</span>
                                    <input type="number" id="montoRecibido" 
                                           placeholder="0.00" 
                                           step="0.01"
                                           min="${this.totalPagar}"
                                           oninput="SistemaCobroInstancia.calcularCambio()">
                                </div>
                            </div>
                            <div class="resumen-cambio" id="resumenCambio" style="display: none;">
                                <div class="fila-cambio">
                                    <span>Cambio:</span>
                                    <span id="montoCambio">$0.00</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Acciones -->
                        <div class="acciones-pago">
                            <button class="btn-cancelar" onclick="SistemaCobroInstancia.cerrarModalPago()">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button class="btn-procesar" onclick="SistemaCobroInstancia.procesarPago()" id="btnProcesarPago">
                                <i class="fas fa-check"></i> Procesar Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        
        this.aplicarEstilosModal();
        this.configurarEventosModal();
    }
    
    aplicarEstilosModal() {
        const style = document.createElement('style');
        style.textContent = `
            .modal-pago {
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
            
            .modal-pago .modal-content {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                padding: 20px;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .modal-header h2 {
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
            
            .info-mesa {
                background: #f8fafc;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .mesa-nombre {
                font-size: 1.2rem;
                font-weight: bold;
                color: #1e293b;
            }
            
            .mesa-cliente {
                color: #64748b;
            }
            
            .mesa-tiempo {
                background: #e0e7ff;
                color: #4f46e5;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 5px;
                float: right;
            }
            
            .resumen-pago, .metodo-pago, .seccion-efectivo {
                margin-bottom: 25px;
            }
            
            .detalles-resumen {
                background: #f8fafc;
                border-radius: 10px;
                padding: 20px;
            }
            
            .fila-resumen {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                color: #64748b;
            }
            
            .fila-resumen.total {
                font-size: 1.2rem;
                font-weight: bold;
                color: #1e293b;
                border-top: 2px solid #e2e8f0;
                padding-top: 10px;
                margin-top: 10px;
            }
            
            .opciones-metodo {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 10px;
            }
            
            .opcion-metodo {
                background: #f8fafc;
                border: 2px solid #e2e8f0;
                border-radius: 10px;
                padding: 15px;
                cursor: pointer;
            }
            
            .opcion-metodo.selected {
                border-color: #4f46e5;
                background: #e0e7ff;
            }
            
            .opcion-metodo input {
                display: none;
            }
            
            .metodo-icono {
                width: 40px;
                height: 40px;
                background: white;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
                color: #4f46e5;
                margin-bottom: 10px;
            }
            
            .metodo-nombre {
                font-weight: 600;
                color: #1e293b;
            }
            
            .metodo-desc {
                font-size: 0.8rem;
                color: #64748b;
            }
            
            .input-efectivo {
                background: #f8fafc;
                border-radius: 10px;
                padding: 20px;
            }
            
            .input-group {
                display: flex;
                align-items: center;
                background: white;
                border: 2px solid #e2e8f0;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .input-prefix {
                padding: 0 15px;
                background: #f1f5f9;
                color: #64748b;
                font-weight: bold;
                height: 50px;
                display: flex;
                align-items: center;
            }
            
            #montoRecibido {
                flex: 1;
                border: none;
                padding: 0 15px;
                font-size: 1.2rem;
                font-weight: bold;
                height: 50px;
            }
            
            .resumen-cambio {
                background: #d1fae5;
                border-radius: 10px;
                padding: 15px;
                margin-top: 10px;
            }
            
            .fila-cambio {
                display: flex;
                justify-content: space-between;
                font-size: 1.1rem;
            }
            
            .acciones-pago {
                display: flex;
                gap: 15px;
            }
            
            .acciones-pago button {
                flex: 1;
                padding: 15px;
                border: none;
                border-radius: 10px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .btn-cancelar {
                background: #e2e8f0;
                color: #64748b;
            }
            
            .btn-procesar {
                background: #059669;
                color: white;
            }
            
            .btn-procesar:disabled {
                background: #cbd5e1;
                cursor: not-allowed;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    configurarEventosModal() {
        // Método de pago change
        document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
            radio.addEventListener('change', function() {
                const seccionEfectivo = document.getElementById('seccionEfectivo');
                
                if (this.value === 'efectivo') {
                    seccionEfectivo.style.display = 'block';
                } else {
                    seccionEfectivo.style.display = 'none';
                }
                
                SistemaCobroInstancia.actualizarBotonProcesar();
            });
        });
        
        // Input de monto
        const montoInput = document.getElementById('montoRecibido');
        if (montoInput) {
            montoInput.addEventListener('input', () => this.calcularCambio());
        }
    }
    
    seleccionarMetodo(metodo) {
        const radio = document.querySelector(`input[name="metodoPago"][value="${metodo}"]`);
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
            
            // Actualizar clases
            document.querySelectorAll('.opcion-metodo').forEach(opcion => {
                opcion.classList.remove('selected');
            });
            event.currentTarget.classList.add('selected');
        }
    }
    
    calcularCambio() {
        const montoRecibido = parseFloat(document.getElementById('montoRecibido')?.value) || 0;
        
        if (montoRecibido >= this.totalPagar) {
            const cambio = montoRecibido - this.totalPagar;
            document.getElementById('montoCambio').textContent = `$${cambio.toFixed(2)}`;
            document.getElementById('resumenCambio').style.display = 'block';
            
            document.getElementById('btnProcesarPago').disabled = false;
        } else {
            document.getElementById('resumenCambio').style.display = 'none';
            document.getElementById('btnProcesarPago').disabled = true;
        }
    }
    
    actualizarBotonProcesar() {
        const metodo = document.querySelector('input[name="metodoPago"]:checked')?.value;
        const btnProcesar = document.getElementById('btnProcesarPago');
        
        if (metodo === 'efectivo') {
            const montoRecibido = parseFloat(document.getElementById('montoRecibido')?.value) || 0;
            btnProcesar.disabled = montoRecibido < this.totalPagar;
        } else {
            btnProcesar.disabled = false;
        }
    }
    
    procesarPago() {
        const metodo = document.querySelector('input[name="metodoPago"]:checked')?.value;
        const montoRecibido = parseFloat(document.getElementById('montoRecibido')?.value) || this.totalPagar;
        
        if (metodo === 'efectivo' && montoRecibido < this.totalPagar) {
            this.mostrarAlerta(`El monto debe ser mayor o igual a $${this.totalPagar.toFixed(2)}`, 'warning');
            return;
        }
        
        if (confirm(`¿Confirmar pago de $${this.totalPagar.toFixed(2)} por ${metodo}?`)) {
            const pagoInfo = {
                metodo: metodo,
                montoRecibido: montoRecibido,
                timestamp: new Date().toISOString()
            };
            
            const resultado = window.BermelyDB.procesarPago(this.mesaPagoActual.id, pagoInfo);
            
            if (resultado.success) {
                this.mostrarAlerta('Pago procesado exitosamente', 'success');
                this.cerrarModalPago();
                
                // Generar ticket
                this.generarTicket(resultado.venta);
                
                // Actualizar UI
                setTimeout(() => {
                    if (window.SistemaMesasInstancia) {
                        window.SistemaMesasInstancia.actualizar();
                        window.SistemaMesasInstancia.limpiarMesaSeleccionada();
                    }
                }, 1000);
            } else {
                this.mostrarAlerta(`Error: ${resultado.error}`, 'error');
            }
        }
    }
    
    cerrarModalPago() {
        const modal = document.getElementById('modalPago');
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        this.mesaPagoActual = null;
        this.totalPagar = 0;
    }
    
    calcularTiempoMesa(horaApertura) {
        if (!horaApertura) return '-';
        
        const apertura = new Date(horaApertura);
        const ahora = new Date();
        const diffMs = ahora - apertura;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) return `${diffMins} min`;
        
        const horas = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        return `${horas}h ${mins}min`;
    }
    
    generarTicket(venta) {
        // Mostrar ticket en pantalla
        const ticketHTML = `
            <div class="ticket-venta" id="ticketVenta">
                <div class="ticket-content">
                    <div class="ticket-header">
                        <h3>BER-MELY RESTAURANT</h3>
                        <p>Ticket de Venta #${venta.id.substring(0, 8)}</p>
                    </div>
                    
                    <div class="ticket-info">
                        <div class="ticket-fila">
                            <span>Mesa:</span>
                            <span>${venta.mesaNombre}</span>
                        </div>
                        <div class="ticket-fila">
                            <span>Cliente:</span>
                            <span>${venta.cliente}</span>
                        </div>
                        <div class="ticket-fila">
                            <span>Fecha:</span>
                            <span>${new Date(venta.fecha).toLocaleString('es-MX')}</span>
                        </div>
                    </div>
                    
                    <div class="ticket-productos">
                        <h4>Productos:</h4>
                        ${venta.productos.map(p => `
                            <div class="ticket-producto">
                                <span>${p.cantidad}x ${p.nombre}</span>
                                <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="ticket-totales">
                        <div class="ticket-fila">
                            <span>Subtotal:</span>
                            <span>$${venta.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="ticket-fila">
                            <span>IVA (16%):</span>
                            <span>$${venta.iva.toFixed(2)}</span>
                        </div>
                        <div class="ticket-fila total">
                            <span>TOTAL:</span>
                            <span>$${venta.total.toFixed(2)}</span>
                        </div>
                        <div class="ticket-fila">
                            <span>Método:</span>
                            <span>${venta.metodoPago}</span>
                        </div>
                        ${venta.cambio > 0 ? `
                            <div class="ticket-fila">
                                <span>Cambio:</span>
                                <span>$${venta.cambio.toFixed(2)}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="ticket-footer">
                        <p>¡Gracias por su visita!</p>
                    </div>
                </div>
            </div>
        `;
        
        const ticketContainer = document.createElement('div');
        ticketContainer.innerHTML = ticketHTML;
        document.body.appendChild(ticketContainer);
        
        // Estilos del ticket
        const style = document.createElement('style');
        style.textContent = `
            .ticket-venta {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 10px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                z-index: 3000;
                max-width: 400px;
                animation: fadeIn 0.3s;
            }
            
            .ticket-content {
                padding: 20px;
                font-family: monospace;
            }
            
            .ticket-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px dashed #ccc;
                padding-bottom: 10px;
            }
            
            .ticket-header h3 {
                margin: 0;
                color: #333;
            }
            
            .ticket-fila {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            
            .ticket-productos {
                margin: 20px 0;
                border-top: 1px dashed #ccc;
                border-bottom: 1px dashed #ccc;
                padding: 10px 0;
            }
            
            .ticket-totales {
                margin: 20px 0;
            }
            
            .ticket-totales .total {
                font-weight: bold;
                font-size: 1.2rem;
                border-top: 2px solid #333;
                padding-top: 10px;
                margin-top: 10px;
            }
            
            .ticket-footer {
                text-align: center;
                color: #666;
                font-style: italic;
            }
        `;
        
        document.head.appendChild(style);
        
        // Cerrar después de 10 segundos
        setTimeout(() => {
            if (ticketContainer.parentNode) {
                ticketContainer.parentNode.removeChild(ticketContainer);
            }
        }, 10000);
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
            bottom: 20px;
            right: 20px;
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
        `;
        
        document.body.appendChild(alerta);
        
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 3000);
    }
}

// Crear instancia global
window.SistemaCobroInstancia = new SistemaCobro();