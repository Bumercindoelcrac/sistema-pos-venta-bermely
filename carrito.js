// SISTEMA DE CARRITO PARA MESEROS

// Clase Carrito
class Carrito {
    constructor(mesaId, mesaNumero) {
        this.mesaId = mesaId;
        this.mesaNumero = mesaNumero;
        this.items = [];
        this.cliente = '';
        this.comentarios = '';
        this.total = 0;
    }
    
    // Agregar producto al carrito
    agregarProducto(producto, cantidad = 1, comentarios = '') {
        const productoIndex = this.items.findIndex(item => item.id === producto.id);
        
        if (productoIndex >= 0) {
            // Producto ya existe, actualizar cantidad
            this.items[productoIndex].cantidad += cantidad;
            if (comentarios) {
                this.items[productoIndex].comentarios = comentarios;
            }
        } else {
            // Producto nuevo
            this.items.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad,
                area: producto.area,
                categoria: producto.categoria,
                comentarios: comentarios
            });
        }
        
        this.calcularTotal();
    }
    
    // Modificar cantidad de un producto
    modificarCantidad(productoId, cantidad) {
        const productoIndex = this.items.findIndex(item => item.id === productoId);
        
        if (productoIndex >= 0) {
            if (cantidad <= 0) {
                // Eliminar producto si cantidad es 0 o menor
                this.items.splice(productoIndex, 1);
            } else {
                // Actualizar cantidad
                this.items[productoIndex].cantidad = cantidad;
            }
            
            this.calcularTotal();
            return true;
        }
        
        return false;
    }
    
    // Eliminar producto del carrito
    eliminarProducto(productoId) {
        const productoIndex = this.items.findIndex(item => item.id === productoId);
        
        if (productoIndex >= 0) {
            this.items.splice(productoIndex, 1);
            this.calcularTotal();
            return true;
        }
        
        return false;
    }
    
    // Agregar comentarios a un producto específico
    agregarComentarioProducto(productoId, comentarios) {
        const producto = this.items.find(item => item.id === productoId);
        
        if (producto) {
            producto.comentarios = comentarios;
            return true;
        }
        
        return false;
    }
    
    // Calcular total del carrito
    calcularTotal() {
        this.total = this.items.reduce((sum, item) => {
            return sum + (item.precio * item.cantidad);
        }, 0);
    }
    
    // Limpiar carrito
    limpiar() {
        this.items = [];
        this.cliente = '';
        this.comentarios = '';
        this.total = 0;
    }
    
    // Obtener resumen del carrito
    obtenerResumen() {
        return {
            mesaId: this.mesaId,
            mesaNumero: this.mesaNumero,
            items: this.items,
            total: this.total,
            cliente: this.cliente,
            comentarios: this.comentarios,
            timestamp: Date.now()
        };
    }
    
    // Verificar si el carrito está vacío
    estaVacio() {
        return this.items.length === 0;
    }
    
    // Obtener cantidad de items
    cantidadItems() {
        return this.items.reduce((sum, item) => sum + item.cantidad, 0);
    }
    
    // Agrupar productos por área
    agruparPorArea() {
        const agrupados = {
            cocina: [],
            cafeteria: []
        };
        
        this.items.forEach(item => {
            if (item.area === 'cocina') {
                agrupados.cocina.push(item);
            } else if (item.area === 'cafeteria') {
                agrupados.cafeteria.push(item);
            }
        });
        
        return agrupados;
    }
}

// Sistema de múltiples carritos (para diferentes mesas)
class SistemaCarritos {
    constructor() {
        this.carritos = new Map(); // mesaId -> Carrito
        this.carritoActivo = null;
    }
    
    // Obtener o crear carrito para una mesa
    obtenerCarrito(mesaId, mesaNumero) {
        if (!this.carritos.has(mesaId)) {
            this.carritos.set(mesaId, new Carrito(mesaId, mesaNumero));
        }
        
        return this.carritos.get(mesaId);
    }
    
    // Establecer carrito activo
    setCarritoActivo(mesaId, mesaNumero) {
        this.carritoActivo = this.obtenerCarrito(mesaId, mesaNumero);
        return this.carritoActivo;
    }
    
    // Obtener carrito activo
    getCarritoActivo() {
        return this.carritoActivo;
    }
    
    // Eliminar carrito de una mesa
    eliminarCarrito(mesaId) {
        if (this.carritos.has(mesaId)) {
            this.carritos.delete(mesaId);
            
            // Si el carrito eliminado era el activo, limpiar
            if (this.carritoActivo && this.carritoActivo.mesaId === mesaId) {
                this.carritoActivo = null;
            }
            
            return true;
        }
        
        return false;
    }
    
    // Limpiar todos los carritos
    limpiarTodos() {
        this.carritos.clear();
        this.carritoActivo = null;
    }
    
    // Obtener todos los carritos
    obtenerTodosCarritos() {
        return Array.from(this.carritos.values());
    }
}

// Función para renderizar carrito en HTML
function renderizarCarrito(carrito, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (carrito.estaVacio()) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fas fa-shopping-cart" style="font-size: 48px; margin-bottom: 20px;"></i>
                <h3>Carrito vacío</h3>
                <p>Agrega productos del menú</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="max-height: 400px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa;">
                        <th style="padding: 10px; text-align: left;">Producto</th>
                        <th style="padding: 10px; text-align: center;">Cant.</th>
                        <th style="padding: 10px; text-align: right;">Total</th>
                        <th style="padding: 10px; text-align: center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    carrito.items.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        
        html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">
                    <div><strong>${item.nombre}</strong></div>
                    <div style="font-size: 12px; color: #666;">
                        $${item.precio} c/u • ${item.area}
                    </div>
                    ${item.comentarios ? `
                        <div style="font-size: 11px; color: #e74c3c; margin-top: 3px;">
                            <i class="fas fa-comment"></i> ${item.comentarios}
                        </div>
                    ` : ''}
                </td>
                <td style="padding: 10px; text-align: center;">
                    <div style="display: inline-flex; align-items: center; gap: 5px;">
                        <button onclick="modificarCantidad(${index}, -1)" 
                                style="padding: 2px 8px; border: none; background: #e74c3c; color: white; border-radius: 3px; cursor: pointer;">-</button>
                        <span style="min-width: 30px; text-align: center;">${item.cantidad}</span>
                        <button onclick="modificarCantidad(${index}, 1)" 
                                style="padding: 2px 8px; border: none; background: #2ecc71; color: white; border-radius: 3px; cursor: pointer;">+</button>
                    </div>
                </td>
                <td style="padding: 10px; text-align: right;">
                    $${subtotal.toFixed(2)}
                </td>
                <td style="padding: 10px; text-align: center;">
                    <button onclick="eliminarItem(${index})" 
                            style="padding: 5px 10px; border: none; background: #95a5a6; color: white; border-radius: 3px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: bold;">Total:</div>
                    <div style="font-size: 12px; color: #666;">${carrito.cantidadItems()} productos</div>
                </div>
                <div style="font-size: 24px; font-weight: bold; color: #2ecc71;">
                    $${carrito.total.toFixed(2)}
                </div>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <div class="form-control">
                <label>Comentarios generales del pedido:</label>
                <textarea id="comentariosPedido" rows="2" placeholder="Ej: Sin picante, servir aparte..." 
                          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${carrito.comentarios}</textarea>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Configurar eventos
    const textarea = document.getElementById('comentariosPedido');
    if (textarea) {
        textarea.addEventListener('input', function() {
            carrito.comentarios = this.value;
        });
    }
}

// Funciones globales para los botones del carrito
window.modificarCantidad = function(index, cambio) {
    if (sistemaCarritos && sistemaCarritos.getCarritoActivo()) {
        const carrito = sistemaCarritos.getCarritoActivo();
        const producto = carrito.items[index];
        
        if (producto) {
            const nuevaCantidad = producto.cantidad + cambio;
            carrito.modificarCantidad(producto.id, nuevaCantidad);
            
            // Volver a renderizar
            renderizarCarrito(carrito, 'carritoContainer');
        }
    }
};

window.eliminarItem = function(index) {
    if (sistemaCarritos && sistemaCarritos.getCarritoActivo()) {
        const carrito = sistemaCarritos.getCarritoActivo();
        const producto = carrito.items[index];
        
        if (producto && confirm(`¿Eliminar ${producto.nombre} del carrito?`)) {
            carrito.eliminarProducto(producto.id);
            renderizarCarrito(carrito, 'carritoContainer');
        }
    }
};

// Instancia global del sistema de carritos
const sistemaCarritos = new SistemaCarritos();

// Exportar
export {
    Carrito,
    SistemaCarritos,
    sistemaCarritos,
    renderizarCarrito
};