// ===== SISTEMA DE NOTIFICACIONES =====

// Notificaciones en tiempo real
let notificaciones = [];
let notificacionCallback = null;

function inicializarNotificaciones() {
    if (useLocalStorage) {
        // En modo local, cargar notificaciones existentes
        notificaciones = JSON.parse(localStorage.getItem('bermely_notificaciones') || '[]');
    }
}

// Crear notificación
function crearNotificacion(tipo, mensaje, datos = {}) {
    const notificacion = {
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        tipo: tipo, // 'pedido_listo', 'nuevo_pedido', 'alerta'
        mensaje: mensaje,
        datos: datos,
        leida: false,
        fecha: new Date().toISOString(),
        usuarioDestino: datos.usuarioDestino || null
    };
    
    if (useLocalStorage) {
        notificaciones.push(notificacion);
        localStorage.setItem('bermely_notificaciones', JSON.stringify(notificaciones));
    } else {
        // En Firebase se guardaría en colección notificaciones
    }
    
    // Disparar callback si existe
    if (notificacionCallback) {
        notificacionCallback(notificacion);
    }
    
    return notificacion.id;
}

// Obtener notificaciones no leídas
function obtenerNotificacionesNoLeidas(usuario = null) {
    let filtradas = notificaciones.filter(n => !n.leida);
    
    if (usuario) {
        filtradas = filtradas.filter(n => 
            !n.usuarioDestino || n.usuarioDestino === usuario
        );
    }
    
    return filtradas;
}

// Marcar notificación como leída
function marcarNotificacionLeida(id) {
    const index = notificaciones.findIndex(n => n.id === id);
    if (index !== -1) {
        notificaciones[index].leida = true;
        
        if (useLocalStorage) {
            localStorage.setItem('bermely_notificaciones', JSON.stringify(notificaciones));
        }
        
        return true;
    }
    return false;
}

// Escuchar nuevas notificaciones
function escucharNotificaciones(callback, usuario = null) {
    notificacionCallback = (notif) => {
        // Filtrar por usuario si se especifica
        if (!usuario || !notif.usuarioDestino || notif.usuarioDestino === usuario) {
            callback(notif);
        }
    };
    
    // Para modo local, simular escucha periódica
    if (useLocalStorage) {
        setInterval(() => {
            // Verificar cambios en localStorage
            const nuevasNotificaciones = JSON.parse(localStorage.getItem('bermely_notificaciones') || '[]');
            const nuevas = nuevasNotificaciones.filter(nueva => 
                !notificaciones.some(existente => existente.id === nueva.id)
            );
            
            nuevas.forEach(notif => {
                if (callback && (!usuario || !notif.usuarioDestino || notif.usuarioDestino === usuario)) {
                    callback(notif);
                }
            });
            
            notificaciones = nuevasNotificaciones;
        }, 3000);
    }
}

// Inicializar notificaciones al cargar
document.addEventListener('DOMContentLoaded', inicializarNotificaciones);