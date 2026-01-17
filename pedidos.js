// ===== SISTEMA DE PEDIDOS Y CARRITO =====

class Carrito {
    constructor() {
        this.items = [];
        this.subtotal = 0;
        this.iva = 0;
        this.total = 0;
    }

    agregarItem(producto) {
        // Verificar si el producto ya está en el carrito
        const itemExistente = this.items.find(item => 
            item.id === producto.id && 
            JSON.stringify(item.extras) === JSON.stringify(producto.extras) &&
            item.comentario === producto.comentario
        );

        if (itemExistente) {
            // Actualizar cantidad
            itemExistente.cantidad += producto.cantidad;
            itemExistente.subtotal = itemExistente.cantidad * 
                (itemExistente.precio + (itemExistente.extras?.reduce((sum, extra) => sum + extra.precio, 0) || 0));
        } else {
            // Agregar nuevo item
            this.items.push({
                ...producto,
                subtotal: producto.cantidad * 
                    (producto.precio + (producto.extras?.reduce((sum, extra) => sum + extra.precio, 0) || 0))
            });
        }

        this.calcularTotal();
    }

    modificarCantidad(index, delta) {
        if (index >= 0 && index < this.items.length) {
            const item = this.items[index];
            item.cantidad += delta;
            
            if (item.cantidad < 1) {
                this.eliminarItem(index);
            } else {
                item.subtotal = item.cantidad * 
                    (item.precio + (item.extras?.reduce((sum, extra) => sum + extra.precio, 0) || 0));
                this.calcularTotal();
            }
        }
    }

    eliminarItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
            this.calcularTotal();
        }
    }

    limpiar() {
        this.items = [];
        this.subtotal = 0;
        this.iva = 0;
        this.total = 0;
    }

    calcularSubtotal() {
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        return this.subtotal;
    }

    calcularTotal() {
        this.calcularSubtotal();
        this.iva = this.subtotal * 0.16; // 16% IVA
        this.total = this.subtotal + this.iva;
        return this.total;
    }

    agruparPorArea() {
        return {
            cocina: this.items.filter(item => item.area === 'cocina'),
            cafeteria: this.items.filter(item => item.area === 'cafeteria')
        };
    }

    getResumen() {
        const porArea = this.agruparPorArea();
        
        return {
            totalItems: this.items.length,
            totalCocina: porArea.cocina.length,
            totalCafeteria: porArea.cafeteria.length,
            subtotal: this.subtotal,
            iva: this.iva,
            total: this.total
        };
    }

    generarComandas() {
        const porArea = this.agruparPorArea();
        const comandas = [];

        // Crear comanda para cocina si hay items
        if (porArea.cocina.length > 0) {
            comandas.push({
                area: 'cocina',
                items: porArea.cocina,
                total: porArea.cocina.reduce((sum, item) => sum + item.subtotal, 0),
                horaCreacion: new Date().toISOString()
            });
        }

        // Crear comanda para cafetería si hay items
        if (porArea.cafeteria.length > 0) {
            comandas.push({
                area: 'cafeteria',
                items: porArea.cafeteria,
                total: porArea.cafeteria.reduce((sum, item) => sum + item.subtotal, 0),
                horaCreacion: new Date().toISOString()
            });
        }

        return comandas;
    }
}

class SistemaPedidos {
    constructor() {
        this.carritos = {}; // Un carrito por espacio
        this.carritoActual = null;
        this.espacioActual = null;
    }

    seleccionarEspacio(espacioId) {
        this.espacioActual = espacioId;
        
        if (!this.carritos[espacioId]) {
            this.carritos[espacioId] = new Carrito();
        }
        
        this.carritoActual = this.carritos[espacioId];
        return this.carritoActual;
    }

    obtenerCarrito(espacioId) {
        if (!this.carritos[espacioId]) {
            this.carritos[espacioId] = new Carrito();
        }
        return this.carritos[espacioId];
    }

    limpiarCarrito(espacioId) {
        if (this.carritos[espacioId]) {
            this.carritos[espacioId].limpiar();
        }
    }

    limpiarTodos() {
        this.carritos = {};
        this.carritoActual = null;
        this.espacioActual = null;
    }

    async enviarPedido(espacioId, cliente, mesero) {
        const carrito = this.obtenerCarrito(espacioId);
        
        if (carrito.items.length === 0) {
            throw new Error('El carrito está vacío');
        }

        const comandas = carrito.generarComandas();
        const pedidosIds = [];

        // Crear pedidos para cada área
        for (const comanda of comandas) {
            const pedido = {
                espacioId: espacioId,
                cliente: cliente,
                mesero: mesero,
                area: comanda.area,
                items: comanda.items,
                estado: 'pendiente',
                horaCreacion: new Date().toISOString(),
                total: comanda.total
            };

            const pedidoId = await crearPedido(pedido);
            if (pedidoId) {
                pedidosIds.push(pedidoId);
            }
        }

        // Limpiar carrito después de enviar
        carrito.limpiar();

        return {
            exito: pedidosIds.length > 0,
            pedidosIds: pedidosIds,
            areas: comandas.map(c => c.area)
        };
    }

    async procesarVentaExpress(productos, cliente = 'Cliente Express') {
        const carritoExpress = new Carrito();
        
        // Agregar todos los productos al carrito express
        productos.forEach(producto => {
            carritoExpress.agregarItem(producto);
        });

        const comandas = carritoExpress.generarComandas();
        const resultados = [];

        for (const comanda of comandas) {
            const pedido = {
                espacioId: 'express',
                espacioNombre: 'VENTA EXPRESS',
                cliente: cliente,
                mesero: 'Cafetería',
                area: comanda.area,
                items: comanda.items,
                estado: 'listo', // Directamente listo para venta express
                horaCreacion: new Date().toISOString(),
                horaListo: new Date().toISOString(),
                total: comanda.total,
                tipo: 'express'
            };

            const pedidoId = await crearPedido(pedido);
            if (pedidoId) {
                resultados.push({
                    area: comanda.area,
                    pedidoId: pedidoId,
                    total: comanda.total
                });
            }
        }

        return {
            exito: resultados.length > 0,
            resultados: resultados,
            total: carritoExpress.total
        };
    }

    getEstadisticas() {
        let totalCarritos = 0;
        let totalItems = 0;
        let totalVenta = 0;

        Object.values(this.carritos).forEach(carrito => {
            if (carrito.items.length > 0) {
                totalCarritos++;
                totalItems += carrito.items.length;
                totalVenta += carrito.total;
            }
        });

        return {
            carritosActivos: totalCarritos,
            totalItems: totalItems,
            ventaPotencial: totalVenta,
            espaciosActivos: Object.keys(this.carritos).filter(id => 
                this.carritos[id].items.length > 0
            )
        };
    }
}

// Funciones de ayuda para análisis de pedidos
async function analizarPedidosPorPeriodo(fechaInicio, fechaFin) {
    try {
        // En modo real, se consultaría Firebase
        // Por ahora, simulamos con localStorage
        const todosPedidos = JSON.parse(localStorage.getItem('bermely_pedidos') || '[]');
        
        const fechaInicioObj = new Date(fechaInicio);
        const fechaFinObj = new Date(fechaFin);
        
        const pedidosFiltrados = todosPedidos.filter(pedido => {
            const fechaPedido = new Date(pedido.horaCreacion);
            return fechaPedido >= fechaInicioObj && fechaPedido <= fechaFinObj;
        });

        // Análisis por área
        const porArea = {
            cocina: pedidosFiltrados.filter(p => p.area === 'cocina'),
            cafeteria: pedidosFiltrados.filter(p => p.area === 'cafeteria')
        };

        // Análisis por estado
        const porEstado = {
            pendiente: pedidosFiltrados.filter(p => p.estado === 'pendiente').length,
            preparacion: pedidosFiltrados.filter(p => p.estado === 'preparacion').length,
            listo: pedidosFiltrados.filter(p => p.estado === 'listo').length,
            entregado: pedidosFiltrados.filter(p => p.estado === 'entregado').length
        };

        // Tiempos promedio
        let tiempoTotalPreparacion = 0;
        let pedidosConTiempo = 0;

        pedidosFiltrados.forEach(pedido => {
            if (pedido.horaCreacion && pedido.horaListo) {
                const inicio = new Date(pedido.horaCreacion);
                const fin = new Date(pedido.horaListo);
                const minutos = (fin - inicio) / (1000 * 60);
                tiempoTotalPreparacion += minutos;
                pedidosConTiempo++;
            }
        });

        const tiempoPromedio = pedidosConTiempo > 0 ? 
            Math.round(tiempoTotalPreparacion / pedidosConTiempo) : 0;

        // Productos más vendidos
        const productosVendidos = {};
        
        pedidosFiltrados.forEach(pedido => {
            pedido.items.forEach(item => {
                if (!productosVendidos[item.id]) {
                    productosVendidos[item.id] = {
                        nombre: item.nombre,
                        cantidad: 0,
                        total: 0
                    };
                }
                productosVendidos[item.id].cantidad += item.cantidad;
                productosVendidos[item.id].total += item.subtotal;
            });
        });

        const productosTop = Object.values(productosVendidos)
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10);

        return {
            totalPedidos: pedidosFiltrados.length,
            porArea: {
                cocina: porArea.cocina.length,
                cafeteria: porArea.cafeteria.length
            },
            porEstado,
            tiempoPromedioPreparacion: tiempoPromedio,
            productosTop,
            ventaTotal: pedidosFiltrados.reduce((sum, pedido) => sum + (pedido.total || 0), 0)
        };
    } catch (error) {
        console.error('Error analizando pedidos:', error);
        return null;
    }
}

// Inicializar sistema de pedidos global
let sistemaPedidos = null;

document.addEventListener('DOMContentLoaded', function() {
    sistemaPedidos = new SistemaPedidos();
});

// Exportar para uso global
window.Carrito = Carrito;
window.SistemaPedidos = SistemaPedidos;
window.sistemaPedidos = sistemaPedidos;
window.analizarPedidosPorPeriodo = analizarPedidosPorPeriodo;