// reportes.js - Sistema de reportes y estadísticas
import { 
  db,
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from './firebase.js';

// Clase para gestión de reportes
class SistemaReportes {
  constructor() {
    this.ventas = [];
    this.cobros = [];
    this.pedidos = [];
  }
  
  // Obtener ventas del día actual
  async obtenerVentasHoy() {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const cobrosRef = collection(db, "cobros");
      const q = query(
        cobrosRef,
        where("timestamp", ">=", hoy),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      this.cobros = [];
      snapshot.forEach((doc) => {
        this.cobros.push({ id: doc.id, ...doc.data() });
      });
      
      return this.cobros;
      
    } catch (error) {
      console.error("Error obteniendo ventas hoy:", error);
      return [];
    }
  }
  
  // Obtener ventas por rango de fechas
  async obtenerVentasPorFecha(inicio, fin) {
    try {
      const cobrosRef = collection(db, "cobros");
      const q = query(
        cobrosRef,
        where("timestamp", ">=", inicio),
        where("timestamp", "<=", fin),
        orderBy("timestamp", "desc")
      );
      
      const snapshot = await getDocs(q);
      const ventas = [];
      snapshot.forEach((doc) => {
        ventas.push({ id: doc.id, ...doc.data() });
      });
      
      return ventas;
      
    } catch (error) {
      console.error("Error obteniendo ventas por fecha:", error);
      return [];
    }
  }
  
  // Obtener ventas por mesero
  async obtenerVentasPorMesero() {
    try {
      const ventas = await this.obtenerVentasHoy();
      const ventasPorMesero = {};
      
      ventas.forEach(venta => {
        const mesero = venta.mesero || 'Sin mesero';
        if (!ventasPorMesero[mesero]) {
          ventasPorMesero[mesero] = {
            mesero: mesero,
            total: 0,
            cantidad: 0,
            ventas: []
          };
        }
        
        ventasPorMesero[mesero].total += venta.total || 0;
        ventasPorMesero[mesero].cantidad++;
        ventasPorMesero[mesero].ventas.push(venta);
      });
      
      return Object.values(ventasPorMesero);
      
    } catch (error) {
      console.error("Error obteniendo ventas por mesero:", error);
      return [];
    }
  }
  
  // Obtener ventas por mesa
  async obtenerVentasPorMesa() {
    try {
      const ventas = await this.obtenerVentasHoy();
      const ventasPorMesa = {};
      
      ventas.forEach(venta => {
        const mesa = venta.espacioNombre || 'Sin mesa';
        if (!ventasPorMesa[mesa]) {
          ventasPorMesa[mesa] = {
            mesa: mesa,
            total: 0,
            cantidad: 0,
            ventas: []
          };
        }
        
        ventasPorMesa[mesa].total += venta.total || 0;
        ventasPorMesa[mesa].cantidad++;
        ventasPorMesa[mesa].ventas.push(venta);
      });
      
      return Object.values(ventasPorMesa);
      
    } catch (error) {
      console.error("Error obteniendo ventas por mesa:", error);
      return [];
    }
  }
  
  // Obtener estadísticas del día
  async obtenerEstadisticasDia() {
    try {
      const ventas = await this.obtenerVentasHoy();
      const pedidosSnapshot = await getDocs(collection(db, "pedidos"));
      const pedidosHoy = [];
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      pedidosSnapshot.forEach((doc) => {
        const pedido = doc.data();
        const timestamp = pedido.timestamp?.toDate ? pedido.timestamp.toDate() : pedido.timestamp;
        if (timestamp >= hoy) {
          pedidosHoy.push({ id: doc.id, ...pedido });
        }
      });
      
      const totalVentas = ventas.reduce((sum, venta) => sum + (venta.total || 0), 0);
      const ventasEfectivo = ventas.filter(v => v.metodoPago === 'efectivo').reduce((sum, v) => sum + (v.total || 0), 0);
      const ventasTarjeta = ventas.filter(v => v.metodoPago === 'tarjeta').reduce((sum, v) => sum + (v.total || 0), 0);
      const ventasTransferencia = ventas.filter(v => v.metodoPago === 'transferencia').reduce((sum, v) => sum + (v.total || 0), 0);
      
      const pedidosCocina = pedidosHoy.filter(p => p.area === 'cocina').length;
      const pedidosCafeteria = pedidosHoy.filter(p => p.area === 'cafeteria').length;
      
      const mesasAtendidas = [...new Set(ventas.map(v => v.espacioNombre))].length;
      
      return {
        fecha: new Date().toLocaleDateString('es-MX'),
        totalVentas: totalVentas,
        cantidadVentas: ventas.length,
        mesasAtendidas: mesasAtendidas,
        porMetodoPago: {
          efectivo: ventasEfectivo,
          tarjeta: ventasTarjeta,
          transferencia: ventasTransferencia
        },
        pedidos: {
          total: pedidosHoy.length,
          cocina: pedidosCocina,
          cafeteria: pedidosCafeteria
        },
        ticketPromedio: ventas.length > 0 ? totalVentas / ventas.length : 0
      };
      
    } catch (error) {
      console.error("Error obteniendo estadísticas:", error);
      return null;
    }
  }
  
  // Generar corte de caja
  async generarCorteCaja() {
    try {
      const estadisticas = await this.obtenerEstadisticasDia();
      const ventasPorMesero = await this.obtenerVentasPorMesero();
      const ventasPorMesa = await this.obtenerVentasPorMesa();
      
      const corte = {
        fecha: new Date().toISOString(),
        horaGeneracion: new Date().toLocaleTimeString('es-MX'),
        estadisticas: estadisticas,
        ventasPorMesero: ventasPorMesero,
        ventasPorMesa: ventasPorMesa,
        detalleVentas: await this.obtenerVentasHoy()
      };
      
      return corte;
      
    } catch (error) {
      console.error("Error generando corte de caja:", error);
      throw error;
    }
  }
  
  // Exportar reporte a CSV
  generarCSVReporte(ventas) {
    let csv = 'Fecha,Hora,Mesa,Cliente,Mesero,Total,Método Pago\n';
    
    ventas.forEach(venta => {
      const fecha = venta.timestamp?.toDate ? 
        venta.timestamp.toDate().toLocaleDateString('es-MX') : 
        new Date().toLocaleDateString('es-MX');
      
      const hora = venta.timestamp?.toDate ? 
        venta.timestamp.toDate().toLocaleTimeString('es-MX') : 
        new Date().toLocaleTimeString('es-MX');
      
      csv += `"${fecha}","${hora}","${venta.espacioNombre || ''}","${venta.cliente || ''}","${venta.mesero || ''}",${venta.total || 0},"${venta.metodoPago || ''}"\n`;
    });
    
    return csv;
  }
  
  // Obtener productos más vendidos
  async obtenerProductosMasVendidos() {
    try {
      const pedidosSnapshot = await getDocs(collection(db, "pedidos"));
      const productosVendidos = {};
      
      pedidosSnapshot.forEach((doc) => {
        const pedido = doc.data();
        if (pedido.items) {
          pedido.items.forEach(item => {
            const productoId = item.productoId || item.nombre;
            if (!productosVendidos[productoId]) {
              productosVendidos[productoId] = {
                nombre: item.nombre,
                cantidad: 0,
                total: 0,
                area: item.area
              };
            }
            
            productosVendidos[productoId].cantidad += item.cantidad || 1;
            productosVendidos[productoId].total += (item.precioTotal || 0) * (item.cantidad || 1);
          });
        }
      });
      
      const productosArray = Object.values(productosVendidos);
      productosArray.sort((a, b) => b.cantidad - a.cantidad);
      
      return productosArray.slice(0, 10); // Top 10
      
    } catch (error) {
      console.error("Error obteniendo productos más vendidos:", error);
      return [];
    }
  }
  
  // Obtener horas pico
  async obtenerHorasPico() {
    try {
      const ventas = await this.obtenerVentasHoy();
      const horas = {};
      
      ventas.forEach(venta => {
        const timestamp = venta.timestamp?.toDate ? venta.timestamp.toDate() : new Date();
        const hora = timestamp.getHours();
        const horaStr = `${hora}:00`;
        
        if (!horas[horaStr]) {
          horas[horaStr] = {
            hora: horaStr,
            ventas: 0,
            total: 0
          };
        }
        
        horas[horaStr].ventas++;
        horas[horaStr].total += venta.total || 0;
      });
      
      return Object.values(horas).sort((a, b) => b.ventas - a.ventas);
      
    } catch (error) {
      console.error("Error obteniendo horas pico:", error);
      return [];
    }
  }
}

// Crear instancia global
export const sistemaReportes = new SistemaReportes();

// Funciones para renderizar gráficos
export function renderizarGraficoVentas(ventas, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Agrupar por método de pago
  const porMetodo = {
    efectivo: 0,
    tarjeta: 0,
    transferencia: 0
  };
  
  ventas.forEach(venta => {
    const metodo = venta.metodoPago || 'efectivo';
    if (porMetodo[metodo] !== undefined) {
      porMetodo[metodo] += venta.total || 0;
    }
  });
  
  const ctx = document.createElement('canvas');
  container.innerHTML = '';
  container.appendChild(ctx);
  
  // En un sistema real usarías Chart.js o similar
  // Aquí solo mostramos datos en texto
  const total = Object.values(porMetodo).reduce((a, b) => a + b, 0);
  
  let html = `
    <div class="resumen-ventas">
      <h4>Ventas por Método de Pago</h4>
      <div class="metodos-pago-resumen">
        <div class="metodo-resumen">
          <div class="metodo-color" style="background: #2ecc71;"></div>
          <div class="metodo-info">
            <strong>Efectivo</strong>
            <span>$${porMetodo.efectivo.toFixed(2)} (${total > 0 ? ((porMetodo.efectivo/total)*100).toFixed(1) : 0}%)</span>
          </div>
        </div>
        <div class="metodo-resumen">
          <div class="metodo-color" style="background: #3498db;"></div>
          <div class="metodo-info">
            <strong>Tarjeta</strong>
            <span>$${porMetodo.tarjeta.toFixed(2)} (${total > 0 ? ((porMetodo.tarjeta/total)*100).toFixed(1) : 0}%)</span>
          </div>
        </div>
        <div class="metodo-resumen">
          <div class="metodo-color" style="background: #9b59b6;"></div>
          <div class="metodo-info">
            <strong>Transferencia</strong>
            <span>$${porMetodo.transferencia.toFixed(2)} (${total > 0 ? ((porMetodo.transferencia/total)*100).toFixed(1) : 0}%)</span>
          </div>
        </div>
      </div>
      <div class="total-dia">
        <h3>Total del día: $${total.toFixed(2)}</h3>
        <p>${ventas.length} ventas registradas</p>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}