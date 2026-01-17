// cocina-pedidos.js - Sistema de pedidos para cocina
import { 
  db, 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from './firebase.js';

let pedidosCocina = [];
let usuarioActual = null;

// Inicializar sistema de cocina
async function inicializarCocina(usuario) {
  usuarioActual = usuario;
  
  // Configurar eventos
  configurarEventosCocina();
  
  // Escuchar pedidos de cocina
  escucharPedidosCocina();
  
  // Escuchar espacios
  escucharEspaciosCocina();
}

// Configurar eventos de cocina
function configurarEventosCocina() {
  // Filtro de estado
  document.getElementById('filtroEstadoComanda')?.addEventListener('change', (e) => {
    filtrarComandasCocina(e.target.value);
  });
}

// Escuchar pedidos de cocina en tiempo real
function escucharPedidosCocina() {
  // En implementación real, esto escucharía Firestore
  // Por ahora simulamos con intervalo
  setInterval(() => {
    actualizarPedidosCocina();
  }, 2000);
}

// Actualizar pedidos de cocina
function actualizarPedidosCocina() {
  // Datos simulados
  const pedidosSimulados = [
    {
      id: 'cocina-1',
      espacioNombre: 'Mesa 3',
      cliente: 'Familia López',
      items: [
        { 
          nombre: 'Tacos al Pastor', 
          cantidad: 2, 
          precioTotal: 120, 
          extras: [{nombre: 'Extra Queso', precio: 15}], 
          comentario: 'Sin cebolla' 
        },
        { 
          nombre: 'Hamburguesa Clásica', 
          cantidad: 1, 
          precioTotal: 85, 
          extras: [{nombre: 'Extra Tocino', precio: 25}], 
          comentario: 'Bien cocida' 
        }
      ],
      estado: 'enviado',
      timestamp: new Date(Date.now() - 1200000), // 20 minutos atrás
      tiempoTranscurrido: 20
    },
    {
      id: 'cocina-2',
      espacioNombre: 'PARA LLEVAR',
      cliente: 'María García',
      items: [
        { 
          nombre: 'Enchiladas Rojas', 
          cantidad: 1, 
          precioTotal: 95, 
          extras: [], 
          comentario: 'Para llevar' 
        }
      ],
      estado: 'en preparación',
      timestamp: new Date(Date.now() - 300000), // 5 minutos atrás
      tiempoTranscurrido: 5
    },
    {
      id: 'cocina-3',
      espacioNombre: 'Mesa 8',
      cliente: 'Carlos Rodríguez',
      items: [
        { 
          nombre: 'Tacos al Pastor', 
          cantidad: 3, 
          precioTotal: 120, 
          extras: [], 
          comentario: '' 
        }
      ],
      estado: 'listo',
      timestamp: new Date(Date.now() - 900000), // 15 minutos atrás
      tiempoTranscurrido: 15
    }
  ];
  
  pedidosCocina = pedidosSimulados;
  actualizarDashboardCocina(pedidosCocina);
  renderizarComandasCocina(pedidosCocina);
}

// Actualizar dashboard de cocina
function actualizarDashboardCocina(pedidos) {
  const ahora = new Date();
  const pedidosConRetardo = pedidos.filter(pedido => {
    return pedido.tiempoTranscurrido > 10; // Más de 10 minutos = retardo
  });

  document.getElementById('pedidosPendientes').textContent = 
    pedidos.filter(p => p.estado === 'enviado').length;
  
  document.getElementById('enPreparacion').textContent = 
    pedidos.filter(p => p.estado === 'en preparación').length;
  
  document.getElementById('listosHoy').textContent = 
    pedidos.filter(p => p.estado === 'listo').length;
  
  document.getElementById('conRetardo').textContent = 
    pedidosConRetardo.length;
}

// Renderizar comandas de cocina
function renderizarComandasCocina(pedidos) {
  const container = document.getElementById('comandasContainer');
  if (!container) return;
  
  if (pedidos.length === 0) {
    container.innerHTML = `
      <div class="sin-pedidos">
        <i class="fas fa-utensils fa-3x"></i>
        <p>No hay comandas activas en este momento</p>
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
      <div class="comanda-card">
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
            <button class="btn-preparacion" onclick="iniciarPreparacionCocina('${pedido.id}')">
              <i class="fas fa-play"></i> Iniciar Preparación
            </button>
          ` : ''}
          
          ${pedido.estado === 'en preparación' ? `
            <button class="btn-listo" onclick="marcarComoListoCocina('${pedido.id}')">
              <i class="fas fa-check"></i> Marcar como Listo
            </button>
          ` : ''}
          
          ${pedido.estado === 'listo' ? `
            <button class="btn btn-success" disabled>
              <i class="fas fa-check-circle"></i> LISTO
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Filtrar comandas de cocina
function filtrarComandasCocina(estado) {
  let pedidosFiltrados = pedidosCocina;
  
  if (estado === 'enviado') {
    pedidosFiltrados = pedidosCocina.filter(p => p.estado === 'enviado');
  } else if (estado === 'en preparación') {
    pedidosFiltrados = pedidosCocina.filter(p => p.estado === 'en preparación');
  } else if (estado === 'con retardo') {
    pedidosFiltrados = pedidosCocina.filter(p => p.tiempoTranscurrido > 10);
  }
  
  renderizarComandasCocina(pedidosFiltrados);
}

// Escuchar espacios para cocina
function escucharEspaciosCocina() {
  // En implementación real, esto escucharía Firestore
  // Por ahora simulamos
  setInterval(() => {
    actualizarEspaciosCocina();
  }, 3000);
}

// Actualizar espacios para cocina
function actualizarEspaciosCocina() {
  const espaciosSimulados = [
    {
      id: 'mesa-3',
      nombre: 'Mesa 3',
      estado: 'preparacion',
      cliente: 'Familia López',
      mesero: 'Juan Pérez',
      total: 205,
      pedidosIds: ['cocina-1'],
      tipo: 'mesa',
      numero: 3
    },
    {
      id: 'para-llevar',
      nombre: 'PARA LLEVAR',
      estado: 'preparacion',
      cliente: 'María García',
      mesero: 'Ana López',
      total: 95,
      pedidosIds: ['cocina-2'],
      tipo: 'llevar',
      numero: 11
    },
    {
      id: 'mesa-8',
      nombre: 'Mesa 8',
      estado: 'listo',
      cliente: 'Carlos Rodríguez',
      mesero: 'Juan Pérez',
      total: 120,
      pedidosIds: ['cocina-3'],
      tipo: 'mesa',
      numero: 8
    }
  ];
  
  const container = document.getElementById('gridEspaciosCocina');
  if (!container) return;
  
  let html = '';
  espaciosSimulados.forEach(espacio => {
    html += `
      <div class="espacio ${espacio.estado}">
        <div class="espacio-numero">${espacio.tipo === 'mesa' ? `Mesa ${espacio.numero}` : espacio.nombre}</div>
        <div class="espacio-estado">${espacio.estado.toUpperCase()}</div>
        <div class="espacio-cliente">
          <i class="fas fa-user"></i> ${espacio.cliente || 'Cliente'}
        </div>
        <div class="espacio-pedidos">
          <i class="fas fa-clipboard-list"></i> ${espacio.pedidosIds?.length || 0} pedidos
        </div>
        <div class="espacio-total">
          <i class="fas fa-money-bill-wave"></i> $${espacio.total?.toFixed(2) || '0.00'}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// Funciones globales para cocina
window.iniciarPreparacionCocina = async function(pedidoId) {
  if (confirm('¿Iniciar preparación de esta comanda?')) {
    // En implementación real: await actualizarEstadoPedido(pedidoId, 'en preparación');
    
    // Actualizar estado local
    const pedido = pedidosCocina.find(p => p.id === pedidoId);
    if (pedido) {
      pedido.estado = 'en preparación';
    }
    
    actualizarDashboardCocina(pedidosCocina);
    renderizarComandasCocina(pedidosCocina);
    
    mostrarAlertaCocina('Preparación iniciada');
  }
};

window.marcarComoListoCocina = async function(pedidoId) {
  if (confirm('¿Marcar esta comanda como lista?')) {
    // En implementación real: await actualizarEstadoPedido(pedidoId, 'listo');
    
    // Actualizar estado local
    const pedido = pedidosCocina.find(p => p.id === pedidoId);
    if (pedido) {
      pedido.estado = 'listo';
    }
    
    actualizarDashboardCocina(pedidosCocina);
    renderizarComandasCocina(pedidosCocina);
    
    mostrarAlertaCocina('Comanda marcada como lista. ¡Notificación enviada al mesero!');
  }
};

// Mostrar alerta en cocina
function mostrarAlertaCocina(mensaje) {
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
  
  const contenedor = document.getElementById('alertasContainer') || crearContenedorAlertasCocina();
  contenedor.appendChild(alerta);
  
  setTimeout(() => {
    if (alerta.parentElement) {
      alerta.remove();
    }
  }, 3000);
}

function crearContenedorAlertasCocina() {
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
  inicializarCocina
};