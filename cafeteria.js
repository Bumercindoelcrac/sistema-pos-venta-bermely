// cafeteria.js - Sistema específico para cafetería
import { 
  db,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp
} from './firebase.js';
import { mostrarNotificacion } from './utils.js';

class SistemaCafeteria {
  constructor() {
    this.pedidosPendientes = [];
    this.pedidosEnPreparacion = [];
    this.unsubscribers = [];
  }
  
  // Inicializar sistema de cafetería
  inicializar() {
    this.escucharPedidosCafeteria();
    this.escucharPedidosListos();
  }
  
  // Escuchar pedidos para cafetería
  escucharPedidosCafeteria() {
    const pedidosRef = collection(db, "pedidos");
    const q = query(
      pedidosRef,
      where("area", "==", "cafeteria"),
      where("estado", "in", ["enviado", "en preparación"]),
      orderBy("timestamp", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      this.pedidosPendientes = [];
      this.pedidosEnPreparacion = [];
      
      snapshot.forEach((docSnap) => {
        const pedido = { id: docSnap.id, ...docSnap.data() };
        
        if (pedido.estado === "enviado") {
          this.pedidosPendientes.push(pedido);
        } else if (pedido.estado === "en preparación") {
          this.pedidosEnPreparacion.push(pedido);
        }
      });
      
      this.actualizarUI();
      this.actualizarContadores();
    });
    
    this.unsubscribers.push(unsubscribe);
  }
  
  // Escuchar pedidos listos
  escucharPedidosListos() {
    const pedidosRef = collection(db, "pedidos");
    const q = query(
      pedidosRef,
      where("area", "==", "cafeteria"),
      where("estado", "==", "listo"),
      orderBy("timestamp", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pedidosListos = [];
      snapshot.forEach((docSnap) => {
        pedidosListos.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      // Actualizar sección de listos si existe
      const container = document.getElementById('pedidosListosCafeteria');
      if (container) {
        this.renderizarPedidosListos(pedidosListos, container);
      }
    });
    
    this.unsubscribers.push(unsubscribe);
  }
  
  // Iniciar preparación de pedido
  async iniciarPreparacion(pedidoId) {
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        estado: "en preparación",
        tiempoInicioPreparacion: serverTimestamp(),
        ultimaActualizacion: serverTimestamp()
      });
      
      mostrarNotificacion("Preparación iniciada", "success");
      return true;
    } catch (error) {
      console.error("Error iniciando preparación:", error);
      mostrarNotificacion("Error al iniciar preparación", "error");
      return false;
    }
  }
  
  // Marcar pedido como listo
  async marcarComoListo(pedidoId) {
    try {
      const pedidoRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoRef, {
        estado: "listo",
        tiempoListo: serverTimestamp(),
        ultimaActualizacion: serverTimestamp()
      });
      
      // Reproducir sonido de notificación
      this.reproducirSonidoListo();
      
      mostrarNotificacion("Pedido marcado como LISTO", "success");
      return true;
    } catch (error) {
      console.error("Error marcando como listo:", error);
      mostrarNotificacion("Error al marcar como listo", "error");
      return false;
    }
  }
  
  // Reproducir sonido cuando algo está listo
  reproducirSonidoListo() {
    try {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log("No se pudo reproducir sonido:", e));
    } catch (e) {
      console.log("No se pudo reproducir sonido de notificación");
    }
  }
  
  // Actualizar contadores en la UI
  actualizarContadores() {
    const contadorPendientes = document.getElementById('contadorPendientes');
    const contadorPreparacion = document.getElementById('contadorPreparacion');
    
    if (contadorPendientes) {
      contadorPendientes.textContent = this.pedidosPendientes.length;
    }
    
    if (contadorPreparacion) {
      contadorPreparacion.textContent = this.pedidosEnPreparacion.length;
    }
  }
  
  // Actualizar toda la UI
  actualizarUI() {
    this.renderizarPedidosPendientes();
    this.renderizarPedidosEnPreparacion();
    this.actualizarContadores();
  }
  
  // Renderizar pedidos pendientes
  renderizarPedidosPendientes() {
    const container = document.getElementById('pedidosPendientesCafeteria');
    if (!container) return;
    
    if (this.pedidosPendientes.length === 0) {
      container.innerHTML = `
        <div class="sin-pedidos">
          <i class="fas fa-coffee fa-3x"></i>
          <h3>Sin pedidos pendientes</h3>
          <p>Los pedidos de bebidas y postres aparecerán aquí</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    this.pedidosPendientes.forEach(pedido => {
      const tiempo = this.calcularTiempoEspera(pedido.timestamp);
      
      html += `
        <div class="pedido-card" data-pedido-id="${pedido.id}">
          <div class="pedido-header">
            <div class="pedido-info">
              <h4>${pedido.espacioNombre}</h4>
              <div class="pedido-meta">
                <span><i class="fas fa-user"></i> ${pedido.cliente || 'Cliente'}</span>
                <span><i class="fas fa-concierge-bell"></i> ${pedido.mesero || 'Mesero'}</span>
                <span class="tiempo-espera ${tiempo.alerta ? 'alerta' : ''}">
                  <i class="fas fa-clock"></i> ${tiempo.texto}
                </span>
              </div>
            </div>
            <div class="pedido-acciones">
              <button class="btn btn-warning btn-iniciar" onclick="sistemaCafeteria.iniciarPreparacion('${pedido.id}')">
                <i class="fas fa-play"></i> Preparar
              </button>
            </div>
          </div>
          
          <div class="pedido-items">
            ${this.renderizarItemsPedido(pedido.items)}
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  // Renderizar pedidos en preparación
  renderizarPedidosEnPreparacion() {
    const container = document.getElementById('pedidosEnPreparacionCafeteria');
    if (!container) return;
    
    if (this.pedidosEnPreparacion.length === 0) {
      container.innerHTML = `
        <div class="sin-pedidos">
          <i class="fas fa-blender fa-3x"></i>
          <h3>No hay pedidos en preparación</h3>
          <p>Inicia la preparación de un pedido pendiente</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    this.pedidosEnPreparacion.forEach(pedido => {
      const tiempo = this.calcularTiempoPreparacion(pedido.tiempoInicioPreparacion);
      
      html += `
        <div class="pedido-card en-preparacion" data-pedido-id="${pedido.id}">
          <div class="pedido-header">
            <div class="pedido-info">
              <h4>${pedido.espacioNombre}</h4>
              <div class="pedido-meta">
                <span><i class="fas fa-user"></i> ${pedido.cliente || 'Cliente'}</span>
                <span class="tiempo-preparacion ${tiempo.alerta ? 'alerta' : ''}">
                  <i class="fas fa-clock"></i> ${tiempo.texto}
                </span>
              </div>
            </div>
            <div class="pedido-acciones">
              <button class="btn btn-success btn-listo" onclick="sistemaCafeteria.marcarComoListo('${pedido.id}')">
                <i class="fas fa-check"></i> Listo
              </button>
            </div>
          </div>
          
          <div class="pedido-items">
            ${this.renderizarItemsPedido(pedido.items)}
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  // Renderizar pedidos listos
  renderizarPedidosListos(pedidos, container) {
    if (pedidos.length === 0) {
      container.innerHTML = `
        <div class="sin-pedidos">
          <i class="fas fa-check fa-3x"></i>
          <h3>No hay pedidos listos</h3>
        </div>
      `;
      return;
    }
    
    let html = '';
    pedidos.forEach(pedido => {
      const tiempo = this.calcularTiempoListo(pedido.tiempoListo);
      
      html += `
        <div class="pedido-card listo">
          <div class="pedido-header">
            <div class="pedido-info">
              <h4>${pedido.espacioNombre}</h4>
              <div class="pedido-meta">
                <span><i class="fas fa-user"></i> ${pedido.cliente || 'Cliente'}</span>
                <span class="tiempo-listo">
                  <i class="fas fa-clock"></i> ${tiempo}
                </span>
              </div>
            </div>
            <div class="pedido-estado">
              <span class="badge badge-success">LISTO</span>
            </div>
          </div>
          
          <div class="pedido-items">
            ${this.renderizarItemsPedido(pedido.items)}
          </div>
          
          <div class="pedido-nota">
            <i class="fas fa-bell"></i> Esperando a que el mesero lo entregue
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
  }
  
  // Renderizar items de un pedido
  renderizarItemsPedido(items) {
    if (!items || items.length === 0) return '<p class="sin-items">No hay items</p>';
    
    let html = '<div class="items-lista">';
    
    items.forEach(item => {
      // Determinar icono según categoría
      let icono = 'fa-coffee';
      if (item.categoria === 'crepas') icono = 'fa-pancakes';
      if (item.categoria === 'bebidas-frias') icono = 'fa-glass-martini-alt';
      if (item.categoria === 'postres') icono = 'fa-ice-cream';
      
      const extrasTexto = item.extras && item.extras.length > 0 ? 
        `<div class="item-extras">${item.extras.map(e => `${e.nombre} (+$${e.precio})`).join(', ')}</div>` : '';
      
      const comentario = item.comentario ? 
        `<div class="item-comentario"><i class="fas fa-comment"></i> ${item.comentario}</div>` : '';
      
      html += `
        <div class="item">
          <div class="item-cabecera">
            <i class="fas ${icono}"></i>
            <span class="item-cantidad">${item.cantidad}x</span>
            <span class="item-nombre">${item.nombre}</span>
            <span class="item-precio">$${(item.precioTotal * item.cantidad).toFixed(2)}</span>
          </div>
          ${extrasTexto}
          ${comentario}
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }
  
  // Calcular tiempo de espera
  calcularTiempoEspera(timestamp) {
    if (!timestamp) return { texto: '--:--', alerta: false };
    
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const ahora = new Date();
    const diferencia = ahora - fecha;
    const minutos = Math.floor(diferencia / (1000 * 60));
    
    let alerta = false;
    let texto = `${minutos} min`;
    
    if (minutos > 8) { // Menos tiempo que cocina para bebidas
      alerta = true;
      texto = `${minutos} min (RETRASO)`;
    } else if (minutos > 4) {
      alerta = true;
      texto = `${minutos} min`;
    }
    
    return { texto, alerta };
  }
  
  // Calcular tiempo de preparación
  calcularTiempoPreparacion(timestamp) {
    if (!timestamp) return { texto: '--:--', alerta: false };
    
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const ahora = new Date();
    const diferencia = ahora - fecha;
    const minutos = Math.floor(diferencia / (1000 * 60));
    
    let alerta = false;
    let texto = `${minutos} min`;
    
    if (minutos > 12) { // Menos tiempo que cocina
      alerta = true;
      texto = `${minutos} min (MUCHO TIEMPO)`;
    } else if (minutos > 8) {
      alerta = true;
      texto = `${minutos} min`;
    }
    
    return { texto, alerta };
  }
  
  // Calcular tiempo desde que está listo
  calcularTiempoListo(timestamp) {
    if (!timestamp) return '--:--';
    
    const fecha = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const ahora = new Date();
    const diferencia = ahora - fecha;
    const minutos = Math.floor(diferencia / (1000 * 60));
    
    if (minutos < 1) return 'Recién listo';
    return `${minutos} min`;
  }
  
  // Limpiar suscripciones
  limpiar() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
    this.pedidosPendientes = [];
    this.pedidosEnPreparacion = [];
  }
}

// Crear instancia global
const sistemaCafeteria = new SistemaCafeteria();

// Hacer disponible globalmente
window.sistemaCafeteria = sistemaCafeteria;

export { sistemaCafeteria };