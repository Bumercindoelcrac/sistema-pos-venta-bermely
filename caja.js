// caja.js - Sistema de caja completo
import { 
  agregarDocumento,
  obtenerColeccion,
  query,
  where,
  orderBy,
  serverTimestamp 
} from './firebase.js';

import { 
  obtenerPedidosPorMesa,
  ESTADOS_PEDIDO 
} from './pedidos.js';

// Registrar cobro
async function registrarCobro(datosCobro) {
  const { mesaId, mesaNumero, total, metodoPago, cajero, detalles } = datosCobro;
  
  try {
    const cobro = await agregarDocumento('cobros', {
      mesaId,
      mesaNumero,
      total,
      metodoPago,
      cajero,
      detalles,
      fecha: new Date().toISOString().split('T')[0],
      timestamp: serverTimestamp()
    });
    
    return cobro;
  } catch (error) {
    console.error('Error registrando cobro:', error);
    throw error;
  }
}

// Obtener historial de cobros
async function obtenerHistorialCobros(fecha = null, limite = 50) {
  try {
    let condiciones = [orderBy('timestamp', 'desc')];
    
    if (fecha) {
      condiciones.push(where('fecha', '==', fecha));
    }
    
    const cobros = await obtenerColeccion('cobros');
    return cobros.slice(0, limite);
  } catch (error) {
    console.error('Error obteniendo historial de cobros:', error);
    return [];
  }
}

// Obtener cierre de caja del día
async function obtenerCierreCaja(fecha = null) {
  const fechaActual = fecha || new Date().toISOString().split('T')[0];
  
  try {
    const cobros = await obtenerHistorialCobros(fechaActual, 1000);
    
    const totales = {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      total: 0,
      cantidadCobros: cobros.length
    };
    
    cobros.forEach(cobro => {
      if (cobro.metodoPago === 'efectivo') {
        totales.efectivo += cobro.total || 0;
      } else if (cobro.metodoPago === 'tarjeta') {
        totales.tarjeta += cobro.total || 0;
      } else if (cobro.metodoPago === 'transferencia') {
        totales.transferencia += cobro.total || 0;
      }
      totales.total += cobro.total || 0;
    });
    
    return totales;
  } catch (error) {
    console.error('Error obteniendo cierre de caja:', error);
    return null;
  }
}

// Obtener detalles completos para cobro
async function obtenerDetallesParaCobro(mesaId) {
  try {
    const pedidos = await obtenerPedidosPorMesa(mesaId);
    
    // Filtrar pedidos entregados pero no pagados
    const pedidosACobrar = pedidos.filter(pedido => 
      pedido.estado === ESTADOS_PEDIDO.ENTREGADO || pedido.estado === ESTADOS_PEDIDO.PAGADO
    );
    
    // Organizar detalles
    const detalles = {
      productos: [],
      comentarios: [],
      modificacionesPrecio: [],
      total: 0
    };
    
    pedidosACobrar.forEach(pedido => {
      detalles.total += pedido.total || 0;
      
      if (pedido.items && pedido.items.length > 0) {
        pedido.items.forEach(item => {
          detalles.productos.push({
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio,
            subtotal: item.cantidad * item.precio,
            area: pedido.area
          });
          
          if (item.comentario) {
            detalles.comentarios.push({
              producto: item.nombre,
              comentario: item.comentario
            });
          }
          
          if (item.modificaciones && item.modificaciones.length > 0) {
            item.modificaciones.forEach(mod => {
              detalles.modificacionesPrecio.push({
                producto: item.nombre,
                precioOriginal: mod.precioOriginal,
                precioNuevo: mod.precioNuevo,
                razon: mod.razon,
                fecha: mod.fecha
              });
            });
          }
        });
      }
    });
    
    return detalles;
  } catch (error) {
    console.error('Error obteniendo detalles para cobro:', error);
    return null;
  }
}

// Calcular cambio
function calcularCambio(total, montoRecibido) {
  if (montoRecibido < total) {
    return {
      cambio: 0,
      falta: total - montoRecibido,
      suficiente: false
    };
  }
  
  const cambio = montoRecibido - total;
  
  // Desglosar cambio en billetes y monedas
  const desglose = desglosarCambio(cambio);
  
  return {
    cambio,
    falta: 0,
    suficiente: true,
    desglose
  };
}

// Desglosar cambio en billetes y monedas
function desglosarCambio(monto) {
  const denominaciones = [
    { valor: 1000, nombre: 'Billetes de $1000', tipo: 'billete' },
    { valor: 500, nombre: 'Billetes de $500', tipo: 'billete' },
    { valor: 200, nombre: 'Billetes de $200', tipo: 'billete' },
    { valor: 100, nombre: 'Billetes de $100', tipo: 'billete' },
    { valor: 50, nombre: 'Billetes de $50', tipo: 'billete' },
    { valor: 20, nombre: 'Billetes de $20', tipo: 'billete' },
    { valor: 10, nombre: 'Monedas de $10', tipo: 'moneda' },
    { valor: 5, nombre: 'Monedas de $5', tipo: 'moneda' },
    { valor: 2, nombre: 'Monedas de $2', tipo: 'moneda' },
    { valor: 1, nombre: 'Monedas de $1', tipo: 'moneda' },
    { valor: 0.5, nombre: 'Monedas de $0.50', tipo: 'moneda' },
    { valor: 0.2, nombre: 'Monedas de $0.20', tipo: 'moneda' },
    { valor: 0.1, nombre: 'Monedas de $0.10', tipo: 'moneda' }
  ];
  
  let restante = monto;
  const desglose = [];
  
  denominaciones.forEach(denominacion => {
    if (restante >= denominacion.valor) {
      const cantidad = Math.floor(restante / denominacion.valor);
      if (cantidad > 0) {
        desglose.push({
          ...denominacion,
          cantidad,
          subtotal: cantidad * denominacion.valor
        });
        restante = Math.round((restante - (cantidad * denominacion.valor)) * 100) / 100;
      }
    }
  });
  
  // Si queda algún centavo
  if (restante > 0) {
    desglose.push({
      valor: restante,
      nombre: 'Centavos',
      tipo: 'centavos',
      cantidad: 1,
      subtotal: restante
    });
  }
  
  return desglose;
}

// Generar ticket de cobro
function generarTicketCobro(datosCobro) {
  const { mesaNumero, cliente, mesero, productos, total, metodoPago, cambio, cajero } = datosCobro;
  
  const fecha = new Date().toLocaleString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  let ticket = `
    =================================
              BER-MELY RESTAURANT
    =================================
    Fecha: ${fecha}
    Mesa: ${mesaNumero}
    Cliente: ${cliente}
    Mesero: ${mesero}
    Cajero: ${cajero}
    =================================
    PRODUCTOS:
  `;
  
  productos.forEach(producto => {
    ticket += `\n${producto.cantidad} x ${producto.nombre.padEnd(20)} $${(producto.precio * producto.cantidad).toFixed(2)}`;
    if (producto.comentario) {
      ticket += `\n    ⚠ ${producto.comentario}`;
    }
  });
  
  ticket += `
    =================================
    SUBTOTAL:                 $${total.toFixed(2)}
    MÉTODO DE PAGO:           ${metodoPago.toUpperCase()}
  `;
  
  if (metodoPago === 'efectivo' && cambio) {
    ticket += `
    CAMBIO:                   $${cambio.toFixed(2)}
    `;
  }
  
  ticket += `
    =================================
          ¡GRACIAS POR SU VISITA!
    =================================
  `;
  
  return ticket;
}

export {
  registrarCobro,
  obtenerHistorialCobros,
  obtenerCierreCaja,
  obtenerDetallesParaCobro,
  calcularCambio,
  desglosarCambio,
  generarTicketCobro
};