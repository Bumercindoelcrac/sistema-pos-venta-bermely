// gestion-menu.js - Módulo de gestión de menú y extras
import { 
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from './firebase.js';

// Clase para gestión del menú
class GestionMenu {
  constructor() {
    this.categorias = [];
    this.productos = [];
    this.extras = [];
  }
  
  // Cargar todo el menú
  async cargarMenuCompleto() {
    try {
      // Cargar productos
      const productosSnapshot = await getDocs(collection(db, "menu"));
      this.productos = [];
      productosSnapshot.forEach((doc) => {
        this.productos.push({ id: doc.id, ...doc.data() });
      });
      
      // Extraer categorías únicas
      this.categorias = [...new Set(this.productos.map(p => p.categoria))];
      
      // Extraer todos los extras
      this.extras = [];
      this.productos.forEach(producto => {
        if (producto.extras && producto.extras.length > 0) {
          producto.extras.forEach(extra => {
            if (!this.extras.find(e => e.id === extra.id)) {
              this.extras.push(extra);
            }
          });
        }
      });
      
      return {
        productos: this.productos,
        categorias: this.categorias,
        extras: this.extras
      };
      
    } catch (error) {
      console.error("Error cargando menú:", error);
      throw error;
    }
  }
  
  // Agregar nuevo producto
  async agregarProducto(productoData) {
    try {
      // Validar datos requeridos
      if (!productoData.nombre || !productoData.precio || !productoData.area) {
        throw new Error("Nombre, precio y área son requeridos");
      }
      
      // Crear ID único
      const id = productoData.nombre.toLowerCase().replace(/\s+/g, '-');
      const productoRef = doc(db, "menu", id);
      
      // Verificar si ya existe
      const existe = await getDoc(productoRef);
      if (existe.exists()) {
        throw new Error("Ya existe un producto con ese nombre");
      }
      
      // Crear producto con estructura completa
      const productoCompleto = {
        ...productoData,
        id: id,
        disponible: productoData.disponible !== undefined ? productoData.disponible : true,
        timestamp: serverTimestamp(),
        ultimaActualizacion: serverTimestamp()
      };
      
      await setDoc(productoRef, productoCompleto);
      
      // Actualizar lista local
      this.productos.push(productoCompleto);
      if (!this.categorias.includes(productoData.categoria)) {
        this.categorias.push(productoData.categoria);
      }
      
      return { success: true, producto: productoCompleto };
      
    } catch (error) {
      console.error("Error agregando producto:", error);
      throw error;
    }
  }
  
  // Actualizar producto
  async actualizarProducto(productoId, datosActualizados) {
    try {
      const productoRef = doc(db, "menu", productoId);
      
      // Verificar que existe
      const existe = await getDoc(productoRef);
      if (!existe.exists()) {
        throw new Error("Producto no encontrado");
      }
      
      const updateData = {
        ...datosActualizados,
        ultimaActualizacion: serverTimestamp()
      };
      
      await updateDoc(productoRef, updateData);
      
      // Actualizar en lista local
      const index = this.productos.findIndex(p => p.id === productoId);
      if (index !== -1) {
        this.productos[index] = { ...this.productos[index], ...updateData };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error("Error actualizando producto:", error);
      throw error;
    }
  }
  
  // Eliminar producto
  async eliminarProducto(productoId) {
    try {
      const productoRef = doc(db, "menu", productoId);
      
      // Verificar que existe
      const existe = await getDoc(productoRef);
      if (!existe.exists()) {
        throw new Error("Producto no encontrado");
      }
      
      await deleteDoc(productoRef);
      
      // Eliminar de lista local
      this.productos = this.productos.filter(p => p.id !== productoId);
      
      return { success: true };
      
    } catch (error) {
      console.error("Error eliminando producto:", error);
      throw error;
    }
  }
  
  // Agregar extra a producto
  async agregarExtra(productoId, extraData) {
    try {
      const productoRef = doc(db, "menu", productoId);
      const productoSnap = await getDoc(productoRef);
      
      if (!productoSnap.exists()) {
        throw new Error("Producto no encontrado");
      }
      
      const producto = productoSnap.data();
      const extrasActuales = producto.extras || [];
      
      // Crear ID único para el extra
      const extraId = `${productoId}-${extraData.nombre.toLowerCase().replace(/\s+/g, '-')}`;
      
      const nuevoExtra = {
        id: extraId,
        nombre: extraData.nombre,
        precio: extraData.precio || 0,
        area: producto.area
      };
      
      // Verificar si ya existe
      if (extrasActuales.some(e => e.id === extraId)) {
        throw new Error("Ya existe un extra con ese nombre");
      }
      
      const nuevosExtras = [...extrasActuales, nuevoExtra];
      
      await updateDoc(productoRef, {
        extras: nuevosExtras,
        ultimaActualizacion: serverTimestamp()
      });
      
      // Actualizar en lista local
      const index = this.productos.findIndex(p => p.id === productoId);
      if (index !== -1) {
        this.productos[index].extras = nuevosExtras;
      }
      
      // Agregar a lista de extras global
      if (!this.extras.find(e => e.id === extraId)) {
        this.extras.push(nuevoExtra);
      }
      
      return { success: true, extra: nuevoExtra };
      
    } catch (error) {
      console.error("Error agregando extra:", error);
      throw error;
    }
  }
  
  // Eliminar extra de producto
  async eliminarExtra(productoId, extraId) {
    try {
      const productoRef = doc(db, "menu", productoId);
      const productoSnap = await getDoc(productoRef);
      
      if (!productoSnap.exists()) {
        throw new Error("Producto no encontrado");
      }
      
      const producto = productoSnap.data();
      const extrasActuales = producto.extras || [];
      
      // Filtrar el extra a eliminar
      const nuevosExtras = extrasActuales.filter(e => e.id !== extraId);
      
      await updateDoc(productoRef, {
        extras: nuevosExtras,
        ultimaActualizacion: serverTimestamp()
      });
      
      // Actualizar en lista local
      const index = this.productos.findIndex(p => p.id === productoId);
      if (index !== -1) {
        this.productos[index].extras = nuevosExtras;
      }
      
      return { success: true };
      
    } catch (error) {
      console.error("Error eliminando extra:", error);
      throw error;
    }
  }
  
  // Buscar productos
  buscarProductos(termino) {
    const terminoLower = termino.toLowerCase();
    return this.productos.filter(producto => 
      producto.nombre.toLowerCase().includes(terminoLower) ||
      producto.descripcion?.toLowerCase().includes(terminoLower) ||
      producto.categoria.toLowerCase().includes(terminoLower)
    );
  }
  
  // Filtrar productos por categoría
  filtrarPorCategoria(categoria) {
    if (categoria === 'todos') return this.productos;
    return this.productos.filter(p => p.categoria === categoria);
  }
  
  // Filtrar productos por área
  filtrarPorArea(area) {
    return this.productos.filter(p => p.area === area);
  }
  
  // Obtener estadísticas del menú
  obtenerEstadisticas() {
    const estadisticas = {
      totalProductos: this.productos.length,
      porCategoria: {},
      porArea: {
        cocina: 0,
        cafeteria: 0
      },
      productosDisponibles: 0,
      productosConExtras: 0
    };
    
    this.productos.forEach(producto => {
      // Por categoría
      if (!estadisticas.porCategoria[producto.categoria]) {
        estadisticas.porCategoria[producto.categoria] = 0;
      }
      estadisticas.porCategoria[producto.categoria]++;
      
      // Por área
      if (producto.area === 'cocina') {
        estadisticas.porArea.cocina++;
      } else if (producto.area === 'cafeteria') {
        estadisticas.porArea.cafeteria++;
      }
      
      // Disponibilidad
      if (producto.disponible) {
        estadisticas.productosDisponibles++;
      }
      
      // Con extras
      if (producto.extras && producto.extras.length > 0) {
        estadisticas.productosConExtras++;
      }
    });
    
    return estadisticas;
  }
  
  // Generar reporte CSV del menú
  generarReporteCSV() {
    let csv = 'ID,Nombre,Descripción,Precio,Categoría,Área,Disponible,Extras\n';
    
    this.productos.forEach(producto => {
      const extras = producto.extras?.map(e => `${e.nombre} ($${e.precio})`).join('; ') || 'Sin extras';
      const disponible = producto.disponible ? 'Sí' : 'No';
      
      csv += `"${producto.id}","${producto.nombre}","${producto.descripcion || ''}",${producto.precio},"${producto.categoria}","${producto.area}","${disponible}","${extras}"\n`;
    });
    
    return csv;
  }
}

// Crear instancia global
export const gestionMenu = new GestionMenu();

// Funciones para renderizar menú en admin
export function renderizarTablaProductos(productos, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (productos.length === 0) {
    container.innerHTML = `
      <div class="sin-datos">
        <i class="fas fa-utensils fa-3x"></i>
        <p>No hay productos en el menú</p>
      </div>
    `;
    return;
  }
  
  let html = `
    <table class="tabla-datos">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>Área</th>
          <th>Disponible</th>
          <th>Extras</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  productos.forEach(producto => {
    const extrasTexto = producto.extras?.map(e => `${e.nombre} ($${e.precio})`).join('<br>') || 'Sin extras';
    const disponible = producto.disponible ? 
      '<span class="badge badge-success">Sí</span>' : 
      '<span class="badge badge-danger">No</span>';
    
    html += `
      <tr>
        <td><code>${producto.id}</code></td>
        <td><strong>${producto.nombre}</strong></td>
        <td>${producto.descripcion || '-'}</td>
        <td><span class="precio">$${producto.precio.toFixed(2)}</span></td>
        <td><span class="categoria">${producto.categoria}</span></td>
        <td><span class="area ${producto.area}">${producto.area}</span></td>
        <td>${disponible}</td>
        <td>${extrasTexto}</td>
        <td>
          <button class="btn btn-sm btn-editar" data-id="${producto.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-eliminar" data-id="${producto.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  });
  
  html += `</tbody></table>`;
  container.innerHTML = html;
}