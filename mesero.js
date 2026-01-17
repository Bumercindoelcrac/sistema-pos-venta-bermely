// mesero.js - Sistema completo de pedidos para mesero
import { 
  db, 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from './firebase.js';

import { sistemaPedidos } from './pedidos.js';
import { obtenerMenuCompleto, renderizarMenu } from './menu-extras.js';

// Variable global para el espacio activo
let espacioActivo = null;
let usuarioActual = null;
let productoPendiente = null;

// Inicializar sistema del mesero
async function inicializarMesero(usuario) {
  usuarioActual = usuario;
  
  // Configurar eventos de los modales
  configurarEventosModales();
  
  // Cargar menú inicial
  await cargarMenuInicial();
  
  // Escuchar pedidos listos para entregar
  escucharPedidosListos();
}

// Configurar eventos de modales
function configurarEventosModales() {
  // Modal de cliente
  document.getElementById('btnConfirmarCliente')?.addEventListener('click', confirmarCliente);
  document.getElementById('btnCancelarCliente')?.addEventListener('click', cerrarModalCliente);
  
  // Modal de extras
  document.getElementById('btnConfirmarExtras')?.addEventListener('click', confirmarExtras);
  document.getElementById('btnCancelarExtras')?.addEventListener('click', cerrarModalExtras);
  document.getElementById('cantidadProducto')?.addEventListener('input', actualizarPrecioTotalModal);
  
  // Modal de cobro
  document.getElementById('btnConfirmarCobro')?.addEventListener('click', confirmarCobro);
  document.getElementById('btnCancelarCobro')?.addEventListener('click', cerrarModalCobro);
  document.getElementById('montoRecibido')?.addEventListener('input', calcularCambio);
  
  // Carrito
  document.getElementById('btnEnviarParcial')?.addEventListener('click', enviarPedidoParcial);
  document.getElementById('btnCerrarCuenta')?.addEventListener('click', abrirModalCobro);
  document.getElementById('btnLimpiarCarrito')?.addEventListener('click', limpiarCarrito);
  
  // Búsqueda
  document.getElementById('buscarProducto')?.addEventListener('input', filtrarMenuBusqueda);
  
  // Métodos de pago
  document.querySelectorAll('input[name="metodoPago"]')?.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const metodo = e.target.value;
      document.getElementById('seccionEfectivo').style.display = 
        metodo === 'efectivo' ? 'block' : 'none';
    });
  });
}

// Cargar menú inicial
async function cargarMenuInicial() {
  try {
    const menu = await obtenerMenuCompleto();
    renderizarMenu(menu, 'gridMenuAvanzado', onClickProducto, true);
  } catch (error) {
    console.error('Error cargando menú:', error);
  }
}

// Click en producto del menú
function onClickProducto(producto) {
  if (!espacioActivo) {
    mostrarAlerta('Por favor selecciona un espacio primero', 'warning');
    return;
  }

  productoPendiente = producto;
  
  // Configurar modal de extras
  document.getElementById('modalProductoNombre').textContent = producto.nombre;
  document.getElementById('modalPrecioBase').textContent = `$${producto.precio.toFixed(2)}`;
  document.getElementById('modalPrecioTotal').textContent = `$${producto.precio.toFixed(2)}`;
  document.getElementById('cantidadProducto').value = 1;
  document.getElementById('comentarioEspecial').value = '';
  
  // Limpiar y cargar extras
  const listaExtras = document.getElementById('listaExtras');
  listaExtras.innerHTML = '';
  
  if (producto.extras && producto.extras.length > 0) {
    producto.extras.forEach(extra => {
      const extraElement = document.createElement('div');
      extraElement.className = 'extra-option';
      extraElement.innerHTML = `
        <div class="extra-info">
          <div class="extra-nombre">${extra.nombre}</div>
          <div class="extra-precio">+$${extra.precio}</div>
        </div>
        <div class="extra-checkbox">
          <i class="fas fa-check" style="display: none;"></i>
        </div>
        <input type="checkbox" class="extra-checkbox-input" value="${extra.id}" style="display: none;">
      `;
      
      extraElement.addEventListener('click', () => {
        extraElement.classList.toggle('seleccionado');
        const checkbox = extraElement.querySelector('.extra-checkbox-input');
        checkbox.checked = !checkbox.checked;
        actualizarPrecioTotalModal();
      });
      
      listaExtras.appendChild(extraElement);
    });
  } else {
    listaExtras.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">No hay extras disponibles para este producto</p>';
  }
  
  document.getElementById('modalExtras').style.display = 'flex';
}

// Actualizar precio en modal de extras
function actualizarPrecioTotalModal() {
  if (!productoPendiente) return;
  
  let precioTotal = productoPendiente.precio;
  const cantidad = parseInt(document.getElementById('cantidadProducto').value) || 1;
  
  // Sumar extras seleccionados
  document.querySelectorAll('.extra-checkbox-input:checked').forEach(checkbox => {
    const extraId = checkbox.value;
    const extra = productoPendiente.extras.find(e => e.id === extraId);
    if (extra) {
      precioTotal += extra.precio;
    }
  });
  
  document.getElementById('modalPrecioTotal').textContent = `$${(precioTotal * cantidad).toFixed(2)}`;
}

// Confirmar extras y agregar al carrito
async function confirmarExtras() {
  if (!productoPendiente || !espacioActivo) return;
  
  const cantidad = parseInt(document.getElementById('cantidadProducto').value) || 1;
  const comentario = document.getElementById('comentarioEspecial').value.trim();
  
  // Obtener extras seleccionados
  const extrasSeleccionados = [];
  document.querySelectorAll('.extra-checkbox-input:checked').forEach(checkbox => {
    extrasSeleccionados.push(checkbox.value);
  });
  
  // Agregar al carrito
  const carrito = sistemaPedidos.obtenerCarrito(espacioActivo.id);
  carrito.agregarProducto(productoPendiente, cantidad, extrasSeleccionados, comentario);
  
  // Actualizar UI
  renderizarCarrito();
  cerrarModalExtras();
  mostrarAlerta(`${productoPendiente.nombre} agregado al carrito`, 'success');
}

// Cerrar modal de extras
function cerrarModalExtras() {
  document.getElementById('modalExtras').style.display = 'none';
  productoPendiente = null;
}

// Confirmar cliente para un espacio
async function confirmarCliente() {
  const nombreCliente = document.getElementById('nombreCliente').value.trim();
  if (!nombreCliente) {
    mostrarAlerta('Por favor ingresa el nombre del cliente', 'warning');
    return;
  }

  try {
    // En implementación real, esto guardaría en Firestore
    // Por ahora actualizamos el objeto local
    espacioActivo.cliente = nombreCliente;
    espacioActivo.mesero = usuarioActual.nombre;
    espacioActivo.estado = 'ocupada';
    
    // Crear carrito para este espacio
    sistemaPedidos.obtenerCarrito(
      espacioActivo.id,
      espacioActivo.nombre,
      nombreCliente,
      usuarioActual.nombre
    );
    
    cerrarModalCliente();
    activarEspacio(espacioActivo);
    mostrarAlerta(`Mesa ${espacioActivo.numero} asignada a ${nombreCliente}`, 'success');
  } catch (error) {
    mostrarAlerta('Error al asignar cliente: ' + error.message, 'danger');
  }
}

// Cerrar modal de cliente
function cerrarModalCliente() {
  document.getElementById('modalCliente').style.display = 'none';
  document.getElementById('nombreCliente').value = '';
  document.getElementById('telefonoCliente').value = '';
  espacioActivo = null;
}

// Activar espacio (mostrar carrito)
function activarEspacio(espacio) {
  espacioActivo = espacio;
  sistemaPedidos.setCarritoActivo(espacio.id);
  
  // Actualizar UI
  document.getElementById('nombreEspacioActivo').textContent = espacio.nombre;
  document.getElementById('clienteActivo').textContent = espacio.cliente || '-';
  document.getElementById('meseroActivo').textContent = espacio.mesero || '-';
  
  // Mostrar sección carrito
  document.getElementById('seccionCarrito').style.display = 'block';
  
  // Renderizar carrito
  renderizarCarrito();
}

// Renderizar carrito actual
function renderizarCarrito() {
  const carrito = sistemaPedidos.getCarritoActivo();
  const container = document.getElementById('carritoDetallado');
  
  if (!carrito || carrito.items.length === 0) {
    container.innerHTML = `
      <div class="carrito-vacio">
        <i class="fas fa-shopping-cart fa-3x"></i>
        <p>Agrega productos a este espacio</p>
      </div>
    `;
    
    document.getElementById('subtotalCarrito').textContent = '0.00';
    document.getElementById('totalItemsCarrito').textContent = '0';
    return;
  }
  
  let html = '';
  carrito.items.forEach((item, index) => {
    let extrasHTML = '';
    if (item.extras && item.extras.length > 0) {
      extrasHTML = `
        <div class="item-extras">
          ${item.extras.map(extra => 
            `<span class="extra">${extra.nombre} (+$${extra.precio})</span>`
          ).join('')}
        </div>
      `;
    }
    
    let comentarioHTML = '';
    if (item.comentario) {
      comentarioHTML = `
        <div class="item-comentario">
          <i class="fas fa-comment"></i> ${item.comentario}
        </div>
      `;
    }
    
    html += `
      <div class="carrito-item-detallado">
        <div class="item-detalles">
          <div class="item-nombre">
            ${item.nombre}
            <span class="item-area ${item.area}">${item.area}</span>
          </div>
          ${extrasHTML}
          ${comentarioHTML}
          <div class="item-cantidad-control">
            <button class="btn-cantidad" onclick="disminuirCantidadCarrito(${index})">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-cantidad" onclick="aumentarCantidadCarrito(${index})">+</button>
            <span class="item-precio">$${(item.precioTotal * item.cantidad).toFixed(2)}</span>
          </div>
        </div>
        <button class="btn-eliminar" onclick="eliminarItemCarrito(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Actualizar resumen
  document.getElementById('subtotalCarrito').textContent = carrito.total.toFixed(2);
  document.getElementById('totalItemsCarrito').textContent = carrito.items.length;
}

// Funciones globales para el carrito (llamadas desde HTML)
window.disminuirCantidadCarrito = function(index) {
  const carrito = sistemaPedidos.getCarritoActivo();
  if (carrito && carrito.items[index]) {
    if (carrito.items[index].cantidad > 1) {
      carrito.items[index].cantidad--;
      carrito.calcularTotal();
      renderizarCarrito();
    }
  }
};

window.aumentarCantidadCarrito = function(index) {
  const carrito = sistemaPedidos.getCarritoActivo();
  if (carrito && carrito.items[index]) {
    carrito.items[index].cantidad++;
    carrito.calcularTotal();
    renderizarCarrito();
  }
};

window.eliminarItemCarrito = function(index) {
  if (confirm('¿Eliminar este producto del carrito?')) {
    const carrito = sistemaPedidos.getCarritoActivo();
    if (carrito) {
      carrito.eliminarProducto(index);
      renderizarCarrito();
      mostrarAlerta('Producto eliminado del carrito', 'info');
    }
  }
};

// Limpiar carrito completo
function limpiarCarrito() {
  if (!espacioActivo) return;
  
  const carrito = sistemaPedidos.getCarritoActivo();
  if (carrito && carrito.items.length > 0) {
    if (confirm('¿Limpiar todo el carrito de este espacio?')) {
      carrito.limpiar();
      renderizarCarrito();
      mostrarAlerta('Carrito limpiado', 'info');
    }
  }
}

// ENVIAR PEDIDO A COCINA/CAFETERÍA
async function enviarPedidoParcial() {
  const carrito = sistemaPedidos.getCarritoActivo();
  if (!carrito || carrito.items.length === 0) {
    mostrarAlerta('El carrito está vacío', 'warning');
    return;
  }

  if (!confirm(`¿Enviar pedido de $${carrito.total.toFixed(2)} a cocina/cafetería?`)) {
    return;
  }

  try {
    // Separar por área
    const grupos = carrito.agruparPorArea();
    let pedidosCreados = [];
    
    // Crear pedido para cocina
    if (grupos.cocina.length > 0) {
      const pedidoCocina = await crearPedidoFirestore('cocina', grupos.cocina);
      pedidosCreados.push(pedidoCocina);
    }
    
    // Crear pedido para cafetería
    if (grupos.cafeteria.length > 0) {
      const pedidoCafeteria = await crearPedidoFirestore('cafeteria', grupos.cafeteria);
      pedidosCreados.push(pedidoCafeteria);
    }
    
    // Limpiar solo los items enviados
    carrito.items = carrito.items.filter(item => 
      !grupos.cocina.includes(item) && !grupos.cafeteria.includes(item)
    );
    
    carrito.calcularTotal();
    renderizarCarrito();
    
    mostrarAlerta(`¡Pedido enviado! ${pedidosCreados.length} pedido(s) creado(s)`, 'success');
  } catch (error) {
    mostrarAlerta('Error al enviar pedido: ' + error.message, 'danger');
  }
}

// Crear pedido en Firestore
async function crearPedidoFirestore(area, items) {
  try {
    const carrito = sistemaPedidos.getCarritoActivo();
    if (!carrito || !espacioActivo) return null;
    
    const pedidoData = {
      espacioId: espacioActivo.id,
      espacioNombre: espacioActivo.nombre,
      cliente: carrito.cliente,
      mesero: carrito.mesero,
      area: area,
      items: items,
      total: items.reduce((sum, item) => sum + (item.precioTotal * item.cantidad), 0),
      estado: 'enviado',
      timestamp: serverTimestamp()
    };
    
    // En implementación real, esto guardaría en Firestore
    // const pedidoRef = await addDoc(collection(db, "pedidos"), pedidoData);
    console.log('Pedido creado en Firestore:', pedidoData);
    
    return { id: 'simulado-' + Date.now(), ...pedidoData };
  } catch (error) {
    console.error('Error creando pedido:', error);
    throw error;
  }
}

// ESCUCHAR PEDIDOS LISTOS PARA ENTREGAR
function escucharPedidosListos() {
  // En implementación real, esto escucharía Firestore
  // Por ahora simulamos con intervalo
  setInterval(() => {
    // Simular actualización de pedidos listos
    actualizarPedidosListosUI();
  }, 3000);
}

// Actualizar UI de pedidos listos
function actualizarPedidosListosUI() {
  // En implementación real, esto vendría de Firestore
  const pedidosListosSimulados = [
    {
      id: 'pedido-1',
      espacioNombre: 'Mesa 3',
      cliente: 'Familia López',
      area: 'cocina',
      items: [
        { nombre: 'Tacos al Pastor', cantidad: 2, precioTotal: 120, extras: [], comentario: 'Sin cebolla' }
      ],
      timestamp: new Date(Date.now() - 600000) // 10 minutos atrás
    },
    {
      id: 'pedido-2',
      espacioNombre: 'Mesa 5',
      cliente: 'Juan Pérez',
      area: 'cafeteria',
      items: [
        { nombre: 'Café Americano', cantidad: 1, precioTotal: 35, extras: [], comentario: '' },
        { nombre: 'Crepas de Nutella', cantidad: 1, precioTotal: 75, extras: [{nombre: 'Extra Nutella', precio: 15}], comentario: '' }
      ],
      timestamp: new Date(Date.now() - 300000) // 5 minutos atrás
    }
  ];
  
  const container = document.getElementById('pedidosListosContainer');
  if (!container) return;
  
  if (pedidosListosSimulados.length === 0) {
    container.innerHTML = `
      <div class="sin-pedidos">
        <i class="fas fa-clock fa-3x"></i>
        <p>No hay pedidos listos para entregar</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  pedidosListosSimulados.forEach(pedido => {
    const icono = pedido.area === 'cocina' ? 'fas fa-utensils' : 'fas fa-coffee';
    const color = pedido.area === 'cocina' ? 'warning' : 'info';
    
    html += `
      <div class="pedido-listo-card">
        <div class="comanda-header">
          <div>
            <div class="comanda-mesa">${pedido.espacioNombre}</div>
            <div class="comanda-cliente">${pedido.cliente}</div>
          </div>
          <div>
            <span class="badge" style="background: var(--${color})">
              <i class="${icono}"></i> ${pedido.area}
            </span>
          </div>
        </div>
        
        <div class="comanda-items">
          ${pedido.items.map(item => {
            let extrasHTML = '';
            if (item.extras && item.extras.length > 0) {
              extrasHTML = `
                <div class="comanda-item-extras">
                  ${item.extras.map(extra => `<span>${extra.nombre}</span>`).join(', ')}
                </div>
              `;
            }
            
            let comentarioHTML = '';
            if (item.comentario) {
              comentarioHTML = `
                <div class="comanda-item-comentario">
                  <i class="fas fa-comment"></i> ${item.comentario}
                </div>
              `;
            }
            
            return `
              <div class="comanda-item">
                <div class="comanda-item-nombre">
                  <span>${item.cantidad}x ${item.nombre}</span>
                  <span>$${(item.precioTotal * item.cantidad).toFixed(2)}</span>
                </div>
                ${extrasHTML}
                ${comentarioHTML}
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="comanda-acciones">
          <button class="btn btn-success btn-block" onclick="marcarPedidoEntregado('${pedido.id}')">
            <i class="fas fa-check"></i> Marcar como Entregado
          </button>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Función global para marcar como entregado
window.marcarPedidoEntregado = async function(pedidoId) {
  if (confirm('¿Marcar este pedido como entregado?')) {
    // En implementación real, esto actualizaría en Firestore
    console.log('Marcando como entregado:', pedidoId);
    mostrarAlerta('Pedido marcado como entregado', 'success');
    
    // Actualizar UI
    actualizarPedidosListosUI();
  }
};

// Filtrar menú por búsqueda
async function filtrarMenuBusqueda(e) {
  const busqueda = e.target.value.toLowerCase();
  try {
    const menu = await obtenerMenuCompleto();
    const menuFiltrado = menu.filter(producto => 
      producto.nombre.toLowerCase().includes(busqueda) ||
      producto.descripcion.toLowerCase().includes(busqueda) ||
      producto.categoria.toLowerCase().includes(busqueda)
    );
    renderizarMenu(menuFiltrado, 'gridMenuAvanzado', onClickProducto, true);
  } catch (error) {
    console.error('Error filtrando menú:', error);
  }
}

// COBRO DE CUENTA
function abrirModalCobro() {
  if (!espacioActivo) {
    mostrarAlerta('Por favor selecciona un espacio primero', 'warning');
    return;
  }
  
  const carrito = sistemaPedidos.getCarritoActivo();
  if (!carrito || carrito.total === 0) {
    mostrarAlerta('No hay nada que cobrar en este espacio', 'warning');
    return;
  }
  
  document.getElementById('cobroEspacioNombre').textContent = espacioActivo.nombre;
  document.getElementById('cobroCliente').textContent = espacioActivo.cliente || '-';
  document.getElementById('cobroTotal').textContent = `$${carrito.total.toFixed(2)}`;
  document.getElementById('cobroPedidos').textContent = carrito.items.length;
  
  document.getElementById('modalCobro').style.display = 'flex';
  document.getElementById('montoRecibido').focus();
}

// Calcular cambio
function calcularCambio() {
  const carrito = sistemaPedidos.getCarritoActivo();
  if (!carrito) return;
  
  const total = carrito.total;
  const recibido = parseFloat(document.getElementById('montoRecibido').value) || 0;
  
  if (recibido >= total) {
    const cambio = recibido - total;
    document.getElementById('cambioCalculado').textContent = `$${cambio.toFixed(2)}`;
  } else {
    document.getElementById('cambioCalculado').textContent = '$-';
  }
}

// Confirmar cobro
async function confirmarCobro() {
  const carrito = sistemaPedidos.getCarritoActivo();
  if (!carrito || !espacioActivo) return;
  
  const metodoPago = document.querySelector('input[name="metodoPago"]:checked').value;
  
  if (metodoPago === 'efectivo') {
    const montoRecibido = parseFloat(document.getElementById('montoRecibido').value) || 0;
    if (montoRecibido < carrito.total) {
      mostrarAlerta('El monto recibido es menor al total', 'warning');
      return;
    }
  }
  
  if (!confirm(`¿Cerrar cuenta y cobrar $${carrito.total.toFixed(2)} en ${metodoPago}?`)) {
    return;
  }
  
  try {
    // Registrar cobro en Firestore
    await registrarCobroFirestore(metodoPago);
    
    // Limpiar carrito
    carrito.limpiar();
    sistemaPedidos.eliminarCarrito(espacioActivo.id);
    
    // Liberar espacio
    espacioActivo = null;
    
    cerrarModalCobro();
    document.getElementById('seccionCarrito').style.display = 'none';
    
    mostrarAlerta('¡Cobro registrado exitosamente!', 'success');
  } catch (error) {
    mostrarAlerta('Error al registrar cobro: ' + error.message, 'danger');
  }
}

// Registrar cobro en Firestore
async function registrarCobroFirestore(metodoPago) {
  const carrito = sistemaPedidos.getCarritoActivo();
  if (!carrito || !espacioActivo) return;
  
  const cobroData = {
    espacioId: espacioActivo.id,
    espacioNombre: espacioActivo.nombre,
    cliente: espacioActivo.cliente,
    mesero: espacioActivo.mesero,
    total: carrito.total,
    metodoPago: metodoPago,
    items: carrito.items,
    cajero: usuarioActual.nombre,
    timestamp: serverTimestamp()
  };
  
  console.log('Cobro registrado:', cobroData);
  // En implementación real: await addDoc(collection(db, "cobros"), cobroData);
}

// Cerrar modal de cobro
function cerrarModalCobro() {
  document.getElementById('modalCobro').style.display = 'none';
  document.getElementById('montoRecibido').value = '';
  document.getElementById('cambioCalculado').textContent = '$0.00';
}

// Mostrar alerta
function mostrarAlerta(mensaje, tipo = 'info') {
  // Crear elemento de alerta
  const alerta = document.createElement('div');
  alerta.className = `alerta alerta-${tipo}`;
  alerta.innerHTML = `
    <div class="alerta-contenido">
      <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-triangle' : tipo === 'danger' ? 'times-circle' : 'info-circle'}"></i>
      <span>${mensaje}</span>
    </div>
    <button class="alerta-cerrar" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Agregar al DOM
  const contenedorAlertas = document.getElementById('alertasContainer') || crearContenedorAlertas();
  contenedorAlertas.appendChild(alerta);
  
  // Auto-eliminar después de 5 segundos
  setTimeout(() => {
    if (alerta.parentElement) {
      alerta.remove();
    }
  }, 5000);
}

// Crear contenedor de alertas si no existe
function crearContenedorAlertas() {
  const contenedor = document.createElement('div');
  contenedor.id = 'alertasContainer';
  contenedor.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    max-width: 400px;
  `;
  document.body.appendChild(contenedor);
  return contenedor;
}

// Exportar funciones principales
export {
  inicializarMesero,
  activarEspacio,
  mostrarAlerta
};