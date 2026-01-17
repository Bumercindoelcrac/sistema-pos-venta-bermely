// ===== SISTEMA DE MENÚ Y EXTRAS =====

class SistemaMenu {
    constructor() {
        this.menu = [];
        this.categorias = new Set();
        this.filtroActual = 'todos';
        this.busquedaActual = '';
        this.cargarMenu();
    }

    async cargarMenu() {
        this.menu = await obtenerMenuCompleto();
        this.extraerCategorias();
    }

    extraerCategorias() {
        this.categorias.clear();
        this.menu.forEach(producto => {
            this.categorias.add(producto.categoria);
        });
    }

    getCategorias() {
        return Array.from(this.categorias);
    }

    filtrarPorCategoria(categoria) {
        if (categoria === 'todos') {
            this.filtroActual = 'todos';
            return this.menu;
        }
        
        this.filtroActual = categoria;
        return this.menu.filter(producto => producto.categoria === categoria);
    }

    buscarProductos(termino) {
        this.busquedaActual = termino.toLowerCase();
        
        if (!termino) {
            return this.filtrarPorCategoria(this.filtroActual);
        }
        
        return this.menu.filter(producto => 
            producto.nombre.toLowerCase().includes(this.busquedaActual) ||
            producto.descripcion?.toLowerCase().includes(this.busquedaActual)
        );
    }

    filtrarPorArea(area) {
        return this.menu.filter(producto => producto.area === area);
    }

    getProductosExpress() {
        return this.menu.filter(producto => producto.express === true);
    }

    getProductoPorId(id) {
        return this.menu.find(producto => producto.id === id);
    }

    calcularPrecioConExtras(producto, extrasSeleccionados = []) {
        const precioBase = producto.precio;
        const precioExtras = extrasSeleccionados.reduce((sum, extra) => sum + extra.precio, 0);
        return precioBase + precioExtras;
    }

    renderizarCategorias(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let html = `
            <button class="btn-categoria ${this.filtroActual === 'todos' ? 'active' : ''}" 
                    onclick="filtrarMenuPorCategoria('todos')">
                <i class="fas fa-th"></i> Todos
            </button>
        `;

        this.getCategorias().forEach(categoria => {
            html += `
                <button class="btn-categoria ${this.filtroActual === categoria ? 'active' : ''}" 
                        onclick="filtrarMenuPorCategoria('${categoria}')">
                    <i class="fas fa-${this.getIconoCategoria(categoria)}"></i> 
                    ${this.getNombreCategoria(categoria)}
                </button>
            `;
        });

        container.innerHTML = html;
    }

    renderizarProductos(containerId, productos = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const productosMostrar = productos || this.filtrarPorCategoria(this.filtroActual);
        
        if (productosMostrar.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <p>No se encontraron productos</p>
                    <small>Intenta con otra búsqueda o categoría</small>
                </div>
            `;
            return;
        }

        let html = '';
        
        productosMostrar.forEach(producto => {
            const iconoArea = producto.area === 'cocina' ? '🍳' : '☕';
            
            html += `
                <div class="producto-card" onclick="agregarProductoAlCarrito('${producto.id}')">
                    <div class="producto-header">
                        <div class="producto-nombre">
                            ${producto.nombre}
                            <span class="producto-area ${producto.area}">
                                ${iconoArea}
                            </span>
                        </div>
                        <div class="producto-precio">
                            $${producto.precio.toFixed(2)}
                        </div>
                    </div>
                    
                    <div class="producto-info">
                        <div class="producto-categoria">
                            <i class="fas fa-tag"></i> ${this.getNombreCategoria(producto.categoria)}
                        </div>
                        
                        ${producto.descripcion ? `
                            <div class="producto-desc">
                                ${producto.descripcion}
                            </div>
                        ` : ''}
                        
                        ${producto.extras && producto.extras.length > 0 ? `
                            <div class="producto-extras-info">
                                <small>
                                    <i class="fas fa-plus-circle"></i>
                                    ${producto.extras.length} extras disponibles
                                </small>
                            </div>
                        ` : ''}
                        
                        ${producto.requiereComentario ? `
                            <div class="producto-alerta">
                                <i class="fas fa-exclamation-circle"></i>
                                Requiere comentario para cocina
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderizarExtras(containerId, productoId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const producto = this.getProductoPorId(productoId);
        if (!producto || !producto.extras || producto.extras.length === 0) {
            container.innerHTML = '';
            return;
        }

        let html = `
            <div class="extras-section">
                <h5>Extras Disponibles:</h5>
                <div class="extras-grid">
        `;

        producto.extras.forEach(extra => {
            html += `
                <div class="extra-option">
                    <label class="extra-checkbox-label">
                        <input type="checkbox" 
                               class="extra-checkbox" 
                               data-id="${extra.id}"
                               data-nombre="${extra.nombre}"
                               data-precio="${extra.precio}"
                               onchange="actualizarTotalConExtras()">
                        <span class="extra-nombre">${extra.nombre}</span>
                        <span class="extra-precio">+$${extra.precio.toFixed(2)}</span>
                    </label>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    getIconoCategoria(categoria) {
        const iconos = {
            'tacos': 'pepper-hot',
            'hamburguesas': 'hamburger',
            'crepas': 'pancakes',
            'bebidas': 'coffee',
            'postres': 'ice-cream',
            'entradas': 'utensils',
            'ensaladas': 'leaf'
        };
        
        return iconos[categoria] || 'utensils';
    }

    getNombreCategoria(categoria) {
        const nombres = {
            'tacos': 'Tacos',
            'hamburguesas': 'Hamburguesas',
            'crepas': 'Crepas',
            'bebidas': 'Bebidas',
            'postres': 'Postres',
            'entradas': 'Entradas',
            'ensaladas': 'Ensaladas'
        };
        
        return nombres[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
    }

    async agregarProducto(nuevoProducto) {
        // Solo admin puede agregar productos
        const usuario = getUsuarioActual();
        if (!usuario || usuario.rol !== 'admin') {
            return false;
        }

        // Generar ID único
        nuevoProducto.id = 'producto-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Agregar a la lista
        this.menu.push(nuevoProducto);
        this.categorias.add(nuevoProducto.categoria);

        // Guardar en storage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('bermely_menu', JSON.stringify(this.menu));
        }

        return nuevoProducto.id;
    }

    async actualizarProducto(id, datos) {
        const index = this.menu.findIndex(producto => producto.id === id);
        
        if (index !== -1) {
            this.menu[index] = { ...this.menu[index], ...datos };
            
            // Actualizar categorías si cambió
            if (datos.categoria) {
                this.categorias.add(datos.categoria);
            }

            // Guardar en storage
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('bermely_menu', JSON.stringify(this.menu));
            }

            return true;
        }

        return false;
    }

    async eliminarProducto(id) {
        const index = this.menu.findIndex(producto => producto.id === id);
        
        if (index !== -1) {
            this.menu.splice(index, 1);
            
            // Recalcular categorías
            this.extraerCategorias();

            // Guardar en storage
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('bermely_menu', JSON.stringify(this.menu));
            }

            return true;
        }

        return false;
    }

    getEstadisticas() {
        const totalProductos = this.menu.length;
        
        const porArea = {
            cocina: this.menu.filter(p => p.area === 'cocina').length,
            cafeteria: this.menu.filter(p => p.area === 'cafeteria').length
        };
        
        const porCategoria = {};
        this.categorias.forEach(categoria => {
            porCategoria[categoria] = this.menu.filter(p => p.categoria === categoria).length;
        });

        const conExtras = this.menu.filter(p => p.extras && p.extras.length > 0).length;
        const productosExpress = this.menu.filter(p => p.express === true).length;

        return {
            totalProductos,
            porArea,
            porCategoria,
            conExtras,
            productosExpress,
            precioPromedio: this.menu.reduce((sum, p) => sum + p.precio, 0) / totalProductos
        };
    }
}

// Inicializar sistema de menú global
let sistemaMenu = null;

document.addEventListener('DOMContentLoaded', async function() {
    sistemaMenu = new SistemaMenu();
    await sistemaMenu.cargarMenu();
});

// Funciones globales para uso desde HTML
window.filtrarMenuPorCategoria = function(categoria) {
    if (sistemaMenu) {
        sistemaMenu.filtrarPorCategoria(categoria);
        sistemaMenu.renderizarProductos('menuGrid');
        
        // Actualizar botones activos
        document.querySelectorAll('.btn-categoria').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }
};

window.buscarProductos = function() {
    if (sistemaMenu) {
        const termino = document.getElementById('buscarProducto').value;
        const resultados = sistemaMenu.buscarProductos(termino);
        sistemaMenu.renderizarProductos('menuGrid', resultados);
    }
};

window.agregarProductoAlCarrito = function(productoId) {
    // Esta función se implementa en cada página según sea necesario
    console.log('Agregar producto al carrito:', productoId);
};

window.actualizarTotalConExtras = function() {
    // Esta función se implementa en cada página según sea necesario
    console.log('Actualizar total con extras');
};

// Exportar para uso global
window.SistemaMenu = SistemaMenu;
window.sistemaMenu = sistemaMenu;
window.obtenerMenuCompleto = obtenerMenuCompleto;
window.obtenerProductoPorId = obtenerProductoPorId;