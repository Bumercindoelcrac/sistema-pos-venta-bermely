// js/database.js - SISTEMA DE BASE DE DATOS REAL
class Database {
    constructor() {
        this.dbName = 'bermely_pos_db';
        this.initDatabase();
    }

    async initDatabase() {
        // Crear estructura inicial si no existe
        if (!localStorage.getItem('system_initialized')) {
            await this.initializeSystemData();
            localStorage.setItem('system_initialized', 'true');
        }
    }

    async initializeSystemData() {
        // ===== CREAR LAS 12 MESAS REALES =====
        const mesas = {
            "mesa_1": { id: 1, nombre: "Mesa 1", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_2": { id: 2, nombre: "Mesa 2", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_3": { id: 3, nombre: "Mesa 3", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_4": { id: 4, nombre: "Mesa 4", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_5": { id: 5, nombre: "Mesa 5", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_6": { id: 6, nombre: "Mesa 6", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_7": { id: 7, nombre: "Mesa 7", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_8": { id: 8, nombre: "Mesa 8", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_9": { id: 9, nombre: "Mesa 9", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "mesa_10": { id: 10, nombre: "Mesa 10", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "para_llevar": { id: 11, nombre: "PARA LLEVAR", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() },
            "envios": { id: 12, nombre: "ENVÍOS", estado: "libre", cliente: "", personas: 0, mesero: "", total: 0, carrito: [], pedidos: [], timestamp: Date.now() }
        };
        localStorage.setItem('mesas', JSON.stringify(mesas));

        // ===== CREAR USUARIOS REALES =====
        const usuarios = {
            "admin": { 
                username: "admin", 
                password: "admin123", 
                nombre: "Administrador Principal", 
                rol: "admin", 
                activo: true,
                fecha_registro: new Date().toISOString()
            },
            "gerente": { 
                username: "gerente", 
                password: "gerente123", 
                nombre: "Gerente del Restaurante", 
                rol: "gerente", 
                activo: true,
                fecha_registro: new Date().toISOString()
            },
            "mesero1": { 
                username: "mesero1", 
                password: "mesero123", 
                nombre: "Juan Pérez", 
                rol: "mesero", 
                activo: true,
                turno: "matutino",
                fecha_registro: new Date().toISOString()
            },
            "mesero2": { 
                username: "mesero2", 
                password: "mesero123", 
                nombre: "María López", 
                rol: "mesero", 
                activo: true,
                turno: "vespertino",
                fecha_registro: new Date().toISOString()
            },
            "cocina": { 
                username: "cocina", 
                password: "cocina123", 
                nombre: "Chef Principal", 
                rol: "cocina", 
                activo: true,
                fecha_registro: new Date().toISOString()
            },
            "cafeteria": { 
                username: "cafeteria", 
                password: "cafe123", 
                nombre: "Barista", 
                rol: "cafeteria", 
                activo: true,
                fecha_registro: new Date().toISOString()
            }
        };
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // ===== CREAR MENÚ REAL CON EXTRAS =====
        const menu = {
            "categorias": [
                { id: "entradas", nombre: "Entradas", area: "cocina" },
                { id: "platos_fuertes", nombre: "Platos Fuertes", area: "cocina" },
                { id: "postres", nombre: "Postres", area: "cocina" },
                { id: "bebidas_calientes", nombre: "Bebidas Calientes", area: "cafeteria" },
                { id: "bebidas_frias", nombre: "Bebidas Frías", area: "cafeteria" },
                { id: "smoothies", nombre: "Smoothies", area: "cafeteria" }
            ],
            "productos": [
                // PRODUCTOS DE COCINA
                {
                    id: "tacos_pastor",
                    nombre: "Tacos al Pastor",
                    descripcion: "3 tacos de pastor con piña, cebolla y cilantro",
                    precio: 85,
                    categoria: "platos_fuertes",
                    area: "cocina",
                    extras: [
                        { id: "extra_queso", nombre: "Extra Queso", precio: 15 },
                        { id: "extra_guacamole", nombre: "Extra Guacamole", precio: 20 },
                        { id: "extra_crema", nombre: "Extra Crema", precio: 10 }
                    ]
                },
                {
                    id: "hamburguesa_clasica",
                    nombre: "Hamburguesa Clásica",
                    descripcion: "Carne de res, queso, lechuga, tomate y papas",
                    precio: 120,
                    categoria: "platos_fuertes",
                    area: "cocina",
                    extras: [
                        { id: "extra_tocino", nombre: "Extra Tocino", precio: 25 },
                        { id: "extra_huevo", nombre: "Extra Huevo", precio: 15 },
                        { id: "doble_carne", nombre: "Doble Carne", precio: 40 }
                    ]
                },
                {
                    id: "ensalada_cesar",
                    nombre: "Ensalada César",
                    descripcion: "Lechuga romana, pollo, croutones, aderezo césar",
                    precio: 75,
                    categoria: "entradas",
                    area: "cocina",
                    extras: [
                        { id: "extra_pollo", nombre: "Extra Pollo", precio: 25 },
                        { id: "extra_queso_parmesano", nombre: "Extra Queso Parmesano", precio: 15 }
                    ]
                },
                // PRODUCTOS DE CAFETERÍA
                {
                    id: "cafe_americano",
                    nombre: "Café Americano",
                    descripcion: "Café negro americano",
                    precio: 35,
                    categoria: "bebidas_calientes",
                    area: "cafeteria",
                    extras: [
                        { id: "shot_extra", nombre: "Shot Extra", precio: 10 },
                        { id: "leche", nombre: "Extra Leche", precio: 5 },
                        { id: "azucar", nombre: "Azúcar Extra", precio: 0 }
                    ]
                },
                {
                    id: "cafe_latte",
                    nombre: "Café Latte",
                    descripcion: "Café con leche vaporizada",
                    precio: 45,
                    categoria: "bebidas_calientes",
                    area: "cafeteria",
                    extras: [
                        { id: "vainilla", nombre: "Sirope de Vainilla", precio: 8 },
                        { id: "caramelo", nombre: "Sirope de Caramelo", precio: 8 },
                        { id: "leche_almendra", nombre: "Leche de Almendra", precio: 10 }
                    ]
                },
                {
                    id: "smoothie_fresa",
                    nombre: "Smoothie de Fresa",
                    descripcion: "Smoothie natural de fresa con yogurt",
                    precio: 55,
                    categoria: "smoothies",
                    area: "cafeteria",
                    extras: [
                        { id: "proteina", nombre: "Proteína", precio: 20 },
                        { id: "miel", nombre: "Miel", precio: 5 },
                        { id: "chia", nombre: "Semillas de Chía", precio: 10 }
                    ]
                }
            ]
        };
        localStorage.setItem('menu', JSON.stringify(menu));

        // ===== INICIALIZAR HISTORIAL =====
        localStorage.setItem('ventas', JSON.stringify([]));
        localStorage.setItem('pedidos_cocina', JSON.stringify([]));
        localStorage.setItem('pedidos_cafeteria', JSON.stringify([]));
        localStorage.setItem('notificaciones', JSON.stringify([]));
        
        console.log('Sistema inicializado correctamente para producción');
    }

    // ===== MÉTODOS PARA MESAS =====
    getMesas() {
        return JSON.parse(localStorage.getItem('mesas')) || {};
    }

    getMesa(id) {
        const mesas = this.getMesas();
        return mesas[id] || null;
    }

    updateMesa(id, data) {
        const mesas = this.getMesas();
        if (mesas[id]) {
            mesas[id] = { ...mesas[id], ...data, timestamp: Date.now() };
            localStorage.setItem('mesas', JSON.stringify(mesas));
            
            // Notificar cambios a todos los clientes conectados
            this.notifyChange('mesa_update', { id, data: mesas[id] });
            return true;
        }
        return false;
    }

    // ===== MÉTODOS PARA PEDIDOS =====
    crearPedido(mesaId, productos, mesero) {
        const pedidoId = `pedido_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        // Separar productos por área AUTOMÁTICAMENTE
        const productosCocina = productos.filter(p => p.area === 'cocina');
        const productosCafeteria = productos.filter(p => p.area === 'cafeteria');
        
        const pedido = {
            id: pedidoId,
            mesaId: mesaId,
            mesero: mesero,
            timestamp: timestamp,
            productos: productos,
            estado: 'pendiente',
            total: this.calcularTotal(productos),
            areas: {
                cocina: productosCocina.length > 0,
                cafeteria: productosCafeteria.length > 0
            }
        };
        
        // Guardar pedido principal
        const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
        pedidos.push(pedido);
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        
        // Enviar a cocina si hay productos
        if (productosCocina.length > 0) {
            this.enviarACocina(pedidoId, mesaId, productosCocina);
        }
        
        // Enviar a cafetería si hay productos
        if (productosCafeteria.length > 0) {
            this.enviarACafeteria(pedidoId, mesaId, productosCafeteria);
        }
        
        // Actualizar mesa
        const mesa = this.getMesa(mesaId);
        if (mesa) {
            mesa.estado = 'en_preparacion';
            mesa.pedidos.push(pedidoId);
            mesa.total += pedido.total;
            this.updateMesa(mesaId, mesa);
        }
        
        return pedidoId;
    }

    enviarACocina(pedidoId, mesaId, productos) {
        const pedidosCocina = JSON.parse(localStorage.getItem('pedidos_cocina') || '[]');
        const comanda = {
            id: `cocina_${pedidoId}`,
            pedidoId: pedidoId,
            mesaId: mesaId,
            productos: productos,
            timestamp: Date.now(),
            estado: 'pendiente',
            area: 'cocina'
        };
        
        pedidosCocina.push(comanda);
        localStorage.setItem('pedidos_cocina', JSON.stringify(pedidosCocina));
        
        // Notificar a cocina
        this.crearNotificacion('cocina', `Nuevo pedido para ${mesaId}`, comanda);
    }

    enviarACafeteria(pedidoId, mesaId, productos) {
        const pedidosCafeteria = JSON.parse(localStorage.getItem('pedidos_cafeteria') || '[]');
        const comanda = {
            id: `cafeteria_${pedidoId}`,
            pedidoId: pedidoId,
            mesaId: mesaId,
            productos: productos,
            timestamp: Date.now(),
            estado: 'pendiente',
            area: 'cafeteria'
        };
        
        pedidosCafeteria.push(comanda);
        localStorage.setItem('pedidos_cafeteria', JSON.stringify(pedidosCafeteria));
        
        // Notificar a cafetería
        this.crearNotificacion('cafeteria', `Nuevo pedido para ${mesaId}`, comanda);
    }

    // ===== MÉTODOS PARA NOTIFICACIONES =====
    crearNotificacion(rol, mensaje, data) {
        const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
        const notificacion = {
            id: `notif_${Date.now()}`,
            rol: rol,
            mensaje: mensaje,
            data: data,
            timestamp: Date.now(),
            leida: false
        };
        
        notificaciones.push(notificacion);
        localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
        
        // Emitir evento para actualización en tiempo real
        window.dispatchEvent(new CustomEvent('nueva_notificacion', { detail: notificacion }));
    }

    // ===== MÉTODOS PARA VENTAS =====
    registrarVenta(mesaId, total, metodoPago, mesero) {
        const ventaId = `venta_${Date.now()}`;
        const venta = {
            id: ventaId,
            mesaId: mesaId,
            total: total,
            metodoPago: metodoPago,
            mesero: mesero,
            timestamp: Date.now(),
            fecha: new Date().toISOString().split('T')[0]
        };
        
        const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
        ventas.push(venta);
        localStorage.setItem('ventas', JSON.stringify(ventas));
        
        // Liberar mesa
        this.updateMesa(mesaId, {
            estado: 'libre',
            cliente: '',
            personas: 0,
            mesero: '',
            carrito: [],
            pedidos: [],
            total: 0
        });
        
        return ventaId;
    }

    // ===== MÉTODOS UTILITARIOS =====
    calcularTotal(productos) {
        return productos.reduce((total, producto) => {
            const precioBase = producto.precio;
            const extrasTotal = producto.extras?.reduce((sum, extra) => sum + extra.precio, 0) || 0;
            return total + ((precioBase + extrasTotal) * producto.cantidad);
        }, 0);
    }

    notifyChange(event, data) {
        window.dispatchEvent(new CustomEvent(`db_${event}`, { detail: data }));
    }
}

// Exportar instancia global
window.Database = new Database();