// ===== SISTEMA DE MENÚ Y EXTRAS - CORREGIDO =====

class SistemaMenu {
    constructor() {
        this.menu = [];
        this.categorias = new Set();
        this.filtroActual = 'todos';
        this.busquedaActual = '';
        this.productoSeleccionado = null;
        this.cargarMenu();
    }

    async cargarMenu() {
        try {
            this.menu = await obtenerMenuCompleto();
            if (!this.menu || this.menu.length === 0) {
                console.warn('Menú vacío, cargando datos por defecto');
                await this.cargarMenuPorDefecto();
            }
            this.extraerCategorias();
            console.log('Menú cargado:', this.menu.length, 'productos');
        } catch (error) {
            console.error('Error cargando menú:', error);
            await this.cargarMenuPorDefecto();
        }
    }

    async cargarMenuPorDefecto() {
        this.menu = [
            // COCINA
            { 
                id: 'taco-pastor', 
                nombre: 'Tacos al Pastor', 
                precio: 85, 
                categoria: 'tacos', 
                area: 'cocina',
                descripcion: '4 tacos de pastor con piña y cebolla',
                extras: [
                    { id: 'extra-queso', nombre: 'Extra Queso', precio: 15 },
                    { id: 'extra-guacamole', nombre: 'Extra Guacamole', precio: 20 }
                ],
                requiereComentario: false,
                disponible: true,
                destacado: true,
                icono: 'fas fa-pepper-hot'
            },
            { 
                id: 'hamburguesa-clasica', 
                nombre: 'Hamburguesa Clásica', 
                precio: 120, 
                categoria: 'hamburguesas', 
                area: 'cocina',
                descripcion: 'Hamburguesa con queso, lechuga, tomate y papas',
                extras: [
                    { id: 'extra-queso', nombre: 'Extra Queso', precio: 15 },
                    { id: 'doble-carne', nombre: 'Doble Carne', precio: 40 },
                    { id: 'extra-tocino', nombre: 'Extra Tocino', precio: 25 }
                ],
                requiereComentario: true,
                disponible: true,
                destacado: true,
                icono: 'fas fa-hamburger'
            },
            { 
                id: 'quesadilla-pollo', 
                nombre: 'Quesadilla de Pollo', 
                precio: 95, 
                categoria: 'tacos', 
                area: 'cocina',
                descripcion: 'Quesadilla con pollo, queso y aguacate',
                extras: [
                    { id: 'extra-queso', nombre: 'Extra Queso', precio: 15 }
                ],
                requiereComentario: false,
                disponible: true,
                icono: 'fas fa-cheese'
            },
            { 
                id: 'alitas-bbq', 
                nombre: 'Alitas BBQ', 
                precio: 135, 
                categoria: 'entradas', 
                area: 'cocina',
                descripcion: '10 alitas bañadas en salsa BBQ con papas',
                extras: [
                    { id: 'extra-salsa', nombre: 'Extra Salsa', precio: 10 }
                ],
                requiereComentario: false,
                disponible: true,
                icono: 'fas fa-drumstick-bite'
            },
            { 
                id: 'ensalada-cesar', 
                nombre: 'Ensalada César', 
                precio: 85, 
                categoria: 'ensaladas', 
                area: 'cocina',
                descripcion: 'Ensalada César con pollo a la parrilla',
                extras: [
                    { id: 'extra-pollo', nombre: 'Extra Pollo', precio: 25 },
                    { id: 'extra-queso', nombre: 'Extra Queso Parmesano', precio: 15 }
                ],
                requiereComentario: false,
                disponible: true,
                icono: 'fas fa-leaf'
            },
            
            // CAFETERÍA
            { 
                id: 'crepa-nutella', 
                nombre: 'Crepas de Nutella', 
                precio: 75, 
                categoria: 'crepas', 
                area: 'cafeteria',
                descripcion: 'Crepas con nutella y fresas frescas',
                extras: [
                    { id: 'extra-nutella', nombre: 'Extra Nutella', precio: 20 },
                    { id: 'extra-helado', nombre: 'Extra Helado', precio: 25 },
                    { id: 'extra-fresa', nombre: 'Extra Fresas', precio: 15 }
                ],
                requiereComentario: false,
                disponible: true,
                express: true,
                destacado: true,
                icono: 'fas fa-pancakes'
            },
            { 
                id: 'cafe-americano', 
                nombre: 'Café Americano', 
                precio: 35, 
                categoria: 'bebidas', 
                area: 'cafeteria',
                descripcion: 'Café americano caliente',
                extras: [
                    { id: 'extra-leche', nombre: 'Extra Leche', precio: 10 },
                    { id: 'extra-azucar', nombre: 'Extra Azúcar', precio: 5 }
                ],
                requiereComentario: false,
                disponible: true,
                express: true,
                icono: 'fas fa-coffee'
            },
            { 
                id: 'smoothie-fresa', 
                nombre: 'Smoothie de Fresa', 
                precio: 65, 
                categoria: 'bebidas', 
                area: 'cafeteria',
                descripcion: 'Smoothie natural de fresa con yogurt',
                extras: [
                    { id: 'extra-proteina', nombre: 'Extra Proteína', precio: 25 },
                    { id: 'extra-fresa', nombre: 'Extra Fresa', precio: 15 }
                ],
                requiereComentario: false,
                disponible: true,
                express: true,
                icono: 'fas fa-blender'
            },
            { 
                id: 'te-verde', 
                nombre: 'Té Verde', 
                precio: 40, 
                categoria: 'bebidas', 
                area: 'cafeteria',
                descripcion: 'Té verde natural con miel',
                extras: [
                    { id: 'extra-miel', nombre: 'Extra Miel', precio: 10 }
                ],
                requiereComentario: false,
                disponible: true,
                icono: 'fas fa-mug-hot'
            },
            { 
                id: 'frappe-chocolate', 
                nombre: 'Frappe Chocolate', 
                precio: 75, 
                categoria: 'bebidas', 
                area: 'cafeteria',
                descripcion: 'Frappe de chocolate con crema batida',
                extras: [
                    { id: 'extra-crema', nombre: 'Extra Crema Batida', precio: 15 },
                    { id: 'extra-chocolate', nombre: 'Extra Chocolate', precio: 20 }
                ],
                requiereComentario: false,
                disponible: true,
                express: true,
                icono: 'fas fa-ice-cream'
            },
            { 
                id: 'crepa-queso', 
                nombre: 'Crepas de Queso', 
                precio: 85, 
                categoria: 'crepas', 
                area: 'cafeteria',
                descripcion: 'Crepas con queso gratinado y jamón',
                extras: [
                    { id: 'extra-queso', nombre: 'Extra Queso', precio: 15 },
                    { id: 'extra-jamon', nombre: 'Extra Jamón', precio: 20 }
                ],
                requiereComentario: false,
                disponible: true,
                icono: 'fas fa-cheese'
            }
        ];
        
        // Guardar en localStorage
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('bermely_menu', JSON.stringify(this.menu));
        }
        
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

    filtrarPorArea(area) {
        return this.menu.filter(producto => producto.area === area);
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

    getProductosExpress() {
        return this.menu.filter(producto => producto.express === true);
    }

    getProductoPorId(id) {
        return this.menu.find(producto => producto.id === id);
    }

    getProductosDestacados() {
        return this.menu.filter(producto => producto.destacado === true);
    }

    calcularPrecioConExtras(producto, extrasSeleccionados = []) {
        const precioBase = producto.precio;
        const precioExtras = extrasSeleccionados.reduce((sum, extra) => sum + extra.precio, 0);
        return precioBase + precioExtras;
    }

    // NUEVO: Renderizar menú con función de callback para selección
    renderizarProductos(containerId, onClickCallback, filtroCategoria = null, filtroArea = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Contenedor no encontrado:', containerId);
            return;
        }

        let productosMostrar = this.menu;
        
        if (filtroCategoria && filtroCategoria !== 'todos') {
            productosMostrar = productosMostrar.filter(p => p.categoria === filtroCategoria);
        }
        
        if (filtroArea) {
            productosMostrar = productosMostrar.filter(p => p.area === filtroArea);
        }
        
        if (productosMostrar.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-utensils"></i>
                    <p>No se encontraron productos</p>
                    <small>Intenta con otra categoría o área</small>
                </div>
            `;
            return;
        }

        container.innerHTML = productosMostrar.map(producto => {
            const iconoArea = producto.area === 'cocina' ? '🍳' : '☕';
            const iconoCategoria = producto.icono || this.getIconoCategoria(producto.categoria);
            
            return `
                <div class="producto-card" onclick="${onClickCallback}('${producto.id}')">
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
                            <i class="${iconoCategoria}"></i> 
                            ${this.getNombreCategoria(producto.categoria)}
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
                    
                    ${producto.destacado ? `
                        <div class="producto-destacado">
                            <i class="fas fa-star"></i> Destacado
                        </div>
                    ` : ''}
                    
                    ${producto.express ? `
                        <div class="producto-express">
                            <i class="fas fa-bolt"></i> Venta Express
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // NUEVO: Renderizar categorías con filtro por área
    renderizarCategorias(containerId, areaFiltro = null, onChangeCallback = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Filtrar categorías según el área
        let categoriasFiltradas = this.getCategorias();
        if (areaFiltro) {
            categoriasFiltradas = categoriasFiltradas.filter(categoria => {
                return this.menu.some(producto => 
                    producto.categoria === categoria && producto.area === areaFiltro
                );
            });
        }

        let html = `
            <button class="btn-categoria ${this.filtroActual === 'todos' ? 'active' : ''}" 
                    onclick="${onChangeCallback || 'filtrarMenuPorCategoria'}('todos')">
                <i class="fas fa-th"></i> Todos
            </button>
        `;

        categoriasFiltradas.forEach(categoria => {
            const icono = this.getIconoCategoria(categoria);
            const nombre = this.getNombreCategoria(categoria);
            
            html += `
                <button class="btn-categoria ${this.filtroActual === categoria ? 'active' : ''}" 
                        onclick="${onChangeCallback || 'filtrarMenuPorCategoria'}('${categoria}')">
                    <i class="fas fa-${icono}"></i> 
                    ${nombre}
                </button>
            `;
        });

        container.innerHTML = html;
    }

    // NUEVO: Renderizar filtros por área
    renderizarFiltrosArea(containerId, areaSeleccionada = null, onChangeCallback = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div class="filtro-area">
                <h4>Filtrar por área:</h4>
                <div class="area-filtros">
                    <button class="btn-area ${!areaSeleccionada ? 'active' : ''}" 
                            onclick="${onChangeCallback || 'cambiarAreaFiltro'}(null)">
                        <i class="fas fa-th"></i> Todas
                    </button>
                    <button class="btn-area ${areaSeleccionada === 'cocina' ? 'active' : ''}" 
                            onclick="${onChangeCallback || 'cambiarAreaFiltro'}('cocina')">
                        <i class="fas fa-fire"></i> Cocina
                    </button>
                    <button class="btn-area ${areaSeleccionada === 'cafeteria' ? 'active' : ''}" 
                            onclick="${onChangeCallback || 'cambiarAreaFiltro'}('cafeteria')">
                        <i class="fas fa-coffee"></i> Cafetería
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // NUEVO: Renderizar extras para modal
    renderizarExtrasParaModal(productoId, onExtraChangeCallback = null) {
        const producto = this.getProductoPorId(productoId);
        if (!producto || !producto.extras || producto.extras.length === 0) {
            return '<p>No hay extras disponibles para este producto.</p>';
        }

        let html = `
            <div class="extras-section">
                <h4><i class="fas fa-plus-circle"></i> Extras Disponibles</h4>
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
                               onchange="${onExtraChangeCallback || 'actualizarTotalConExtras'}()">
                        <div class="extra-content">
                            <span class="extra-nombre">${extra.nombre}</span>
                            <span class="extra-precio">+$${extra.precio.toFixed(2)}</span>
                        </div>
                    </label>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        return html;
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
        if (!usuario || (usuario.rol !== 'admin' && usuario.rol !== 'gerente')) {
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
        const productosDestacados = this.menu.filter(p => p.destacado === true).length;

        return {
            totalProductos,
            porArea,
            porCategoria,
            conExtras,
            productosExpress,
            productosDestacados,
            precioPromedio: this.menu.reduce((sum, p) => sum + p.precio, 0) / totalProductos || 0
        };
    }

    // NUEVO: Buscar productos con filtros múltiples
    buscarProductosAvanzado(filtros = {}) {
        let resultados = this.menu;
        
        if (filtros.area) {
            resultados = resultados.filter(p => p.area === filtros.area);
        }
        
        if (filtros.categoria && filtros.categoria !== 'todos') {
            resultados = resultados.filter(p => p.categoria === filtros.categoria);
        }
        
        if (filtros.disponible !== undefined) {
            resultados = resultados.filter(p => p.disponible === filtros.disponible);
        }
        
        if (filtros.termino) {
            const termino = filtros.termino.toLowerCase();
            resultados = resultados.filter(p => 
                p.nombre.toLowerCase().includes(termino) ||
                p.descripcion?.toLowerCase().includes(termino)
            );
        }
        
        return resultados;
    }
}

// Inicializar sistema de menú global
let sistemaMenu = null;

document.addEventListener('DOMContentLoaded', async function() {
    sistemaMenu = new SistemaMenu();
    await sistemaMenu.cargarMenu();
    
    // Verificar que el menú se cargó correctamente
    console.log('SistemaMenu inicializado:', sistemaMenu.menu.length, 'productos');
});

// Funciones globales para uso desde HTML
window.filtrarMenuPorCategoria = function(categoria) {
    if (sistemaMenu) {
        sistemaMenu.filtroActual = categoria;
        
        // Renderizar productos con la categoría seleccionada
        const callback = window.agregarProductoAlCarrito || 'seleccionarProducto';
        sistemaMenu.renderizarProductos('menuGrid', callback, categoria);
        
        // Actualizar botones activos
        document.querySelectorAll('.btn-categoria').forEach(btn => {
            btn.classList.remove('active');
        });
        if (event && event.target) {
            event.target.classList.add('active');
        }
    }
};

window.cambiarAreaFiltro = function(area) {
    if (sistemaMenu) {
        // Esta función se implementa en cada página según sea necesario
        console.log('Cambiar área filtro a:', area);
    }
};

window.buscarProductos = function() {
    if (sistemaMenu) {
        const termino = document.getElementById('buscarProducto')?.value || '';
        const resultados = sistemaMenu.buscarProductos(termino);
        
        const callback = window.agregarProductoAlCarrito || 'seleccionarProducto';
        const container = document.getElementById('menuGrid');
        
        if (container) {
            container.innerHTML = resultados.map(producto => {
                const iconoArea = producto.area === 'cocina' ? '🍳' : '☕';
                const iconoCategoria = sistemaMenu.getIconoCategoria(producto.categoria);
                
                return `
                    <div class="producto-card" onclick="${callback}('${producto.id}')">
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
                                <i class="fas fa-${iconoCategoria}"></i> 
                                ${sistemaMenu.getNombreCategoria(producto.categoria)}
                            </div>
                            
                            ${producto.descripcion ? `
                                <div class="producto-desc">
                                    ${producto.descripcion}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            if (resultados.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <p>No se encontraron productos</p>
                        <small>Intenta con otro término de búsqueda</small>
                    </div>
                `;
            }
        }
    }
};

// Función global para seleccionar producto (se sobreescribe en cada página)
window.seleccionarProducto = function(productoId) {
    console.log('Seleccionar producto:', productoId);
    // Esta función se implementa en cada página específicamente
    if (window.abrirModalProducto) {
        window.abrirModalProducto(productoId);
    }
};

// Función para actualizar total con extras
window.actualizarTotalConExtras = function() {
    if (window.actualizarTotalProducto) {
        window.actualizarTotalProducto();
    }
};

// Exportar para uso global
window.SistemaMenu = SistemaMenu;
window.sistemaMenu = sistemaMenu;
window.obtenerMenuCompleto = obtenerMenuCompleto;
window.obtenerProductoPorId = obtenerProductoPorId;