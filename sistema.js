// sistema.js - SISTEMA CENTRAL COMPLETO Y FUNCIONAL

// CONSTANTES DEL SISTEMA
export const SISTEMA = {
  // Estados de los espacios
  ESTADOS_ESPACIO: {
    LIBRE: 'libre',
    OCUPADA: 'ocupada',
    PREPARACION: 'en preparación',
    LISTO: 'listo',
    ENTREGADO: 'entregado',
    POR_COBRAR: 'porcobrar'
  },
  
  // Tipos de espacios
  TIPOS_ESPACIO: {
    MESA: 'mesa',
    LLEVAR: 'llevar',
    ENVIO: 'envio'
  },
  
  // Estados de pedidos
  ESTADOS_PEDIDO: {
    ENVIADO: 'enviado',
    PREPARACION: 'en preparación',
    LISTO: 'listo',
    ENTREGADO: 'entregado'
  },
  
  // Áreas
  AREAS: {
    COCINA: 'cocina',
    CAFETERIA: 'cafeteria'
  },
  
  // Métodos de pago
  METODOS_PAGO: {
    EFECTIVO: 'efectivo',
    TARJETA: 'tarjeta',
    TRANSFERENCIA: 'transferencia'
  }
};

// CLASE CARRITO - Manejada POR MESA
export class Carrito {
  constructor(espacioId, espacioNombre, cliente = '', mesero = '') {
    this.espacioId = espacioId;
    this.espacioNombre = espacioNombre;
    this.cliente = cliente;
    this.mesero = mesero;
    this.items = []; // Items NO enviados
    this.pedidosEnviados = []; // IDs de pedidos ya enviados
    this.total = 0;
    this.timestampApertura = new Date();
  }
  
  // Agregar producto al carrito
  agregarProducto(producto, cantidad = 1, extrasIds = [], comentario = '') {
    // Calcular precio con extras
    let precioTotal = producto.precio;
    const extrasSeleccionados = [];
    
    if (producto.extras && extrasIds.length > 0) {
      extrasIds.forEach(extraId => {
        const extra = producto.extras.find(e => e.id === extraId);
        if (extra) {
          precioTotal += extra.precio;
          extrasSeleccionados.push(extra);
        }
      });
    }
    
    const item = {
      id: Date.now() + Math.random(),
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: cantidad,
      precioUnitario: producto.precio,
      precioTotal: precioTotal,
      extras: extrasSeleccionados,
      comentario: comentario,
      area: producto.area,
      categoria: producto.categoria,
      timestamp: Date.now(),
      enviado: false // No enviado aún
    };
    
    this.items.push(item);
    this.calcularTotal();
    
    console.log(`➕ Producto agregado: ${item.nombre} x${cantidad} - $${precioTotal}`);
    return item;
  }
  
  // Agrupar items por área para enviar
  agruparPorArea() {
    const grupos = {
      [SISTEMA.AREAS.COCINA]: [],
      [SISTEMA.AREAS.CAFETERIA]: []
    };
    
    this.items.forEach(item => {
      if (item.area === SISTEMA.AREAS.COCINA && !item.enviado) {
        grupos[SISTEMA.AREAS.COCINA].push(item);
      } else if (item.area === SISTEMA.AREAS.CAFETERIA && !item.enviado) {
        grupos[SISTEMA.AREAS.CAFETERIA].push(item);
      }
    });
    
    return grupos;
  }
  
  // Marcar items como enviados
  marcarComoEnviados(itemsIds, pedidoId) {
    itemsIds.forEach(itemId => {
      const itemIndex = this.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        this.items[itemIndex].enviado = true;
        this.items[itemIndex].pedidoId = pedidoId;
      }
    });
    
    // Recalcular total (solo items NO enviados)
    this.calcularTotal();
    
    // Agregar a pedidos enviados
    if (!this.pedidosEnviados.includes(pedidoId)) {
      this.pedidosEnviados.push(pedidoId);
    }
    
    console.log(`📤 Items marcados como enviados: ${itemsIds.length} items`);
  }
  
  // Eliminar producto
  eliminarProducto(itemId) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      const itemEliminado = this.items[index];
      this.items.splice(index, 1);
      this.calcularTotal();
      console.log(`🗑️ Producto eliminado: ${itemEliminado.nombre}`);
    }
  }
  
  // Aumentar cantidad
  aumentarCantidad(itemId) {
    const item = this.items.find(item => item.id === itemId);
    if (item) {
      item.cantidad++;
      this.calcularTotal();
      console.log(`➕ Cantidad aumentada: ${item.nombre} → ${item.cantidad}`);
    }
  }
  
  // Disminuir cantidad
  disminuirCantidad(itemId) {
    const item = this.items.find(item => item.id === itemId);
    if (item && item.cantidad > 1) {
      item.cantidad--;
      this.calcularTotal();
      console.log(`➖ Cantidad disminuida: ${item.nombre} → ${item.cantidad}`);
    }
  }
  
  // Calcular total (solo items NO enviados)
  calcularTotal() {
    this.total = this.items
      .filter(item => !item.enviado)
      .reduce((sum, item) => sum + (item.precioTotal * item.cantidad), 0);
    
    console.log(`💰 Total actualizado: $${this.total.toFixed(2)}`);
  }
  
  // Obtener items no enviados
  getItemsNoEnviados() {
    return this.items.filter(item => !item.enviado);
  }
  
  // Obtener total de pedidos
  getTotalPedidos() {
    return this.pedidosEnviados.length;
  }
  
  // Limpiar carrito
  limpiar() {
    this.items = [];
    this.calcularTotal();
    console.log(`🧹 Carrito limpiado para ${this.espacioNombre}`);
  }
  
  // Obtener resumen
  getResumen() {
    return {
      espacioId: this.espacioId,
      espacioNombre: this.espacioNombre,
      cliente: this.cliente,
      mesero: this.mesero,
      totalItems: this.items.length,
      itemsNoEnviados: this.getItemsNoEnviados().length,
      total: this.total,
      pedidosEnviados: this.pedidosEnviados.length,
      timestampApertura: this.timestampApertura
    };
  }
}

// CLASE SISTEMA DE PEDIDOS
export class SistemaPedidos {
  constructor() {
    this.carritos = new Map(); // Carritos por espacio
    this.carritoActivo = null;
    this.escuchas = [];
    console.log("🛒 Sistema de pedidos inicializado");
  }
  
  // Obtener o crear carrito
  obtenerCarrito(espacioId, espacioNombre, cliente = '', mesero = '') {
    if (!this.carritos.has(espacioId)) {
      const carrito = new Carrito(espacioId, espacioNombre, cliente, mesero);
      this.carritos.set(espacioId, carrito);
      console.log(`🆕 Carrito creado para: ${espacioNombre}`);
    }
    return this.carritos.get(espacioId);
  }
  
  // Set carrito activo
  setCarritoActivo(espacioId) {
    const carrito = this.carritos.get(espacioId);
    if (carrito) {
      this.carritoActivo = carrito;
      console.log(`🎯 Carrito activado: ${carrito.espacioNombre}`);
      return carrito;
    }
    console.log(`⚠️ No se encontró carrito para espacio: ${espacioId}`);
    return null;
  }
  
  // Get carrito activo
  getCarritoActivo() {
    return this.carritoActivo;
  }
  
  // Eliminar carrito
  eliminarCarrito(espacioId) {
    const carrito = this.carritos.get(espacioId);
    if (carrito) {
      console.log(`🗑️ Carrito eliminado: ${carrito.espacioNombre}`);
    }
    this.carritos.delete(espacioId);
    if (this.carritoActivo && this.carritoActivo.espacioId === espacioId) {
      this.carritoActivo = null;
    }
  }
  
  // Actualizar cliente en carrito
  actualizarCliente(espacioId, cliente, mesero) {
    const carrito = this.carritos.get(espacioId);
    if (carrito) {
      carrito.cliente = cliente;
      carrito.mesero = mesero;
      console.log(`👤 Cliente actualizado: ${cliente} (${mesero})`);
    }
  }
  
  // Notificar cambios
  notificarCambios() {
    this.escuchas.forEach((callback, index) => {
      try {
        callback(this.carritos);
      } catch (error) {
        console.error(`Error en callback ${index}:`, error);
      }
    });
  }
  
  // Escuchar cambios
  escucharCambios(callback) {
    this.escuchas.push(callback);
    console.log(`👂 Nueva escucha agregada, total: ${this.escuchas.length}`);
  }
  
  // Obtener todos los carritos
  getTodosCarritos() {
    return Array.from(this.carritos.values());
  }
  
  // Obtener estadísticas
  getEstadisticas() {
    const carritosArray = this.getTodosCarritos();
    return {
      totalCarritos: carritosArray.length,
      totalItems: carritosArray.reduce((sum, c) => sum + c.items.length, 0),
      totalVentas: carritosArray.reduce((sum, c) => sum + c.total, 0),
      carritosActivos: carritosArray.filter(c => c.getItemsNoEnviados().length > 0).length
    };
  }
}

// Instancia global del sistema
export const sistema = new SistemaPedidos();

// ========== FUNCIONES DE AYUDA ==========

// Calcular tiempo desde timestamp
export function calcularTiempoDesde(timestamp) {
  if (!timestamp) return '--:--';
  
  try {
    const ahora = new Date();
    let fecha;
    
    if (timestamp.toDate) {
      fecha = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      fecha = timestamp;
    } else if (typeof timestamp === 'string') {
      fecha = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      fecha = new Date(timestamp);
    } else {
      fecha = new Date();
    }
    
    const diferencia = ahora - fecha;
    const minutos = Math.floor(diferencia / (1000 * 60));
    
    if (minutos < 1) return 'Recién';
    if (minutos < 60) return `${minutos} min`;
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    return `${horas}h ${minutosRestantes}m`;
  } catch (error) {
    console.error("Error calculando tiempo:", error);
    return '--:--';
  }
}

// Formato de moneda
export function formatoMoneda(monto) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(monto || 0);
}

// Obtener color según estado
export function obtenerColorEstado(estado) {
  const colores = {
    'libre': '#2ecc71',        // Verde
    'ocupada': '#f39c12',      // Naranja
    'en preparación': '#3498db', // Azul
    'listo': '#9b59b6',        // Morado
    'entregado': '#e74c3c',    // Rojo
    'porcobrar': '#1abc9c',    // Turquesa
    'enviado': '#3498db',      // Azul
    'entregado': '#2ecc71'     // Verde
  };
  
  return colores[estado] || '#95a5a6';
}

// Filtrar array por propiedad
export function filtrarPorPropiedad(array, propiedad, valor) {
  if (!array || !Array.isArray(array)) return [];
  if (valor === 'todos') return array;
  return array.filter(item => item[propiedad] === valor);
}

// Ordenar array por propiedad
export function ordenarPorPropiedad(array, propiedad, ascendente = true) {
  if (!array || !Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    const valorA = a[propiedad];
    const valorB = b[propiedad];
    
    if (valorA < valorB) return ascendente ? -1 : 1;
    if (valorA > valorB) return ascendente ? 1 : -1;
    return 0;
  });
}

// Agrupar por propiedad
export function agruparPorPropiedad(array, propiedad) {
  if (!array || !Array.isArray(array)) return {};
  
  return array.reduce((grupos, item) => {
    const key = item[propiedad] || 'sin_' + propiedad;
    if (!grupos[key]) {
      grupos[key] = [];
    }
    grupos[key].push(item);
    return grupos;
  }, {});
}

// Validar email
export function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validar teléfono
export function validarTelefono(telefono) {
  const regex = /^[0-9\s\-\+\(\)]{10,}$/;
  return regex.test(telefono);
}

// Formatear fecha
export function formatearFecha(fecha, incluirHora = true) {
  const date = fecha instanceof Date ? fecha : new Date(fecha);
  
  const opciones = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  if (incluirHora) {
    opciones.hour = '2-digit';
    opciones.minute = '2-digit';
  }
  
  return date.toLocaleDateString('es-MX', opciones);
}

// Generar ID único
export function generarIdUnico(prefijo = '') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefijo}${timestamp}-${random}`;
}

// Calcular edad
export function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}

// Capitalizar texto
export function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Limpiar texto
export function limpiarTexto(texto) {
  if (!texto) return '';
  return texto.toString().trim().replace(/\s+/g, ' ');
}

// Validar número
export function validarNumero(valor, min = 0, max = Infinity) {
  const num = Number(valor);
  return !isNaN(num) && num >= min && num <= max;
}

// Crear notificación
export function crearNotificacion(mensaje, tipo = 'info') {
  const tipos = {
    'success': { icono: '✅', color: '#2ecc71' },
    'error': { icono: '❌', color: '#e74c3c' },
    'warning': { icono: '⚠️', color: '#f39c12' },
    'info': { icono: 'ℹ️', color: '#3498db' }
  };
  
  const config = tipos[tipo] || tipos.info;
  
  console.log(`${config.icono} ${mensaje}`);
  
  // Mostrar notificación en UI si existe
  if (typeof window !== 'undefined' && document.getElementById('notificaciones')) {
    const container = document.getElementById('notificaciones');
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${config.color};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 10px;
      animation: slideIn 0.3s ease;
    `;
    
    notificacion.innerHTML = `
      <span style="font-size: 20px;">${config.icono}</span>
      <span>${mensaje}</span>
    `;
    
    container.appendChild(notificacion);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
      notificacion.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notificacion.parentNode) {
          notificacion.parentNode.removeChild(notificacion);
        }
      }, 300);
    }, 5000);
  }
  
  return { mensaje, tipo, icono: config.icono };
}

// Función para enviar pedido al área (simulada)
export async function enviarPedidoAlArea(espacioId, items, area) {
  console.log(`🚀 Enviando pedido a ${area}:`, {
    espacioId,
    cantidadItems: items.length,
    items: items.map(i => `${i.cantidad}x ${i.nombre}`)
  });
  
  // Simular envío
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const pedidoId = generarIdUnico('pedido-');
  
  return {
    success: true,
    pedidoId: pedidoId,
    message: `Pedido enviado a ${area}`,
    timestamp: new Date(),
    detalles: {
      espacioId,
      area,
      itemsCount: items.length,
      total: items.reduce((sum, item) => sum + (item.precioTotal * item.cantidad), 0)
    }
  };
}

// Función para cobrar cuenta (simulada)
export async function cobrarCuenta(espacioId, total, metodoPago, montoRecibido = null) {
  console.log(`💰 Cobrando cuenta ${espacioId}:`, {
    total,
    metodoPago,
    montoRecibido,
    cambio: montoRecibido ? montoRecibido - total : null
  });
  
  // Simular cobro
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const cobroId = generarIdUnico('cobro-');
  
  return {
    success: true,
    cobroId: cobroId,
    message: 'Cobro registrado exitosamente',
    timestamp: new Date(),
    recibo: {
      numero: cobroId,
      espacioId,
      total,
      metodoPago,
      montoRecibido,
      cambio: montoRecibido ? montoRecibido - total : null,
      fecha: new Date().toLocaleString('es-MX')
    }
  };
}