// cafeteria-pedidos.js - Sistema de pedidos para cafetería
import { obtenerMenuPorArea } from './menu-extras.js';

let pedidosCafeteria = [];
let usuarioActual = null;
let productoExpress = null;

// Inicializar sistema de cafetería
async function inicializarCafeteria(usuario) {
  usuarioActual = usuario;
  
  // Configurar eventos
  configurarEventosCafeteria();
  
  // Escuchar pedidos de cafetería
  escucharPedidosCafeteria();
  
  // Configurar productos express
  configurarProductosExpress();
}

// Configurar eventos de cafetería
function configurarEventosCafeteria() {
  // Filtro de tipo
  document.getElementById('filtroTipoCafeteria')?.addEventListener('change', (e) => {
    filtrarComandasCafeteria(e.target.value);
  });
  
  // Modal express
  document.getElementById('btnCancelarExpress')?.addEventListener('click', cerrarModalExpress);
  document.getElementById('btnConfirmarExpress')?.addEventListener('click', confirmarVentaExpress);
  document.getElementById('cantidadExpress')?.addEventListener('input', calcularTotalExpress);
}

// Escuchar pedidos de cafetería
function escucharPedidosCafeteria() {
  setInterval(() => {
    actualizarPedidosCafeteria();
  }, 2000);
}

// Actualizar pedidos de cafetería
function actualizarPedidosCafeteria() {
  // Datos simulados
  const pedidosSimulados = [
    {
      id: 'cafe-1',
      espacioNombre: 'Mesa 5',
      cliente: 'Juan Pérez',
      items: [
        { 
          nombre: 'Café Americano', 
          cantidad: 2, 
          precioTotal: 35, 
          extras: [{nombre: 'Shot Extra', precio: 10}], 
          comentario: 'Uno con poca azúcar' 
        },
        { 
          nombre: 'Crepas de Nutella', 
          cantidad: 1, 
          precioTotal: 75, 
          extras: [], 
          comentario: '' 
        }
      ],
      estado: 'enviado',
      timestamp: new Date(Date.now() - 600000), // 10 minutos atrás
      tiempoTranscurrido: 10
    },
    {
      id: 'cafe-2',
      espacioNombre: 'ENVÍOS',
      cliente: 'Restaurante Vecino',
      items: [
        { 
          nombre: 'Smoothie de Fresa', 
          cantidad: 4, 
          precioTotal: 55, 
          extras: [{nombre: 'Proteína Extra', precio: 20}], 
          comentario: 'Para envío' 
        }
      ],
      estado: 'en preparación',
      timestamp: new Date(Date.now() - 180000), // 3 minutos atrás
      tiempoTranscurrido: 3
    }
  ];
  
  pedidosCafeteria = pedidosSimulados;
  actualizarDashboardCafeteria(pedidosCafeteria);
  renderizarComandasCafeteria(pedidosCafeteria);
}

// Actualizar dashboard de cafetería
function actualizarDashboardCafeteria(pedidos) {
  document.getElementById('bebidasPendientes').textContent = 
    pedidos.filter(p => p.estado === 'enviado').length;
  
  document.getElementById('enPreparacion').textContent = 
    pedidos.filter(p => p.estado === 'en preparación').length;
  
  document.getElementById('listasHoy').textContent = 
    pedidos.filter(p => p.estado === 'listo').length;
  
  // Contar crepas pendientes
  const crepasPendientes = pedidos.filter(p => 
    p.estado === 'enviado' && 
    p.items.some(item => item.nombre.toLowerCase().includes('crepa'))
  ).length;
  
  document.getElementById('crepasPendientes').textContent = crepasPendientes;
}

// Renderizar comandas de cafetería
function renderizarComandasCafeteria(pedidos) {
  const container = document.getElementById('comandasCafeteria');
  if (!container) return;
  
  if (pedidos.length === 0) {
    container.innerHTML = `
      <div class="sin-pedidos">
        <i class="fas fa-coffee fa-3x"></i>
        <p>No hay pedidos de cafetería en este momento</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  pedidos.forEach(pedido => {
    let tiempoClase = 'tiempo-normal';
    let tiempoTexto = `${pedido.tiempoTranscurrido} min`;
    
    if (pedido.tiempoTranscurrido > 10) {
      tiempoClase = 'tiempo-retraso';
      tiempoTexto = `${pedido.tiempoTranscurrido} min (RETRASO)`;
    } else if (pedido.tiempoTranscurrido > 5) {
      tiempoClase = 'tiempo-alerta';
      tiempoTexto = `${pedido.tiempoTranscurrido} min`;
    }
    
    html += `
      <div class="comanda-card cafeteria">
        <div class="comanda-header">
          <div>
            <div class="comanda-mesa">${pedido.espacioNombre}</div>
            <div class="comanda-cliente">${pedido.cliente}</div>
          </div>
          <div class="comanda-tiempo ${tiempoClase}">
            <i class="fas fa-clock"></i> ${tiempoTexto}
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
                </div>
                ${extrasHTML}
                ${comentarioHTML}
              </div>
            `;
          }).join('')}
        </div>
        
        <div class="comanda-acciones">
          ${pedido.estado === 'enviado' ? `
            <button class="btn-preparacion" onclick="iniciarPreparacionCafeteria('${pedido.id}')">
              <i class="fas fa-play"></i> Iniciar Preparación
            </button>
          ` : ''}
          
          ${pedido.estado === 'en preparación' ? `
            <button class="btn-listo" onclick="marcarComoListoCafeteria('${pedido.id}')">
              <i class="fas fa-check"></i> Marcar como Lista
            </button>
          ` : ''}
          
          ${pedido.estado === 'listo' ? `
            <button class="btn btn-success" disabled>
              <i class="fas fa-check-circle"></i> LISTA
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Filtrar comandas de cafetería
function filtrarComandasCafeteria(tipo) {
  if (tipo === 'todos') {
    renderizarComandasCafeteria(pedidosCafeteria);
    return;
  }
  
  const pedidosFiltrados = pedidosCafeteria.filter(pedido => {
    const itemsFiltrados = pedido.items.filter(item => {
      if (tipo === 'bebidas') {
        return item.nombre.toLowerCase().includes('café') ||
               item.nombre.toLowerCase().includes('smoothie') ||
               item.nombre.toLowerCase().includes('jugo') ||
               item.nombre.toLowerCase().includes('agua');
      } else if (tipo === 'crepas') {
        return item.nombre.toLowerCase().includes('crepa');
      } else if (tipo === 'postres') {
        return item.nombre.toLowerCase().includes('postre') ||
               item.nombre.toLowerCase().includes('helado') ||
               item.nombre.toLowerCase().includes('pastel');
      }
      return true;
    });
    
    return itemsFiltrados.length > 0;
  });
  
  renderizarComandasCafeteria(pedidosFiltrados);
}

// Configurar productos express
function configurarProductosExpress() {
  // Los eventos se configuran en el HTML con onclick
}

// Venta express
window.ventaExpress = function(productoId) {
  const productosExpress = {
    'cafe-americano': {
      nombre: 'Café Americano',
      precio: 35,
      descripcion: 'Café americano caliente'
    },
    'crepa-nutella': {
      nombre: 'Crepas de Nutella',
      precio: 75,
      descripcion: 'Crepas con nutella y fresas'
    },
    'smoothie-fresa': {
      nombre: 'Smoothie de Fresa',
      precio: 55,
      descripcion: 'Smoothie natural de fresa'
    }
  };
  
  productoExpress = productosExpress[productoId];
  if (!productoExpress) return;
  
  document.getElementById('expressInfo').innerHTML = `
    <p><strong>${productoExpress.nombre}</strong></p>
    <p>${productoExpress.descripcion}</p>
    <p>Precio unitario: <strong>$${productoExpress.precio.toFixed(2)}</strong></p>
  `;
  
  document.getElementById('expressTotal').textContent = `$${productoExpress.precio.toFixed(2)}`;
  document.getElementById('modalExpress').style.display = 'flex';
  document.getElementById('cantidadExpress').focus();
};

// Calcular total express
function calcularTotalExpress() {
  if (!productoExpress) return;
  
  const cantidad = parseInt(document.getElementById('cantidadExpress').value) || 1;
  const total = productoExpress.precio * cantidad;
  document.getElementById('expressTotal').textContent = `$${total.toFixed(2)}`;
}

// Confirmar venta express
async function confirmarVentaExpress() {
  if (!productoExpress) return;
  
  const cantidad = parseInt(document.getElementById('cantidadExpress').value) || 1;
  const total = productoExpress.precio * cantidad;
  
  if (confirm(`¿Cobrar $${total.toFixed(2)} por ${cantidad}x ${productoExpress.nombre}?`)) {
    // Registrar venta express
    await registrarVentaExpress(cantidad, total);
    
    mostrarAlertaCafeteria(`Venta express registrada: $${total.toFixed(2)}`);
    cerrarModalExpress();
  }
}

// Registrar venta express
async function registrarVentaExpress(cantidad, total) {
  const ventaData = {
    producto: productoExpress.nombre,
    cantidad: cantidad,
    total: total,
    vendedor: usuarioActual.nombre,
    tipo: 'express',
    timestamp: new Date()
  };
  
  console.log('Venta express registrada:', ventaData);
  // En implementación real: await addDoc(collection(db, "ventas_express"), ventaData);
}

// Cerrar modal express
function cerrarModalExpress() {
  document.getElementById('modalExpress').style.display = 'none';
  productoExpress = null;
  document.getElementById('cantidadExpress').value = 1;
}

// Funciones globales para cafetería
window.iniciarPreparacionCafeteria = async function(pedidoId) {
  if (confirm('¿Iniciar preparación de esta bebida/postre?')) {
    // Actualizar estado local
    const pedido = pedidosCafeteria.find(p => p.id === pedidoId);
    if (pedido) {
      pedido.estado = 'en preparación';
    }
    
    actualizarDashboardCafeteria(pedidosCafeteria);
    renderizarComandasCafeteria(pedidosCafeteria);
    
    mostrarAlertaCafeteria('Preparación iniciada');
  }
};

window.marcarComoListoCafeteria = async function(pedidoId) {
  if (confirm('¿Marcar como lista para entregar?')) {
    // Actualizar estado local
    const pedido = pedidosCafeteria.find(p => p.id === pedidoId);
    if (pedido) {
      pedido.estado = 'listo';
    }
    
    actualizarDashboardCafeteria(pedidosCafeteria);
    renderizarComandasCafeteria(pedidosCafeteria);
    
    mostrarAlertaCafeteria('Producto marcado como listo. ¡Notificación enviada al mesero!');
  }
};

// Mostrar alerta en cafetería
function mostrarAlertaCafeteria(mensaje) {
  const alerta = document.createElement('div');
  alerta.className = 'alerta alerta-success';
  alerta.innerHTML = `
    <div class="alerta-contenido">
      <i class="fas fa-check-circle"></i>
      <span>${mensaje}</span>
    </div>
    <button class="alerta-cerrar" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  const contenedor = document.getElementById('alertasContainer') || crearContenedorAlertasCafeteria();
  contenedor.appendChild(alerta);
  
  setTimeout(() => {
    if (alerta.parentElement) {
      alerta.remove();
    }
  }, 3000);
}

function crearContenedorAlertasCafeteria() {
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

export {
  inicializarCafeteria
};