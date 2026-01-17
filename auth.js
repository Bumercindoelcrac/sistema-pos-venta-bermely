// ===== SISTEMA DE AUTENTICACIÓN COMPLETO =====

// Variables globales
let usuarios = [];
let usuarioActual = null;
let intentosFallidos = {};
const MAX_INTENTOS = 3;
const TIEMPO_BLOQUEO = 5 * 60 * 1000; // 5 minutos en milisegundos

// ===== INICIALIZACIÓN =====

function inicializarSistemaAuth() {
    cargarUsuarios();
    cargarUsuarioActual();
    verificarBloqueos();
}

function cargarUsuarios() {
    // Cargar usuarios desde localStorage o crear predeterminados
    if (localStorage.getItem('bermely_usuarios')) {
        usuarios = JSON.parse(localStorage.getItem('bermely_usuarios'));
    } else {
        crearUsuariosPredeterminados();
    }
    
    // Cargar intentos fallidos
    if (localStorage.getItem('bermely_intentos_fallidos')) {
        intentosFallidos = JSON.parse(localStorage.getItem('bermely_intentos_fallidos'));
    }
}

function crearUsuariosPredeterminados() {
    usuarios = [
        {
            id: 'admin-001',
            usuario: 'admin',
            nombre: 'Administrador Principal',
            password: 'admin123',
            rol: 'admin',
            email: 'admin@bermely.com',
            activo: true,
            fechaCreacion: new Date().toISOString(),
            ultimoAcceso: null,
            permisos: ['*'], // Todos los permisos
            turno: null
        },
        {
            id: 'gerente-001',
            usuario: 'gerente',
            nombre: 'Gerente General',
            password: 'gerente123',
            rol: 'gerente',
            email: 'gerente@bermely.com',
            activo: true,
            fechaCreacion: new Date().toISOString(),
            ultimoAcceso: null,
            permisos: [
                'ver_mesas',
                'ver_pedidos',
                'ver_caja',
                'ver_reportes',
                'gestion_menu',
                'gestion_usuarios_meseros',
                'gestion_usuarios_cocina',
                'gestion_usuarios_cafeteria',
                'ver_estadisticas',
                'realizar_corte_caja'
            ],
            turno: 'completo'
        },
        {
            id: 'mesero-001',
            usuario: 'mesero1',
            nombre: 'Juan Pérez',
            password: 'mesero123',
            rol: 'mesero',
            email: 'juan@bermely.com',
            activo: true,
            fechaCreacion: new Date().toISOString(),
            ultimoAcceso: null,
            permisos: [
                'ver_mesas',
                'tomar_pedidos',
                'modificar_pedidos',
                'cobrar_cuentas',
                'ver_pedidos_listos',
                'ver_historial_mesas',
                'ver_comandas'
            ],
            turno: 'matutino',
            mesas_asignadas: []
        },
        {
            id: 'mesero-002',
            usuario: 'mesero2',
            nombre: 'María García',
            password: 'mesero123',
            rol: 'mesero',
            email: 'maria@bermely.com',
            activo: true,
            fechaCreacion: new Date().toISOString(),
            ultimoAcceso: null,
            permisos: [
                'ver_mesas',
                'tomar_pedidos',
                'modificar_pedidos',
                'cobrar_cuentas',
                'ver_pedidos_listos',
                'ver_historial_mesas',
                'ver_comandas'
            ],
            turno: 'vespertino',
            mesas_asignadas: []
        },
        {
            id: 'cocina-001',
            usuario: 'cocina',
            nombre: 'Chef Principal',
            password: 'cocina123',
            rol: 'cocina',
            email: 'cocina@bermely.com',
            activo: true,
            fechaCreacion: new Date().toISOString(),
            ultimoAcceso: null,
            permisos: [
                'ver_comandas_cocina',
                'marcar_preparacion',
                'marcar_listo',
                'ver_pedidos_pendientes',
                'ver_pedidos_preparacion',
                'ver_pedidos_listos',
                'ver_estadisticas_cocina'
            ],
            turno: 'completo',
            especialidad: 'cocina'
        },
        {
            id: 'cafeteria-001',
            usuario: 'cafeteria',
            nombre: 'Barista Principal',
            password: 'cafe123',
            rol: 'cafeteria',
            email: 'cafeteria@bermely.com',
            activo: true,
            fechaCreacion: new Date().toISOString(),
            ultimoAcceso: null,
            permisos: [
                'ver_comandas_cafeteria',
                'marcar_preparacion',
                'marcar_listo',
                'venta_express',
                'ver_pedidos_pendientes',
                'ver_pedidos_preparacion',
                'ver_pedidos_listos',
                'ver_estadisticas_cafeteria'
            ],
            turno: 'completo',
            especialidad: 'cafeteria'
        },
        {
            id: 'supervisor-001',
            usuario: 'supervisor',
            nombre: 'Supervisor de Turno',
            password: 'super123',
            rol: 'supervisor',
            email: 'supervisor@bermely.com',
            activo: true,
            fechaCreacion: new Date().toISOString(),
            ultimoAcceso: null,
            permisos: [
                'ver_mesas',
                'ver_pedidos',
                'ver_caja',
                'ver_reportes',
                'gestion_menu_rapido',
                'ver_estadisticas',
                'asignar_meseros',
                'ver_alertas'
            ],
            turno: 'matutino'
        }
    ];
    
    guardarUsuarios();
}

function cargarUsuarioActual() {
    const usuarioJSON = localStorage.getItem('bermely_usuario_actual');
    if (usuarioJSON) {
        usuarioActual = JSON.parse(usuarioJSON);
        actualizarUltimoAcceso();
    }
}

function guardarUsuarios() {
    localStorage.setItem('bermely_usuarios', JSON.stringify(usuarios));
}

function guardarIntentosFallidos() {
    localStorage.setItem('bermely_intentos_fallidos', JSON.stringify(intentosFallidos));
}

// ===== FUNCIONES DE AUTENTICACIÓN =====

function login(usuario, password, recordar = false) {
    // Verificar si el usuario está bloqueado
    if (estaBloqueado(usuario)) {
        return {
            exito: false,
            mensaje: 'Usuario bloqueado temporalmente. Intenta nuevamente en 5 minutos.',
            bloqueado: true
        };
    }
    
    // Buscar usuario
    const usuarioEncontrado = usuarios.find(u => 
        u.usuario.toLowerCase() === usuario.toLowerCase() && 
        u.activo === true
    );
    
    if (!usuarioEncontrado) {
        registrarIntentoFallido(usuario);
        return {
            exito: false,
            mensaje: 'Usuario no encontrado o inactivo',
            intentosRestantes: getIntentosRestantes(usuario)
        };
    }
    
    // Verificar contraseña
    if (usuarioEncontrado.password !== password) {
        registrarIntentoFallido(usuario);
        return {
            exito: false,
            mensaje: 'Contraseña incorrecta',
            intentosRestantes: getIntentosRestantes(usuario),
            usuarioBloqueado: estaBloqueado(usuario)
        };
    }
    
    // Login exitoso
    usuarioActual = {
        ...usuarioEncontrado,
        fechaLogin: new Date().toISOString(),
        token: generarToken(usuarioEncontrado.id),
        sessionId: generarSessionId()
    };
    
    // Limpiar intentos fallidos
    limpiarIntentosFallidos(usuario);
    
    // Guardar sesión
    guardarSesion(recordar);
    
    // Actualizar último acceso
    actualizarUltimoAccesoUsuario(usuarioEncontrado.id);
    
    return {
        exito: true,
        mensaje: 'Login exitoso',
        usuario: usuarioActual,
        redireccion: getRedireccionPorRol(usuarioActual.rol)
    };
}

function logout() {
    if (usuarioActual) {
        // Registrar logout
        const index = usuarios.findIndex(u => u.id === usuarioActual.id);
        if (index !== -1) {
            usuarios[index].ultimoLogout = new Date().toISOString();
            guardarUsuarios();
        }
    }
    
    // Limpiar sesión
    usuarioActual = null;
    localStorage.removeItem('bermely_usuario_actual');
    sessionStorage.removeItem('bermely_session');
    
    return {
        exito: true,
        mensaje: 'Sesión cerrada exitosamente'
    };
}

function verificarSesion(rolRequerido = null, permisosRequeridos = []) {
    // Cargar usuario actual si no está cargado
    if (!usuarioActual) {
        cargarUsuarioActual();
    }
    
    if (!usuarioActual) {
        return {
            valida: false,
            mensaje: 'No hay sesión activa',
            redireccion: 'index.html'
        };
    }
    
    // Verificar expiración de sesión (8 horas)
    const fechaLogin = new Date(usuarioActual.fechaLogin);
    const ahora = new Date();
    const horasTranscurridas = (ahora - fechaLogin) / (1000 * 60 * 60);
    
    if (horasTranscurridas > 8) {
        logout();
        return {
            valida: false,
            mensaje: 'Sesión expirada',
            redireccion: 'index.html'
        };
    }
    
    // Verificar rol si se requiere
    if (rolRequerido) {
        if (!verificarRol(rolRequerido)) {
            return {
                valida: false,
                mensaje: 'No tienes permisos para acceder a esta sección',
                redireccion: getRedireccionPorRol(usuarioActual.rol)
            };
        }
    }
    
    // Verificar permisos específicos si se requieren
    if (permisosRequeridos.length > 0) {
        const permisosFaltantes = permisosRequeridos.filter(permiso => 
            !tienePermiso(permiso)
        );
        
        if (permisosFaltantes.length > 0) {
            return {
                valida: false,
                mensaje: `Faltan permisos: ${permisosFaltantes.join(', ')}`,
                redireccion: getRedireccionPorRol(usuarioActual.rol)
            };
        }
    }
    
    return {
        valida: true,
        usuario: usuarioActual,
        mensaje: 'Sesión válida'
    };
}

// ===== FUNCIONES DE ROLES Y PERMISOS =====

function verificarRol(rolRequerido) {
    if (!usuarioActual) return false;
    
    // Gerente tiene acceso a páginas de admin
    if (rolRequerido === 'admin' && usuarioActual.rol === 'gerente') {
        return true;
    }
    
    // Supervisor tiene acceso limitado
    if (rolRequerido === 'supervisor' && 
        (usuarioActual.rol === 'supervisor' || usuarioActual.rol === 'admin' || usuarioActual.rol === 'gerente')) {
        return true;
    }
    
    return usuarioActual.rol === rolRequerido;
}

function tienePermiso(permiso) {
    if (!usuarioActual) return false;
    
    // Admin tiene todos los permisos
    if (usuarioActual.rol === 'admin' || usuarioActual.permisos?.includes('*')) {
        return true;
    }
    
    // Gerente tiene casi todos los permisos excepto algunos específicos
    if (usuarioActual.rol === 'gerente') {
        const permisosRestringidos = [
            'crear_usuarios_admin',
            'eliminar_usuarios_admin',
            'configuracion_avanzada',
            'restaurar_sistema'
        ];
        
        if (permisosRestringidos.includes(permiso)) {
            return false;
        }
    }
    
    return usuarioActual.permisos?.includes(permiso) || false;
}

function getPermisosPorRol(rol) {
    const permisosPorRol = {
        admin: [
            '*'
        ],
        gerente: [
            'ver_mesas',
            'ver_pedidos',
            'ver_caja',
            'ver_reportes',
            'gestion_menu',
            'gestion_usuarios_meseros',
            'gestion_usuarios_cocina',
            'gestion_usuarios_cafeteria',
            'ver_estadisticas',
            'realizar_corte_caja',
            'configuracion_basica',
            'ver_alertas',
            'gestion_turnos'
        ],
        supervisor: [
            'ver_mesas',
            'ver_pedidos',
            'ver_caja',
            'ver_reportes',
            'gestion_menu_rapido',
            'ver_estadisticas',
            'asignar_meseros',
            'ver_alertas',
            'ver_historial_turno'
        ],
        mesero: [
            'ver_mesas',
            'tomar_pedidos',
            'modificar_pedidos',
            'cobrar_cuentas',
            'ver_pedidos_listos',
            'ver_historial_mesas',
            'ver_comandas',
            'ver_estadisticas_propias'
        ],
        cocina: [
            'ver_comandas_cocina',
            'marcar_preparacion',
            'marcar_listo',
            'ver_pedidos_pendientes',
            'ver_pedidos_preparacion',
            'ver_pedidos_listos',
            'ver_estadisticas_cocina',
            'reportar_problemas'
        ],
        cafeteria: [
            'ver_comandas_cafeteria',
            'marcar_preparacion',
            'marcar_listo',
            'venta_express',
            'ver_pedidos_pendientes',
            'ver_pedidos_preparacion',
            'ver_pedidos_listos',
            'ver_estadisticas_cafeteria',
            'reportar_problemas'
        ]
    };
    
    return permisosPorRol[rol] || [];
}

function getRedireccionPorRol(rol) {
    const redirecciones = {
        admin: 'admin.html',
        gerente: 'admin.html',
        supervisor: 'admin.html',
        mesero: 'mesero.html',
        cocina: 'cocina.html',
        cafeteria: 'cocina.html'
    };
    
    return redirecciones[rol] || 'index.html';
}

// ===== GESTIÓN DE USUARIOS =====

function crearUsuario(usuarioData, creadorId) {
    const creador = usuarios.find(u => u.id === creadorId);
    
    if (!creador || !(creador.rol === 'admin' || creador.rol === 'gerente')) {
        return {
            exito: false,
            mensaje: 'No tienes permisos para crear usuarios'
        };
    }
    
    // Validar que el gerente no pueda crear admin
    if (creador.rol === 'gerente' && usuarioData.rol === 'admin') {
        return {
            exito: false,
            mensaje: 'Los gerentes no pueden crear administradores'
        };
    }
    
    // Validar que el usuario no exista
    if (usuarios.find(u => u.usuario.toLowerCase() === usuarioData.usuario.toLowerCase())) {
        return {
            exito: false,
            mensaje: 'El usuario ya existe'
        };
    }
    
    // Validar email único si se proporciona
    if (usuarioData.email && usuarios.find(u => u.email === usuarioData.email)) {
        return {
            exito: false,
            mensaje: 'El email ya está registrado'
        };
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = {
        id: `${usuarioData.rol}-${Date.now()}`,
        usuario: usuarioData.usuario,
        nombre: usuarioData.nombre,
        password: usuarioData.password || generarPasswordTemporal(),
        rol: usuarioData.rol,
        email: usuarioData.email || null,
        activo: true,
        fechaCreacion: new Date().toISOString(),
        ultimoAcceso: null,
        creadoPor: creadorId,
        permisos: getPermisosPorRol(usuarioData.rol),
        turno: usuarioData.turno || 'completo',
        ...(usuarioData.rol === 'mesero' && { mesas_asignadas: [] }),
        ...(usuarioData.rol === 'cocina' && { especialidad: usuarioData.especialidad || 'cocina' }),
        ...(usuarioData.rol === 'cafeteria' && { especialidad: usuarioData.especialidad || 'cafeteria' })
    };
    
    usuarios.push(nuevoUsuario);
    guardarUsuarios();
    
    return {
        exito: true,
        mensaje: 'Usuario creado exitosamente',
        usuario: {
            id: nuevoUsuario.id,
            usuario: nuevoUsuario.usuario,
            nombre: nuevoUsuario.nombre,
            rol: nuevoUsuario.rol,
            email: nuevoUsuario.email,
            passwordTemporal: usuarioData.password ? null : nuevoUsuario.password
        }
    };
}

function editarUsuario(usuarioId, datos, editorId) {
    const editor = usuarios.find(u => u.id === editorId);
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
    
    if (usuarioIndex === -1) {
        return {
            exito: false,
            mensaje: 'Usuario no encontrado'
        };
    }
    
    const usuario = usuarios[usuarioIndex];
    
    // Verificar permisos
    if (!editor || !(editor.rol === 'admin' || editor.rol === 'gerente')) {
        return {
            exito: false,
            mensaje: 'No tienes permisos para editar usuarios'
        };
    }
    
    // Gerente no puede editar admin
    if (editor.rol === 'gerente' && usuario.rol === 'admin') {
        return {
            exito: false,
            mensaje: 'Los gerentes no pueden editar administradores'
        };
    }
    
    // Gerente no puede cambiar rol a admin
    if (editor.rol === 'gerente' && datos.rol === 'admin') {
        return {
            exito: false,
            mensaje: 'Los gerentes no pueden asignar rol de administrador'
        };
    }
    
    // Actualizar datos
    const cambios = {};
    
    if (datos.nombre !== undefined) cambios.nombre = datos.nombre;
    if (datos.email !== undefined) cambios.email = datos.email;
    if (datos.rol !== undefined) {
        cambios.rol = datos.rol;
        cambios.permisos = getPermisosPorRol(datos.rol);
    }
    if (datos.turno !== undefined) cambios.turno = datos.turno;
    if (datos.activo !== undefined) cambios.activo = datos.activo;
    if (datos.password !== undefined) cambios.password = datos.password;
    if (datos.especialidad !== undefined) cambios.especialidad = datos.especialidad;
    
    usuarios[usuarioIndex] = {
        ...usuarios[usuarioIndex],
        ...cambios,
        actualizadoPor: editorId,
        fechaActualizacion: new Date().toISOString()
    };
    
    guardarUsuarios();
    
    return {
        exito: true,
        mensaje: 'Usuario actualizado exitosamente',
        usuario: usuarios[usuarioIndex]
    };
}

function eliminarUsuario(usuarioId, eliminadorId) {
    const eliminador = usuarios.find(u => u.id === eliminadorId);
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
    
    if (usuarioIndex === -1) {
        return {
            exito: false,
            mensaje: 'Usuario no encontrado'
        };
    }
    
    const usuario = usuarios[usuarioIndex];
    
    // Verificar permisos (solo admin puede eliminar)
    if (!eliminador || eliminador.rol !== 'admin') {
        return {
            exito: false,
            mensaje: 'Solo los administradores pueden eliminar usuarios'
        };
    }
    
    // No se puede eliminar a sí mismo
    if (usuarioId === eliminadorId) {
        return {
            exito: false,
            mensaje: 'No puedes eliminar tu propio usuario'
        };
    }
    
    // No se puede eliminar el último admin
    if (usuario.rol === 'admin') {
        const adminCount = usuarios.filter(u => u.rol === 'admin' && u.activo).length;
        if (adminCount <= 1) {
            return {
                exito: false,
                mensaje: 'No se puede eliminar el último administrador activo'
            };
        }
    }
    
    // Marcar como inactivo en lugar de eliminar (soft delete)
    usuarios[usuarioIndex].activo = false;
    usuarios[usuarioIndex].fechaEliminacion = new Date().toISOString();
    usuarios[usuarioIndex].eliminadoPor = eliminadorId;
    
    guardarUsuarios();
    
    return {
        exito: true,
        mensaje: 'Usuario desactivado exitosamente'
    };
}

function obtenerUsuarios(filtros = {}) {
    let usuariosFiltrados = usuarios;
    
    // Aplicar filtros
    if (filtros.rol) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.rol === filtros.rol);
    }
    
    if (filtros.activo !== undefined) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.activo === filtros.activo);
    }
    
    if (filtros.turno) {
        usuariosFiltrados = usuariosFiltrados.filter(u => u.turno === filtros.turno);
    }
    
    if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        usuariosFiltrados = usuariosFiltrados.filter(u => 
            u.nombre.toLowerCase().includes(busqueda) ||
            u.usuario.toLowerCase().includes(busqueda) ||
            (u.email && u.email.toLowerCase().includes(busqueda))
        );
    }
    
    // Ordenar por nombre
    usuariosFiltrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    // Omitir datos sensibles
    return usuariosFiltrados.map(u => ({
        id: u.id,
        usuario: u.usuario,
        nombre: u.nombre,
        rol: u.rol,
        email: u.email,
        activo: u.activo,
        turno: u.turno,
        fechaCreacion: u.fechaCreacion,
        ultimoAcceso: u.ultimoAcceso,
        especialidad: u.especialidad,
        mesas_asignadas: u.mesas_asignadas
    }));
}

function obtenerUsuarioPorId(id) {
    const usuario = usuarios.find(u => u.id === id);
    if (!usuario) return null;
    
    // Omitir datos sensibles
    return {
        id: usuario.id,
        usuario: usuario.usuario,
        nombre: usuario.nombre,
        rol: usuario.rol,
        email: usuario.email,
        activo: usuario.activo,
        turno: usuario.turno,
        fechaCreacion: usuario.fechaCreacion,
        ultimoAcceso: usuario.ultimoAcceso,
        especialidad: usuario.especialidad,
        mesas_asignadas: usuario.mesas_asignadas,
        permisos: usuario.permisos
    };
}

function cambiarPassword(usuarioId, passwordActual, nuevaPassword, confirmarPassword) {
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
    
    if (usuarioIndex === -1) {
        return {
            exito: false,
            mensaje: 'Usuario no encontrado'
        };
    }
    
    // Verificar contraseña actual
    if (usuarios[usuarioIndex].password !== passwordActual) {
        return {
            exito: false,
            mensaje: 'Contraseña actual incorrecta'
        };
    }
    
    // Verificar que las nuevas contraseñas coincidan
    if (nuevaPassword !== confirmarPassword) {
        return {
            exito: false,
            mensaje: 'Las contraseñas no coinciden'
        };
    }
    
    // Validar fortaleza de la contraseña
    if (nuevaPassword.length < 6) {
        return {
            exito: false,
            mensaje: 'La contraseña debe tener al menos 6 caracteres'
        };
    }
    
    // Cambiar contraseña
    usuarios[usuarioIndex].password = nuevaPassword;
    usuarios[usuarioIndex].fechaCambioPassword = new Date().toISOString();
    usuarios[usuarioIndex].requiereCambioPassword = false;
    
    guardarUsuarios();
    
    return {
        exito: true,
        mensaje: 'Contraseña cambiada exitosamente'
    };
}

function resetearPassword(usuarioId, reseteadorId) {
    const reseteador = usuarios.find(u => u.id === reseteadorId);
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
    
    if (usuarioIndex === -1) {
        return {
            exito: false,
            mensaje: 'Usuario no encontrado'
        };
    }
    
    // Verificar permisos (solo admin y gerente pueden resetear)
    if (!reseteador || !(reseteador.rol === 'admin' || reseteador.rol === 'gerente')) {
        return {
            exito: false,
            mensaje: 'No tienes permisos para resetear contraseñas'
        };
    }
    
    // Gerente no puede resetear admin
    if (reseteador.rol === 'gerente' && usuarios[usuarioIndex].rol === 'admin') {
        return {
            exito: false,
            mensaje: 'Los gerentes no pueden resetear contraseñas de administradores'
        };
    }
    
    // Generar nueva contraseña temporal
    const passwordTemporal = generarPasswordTemporal();
    
    usuarios[usuarioIndex].password = passwordTemporal;
    usuarios[usuarioIndex].requiereCambioPassword = true;
    usuarios[usuarioIndex].fechaResetPassword = new Date().toISOString();
    usuarios[usuarioIndex].resetadoPor = reseteadorId;
    
    guardarUsuarios();
    
    return {
        exito: true,
        mensaje: 'Contraseña reseteada exitosamente',
        passwordTemporal: passwordTemporal,
        usuario: usuarios[usuarioIndex].usuario
    };
}

// ===== FUNCIONES DE SEGURIDAD =====

function registrarIntentoFallido(usuario) {
    const ahora = Date.now();
    
    if (!intentosFallidos[usuario]) {
        intentosFallidos[usuario] = {
            intentos: 1,
            primerIntento: ahora,
            ultimoIntento: ahora
        };
    } else {
        intentosFallidos[usuario].intentos++;
        intentosFallidos[usuario].ultimoIntento = ahora;
        
        // Si han pasado más de 5 minutos desde el primer intento, reiniciar contador
        if (ahora - intentosFallidos[usuario].primerIntento > TIEMPO_BLOQUEO) {
            intentosFallidos[usuario] = {
                intentos: 1,
                primerIntento: ahora,
                ultimoIntento: ahora
            };
        }
    }
    
    guardarIntentosFallidos();
    
    // Bloquear si supera el máximo de intentos
    if (intentosFallidos[usuario].intentos >= MAX_INTENTOS) {
        intentosFallidos[usuario].bloqueadoHasta = ahora + TIEMPO_BLOQUEO;
        guardarIntentosFallidos();
    }
}

function limpiarIntentosFallidos(usuario) {
    if (intentosFallidos[usuario]) {
        delete intentosFallidos[usuario];
        guardarIntentosFallidos();
    }
}

function estaBloqueado(usuario) {
    const intentos = intentosFallidos[usuario];
    if (!intentos || !intentos.bloqueadoHasta) {
        return false;
    }
    
    const ahora = Date.now();
    if (ahora > intentos.bloqueadoHasta) {
        // Desbloquear si ya pasó el tiempo
        delete intentosFallidos[usuario];
        guardarIntentosFallidos();
        return false;
    }
    
    return true;
}

function getIntentosRestantes(usuario) {
    const intentos = intentosFallidos[usuario];
    if (!intentos) {
        return MAX_INTENTOS;
    }
    
    return Math.max(0, MAX_INTENTOS - intentos.intentos);
}

function getTiempoBloqueoRestante(usuario) {
    const intentos = intentosFallidos[usuario];
    if (!intentos || !intentos.bloqueadoHasta) {
        return 0;
    }
    
    const ahora = Date.now();
    const tiempoRestante = intentos.bloqueadoHasta - ahora;
    
    return tiempoRestante > 0 ? tiempoRestante : 0;
}

function verificarBloqueos() {
    const ahora = Date.now();
    let cambios = false;
    
    for (const usuario in intentosFallidos) {
        const intentos = intentosFallidos[usuario];
        
        if (intentos.bloqueadoHasta && ahora > intentos.bloqueadoHasta) {
            delete intentosFallidos[usuario];
            cambios = true;
        }
    }
    
    if (cambios) {
        guardarIntentosFallidos();
    }
}

// ===== FUNCIONES DE SESIÓN =====

function guardarSesion(recordar = false) {
    if (!usuarioActual) return;
    
    const sessionData = {
        usuarioId: usuarioActual.id,
        token: usuarioActual.token,
        fechaLogin: usuarioActual.fechaLogin
    };
    
    // Guardar en sessionStorage para sesión de navegador
    sessionStorage.setItem('bermely_session', JSON.stringify(sessionData));
    
    // Si se seleccionó "recordar", guardar también en localStorage
    if (recordar) {
        localStorage.setItem('bermely_usuario_actual', JSON.stringify(usuarioActual));
    }
}

function restaurarSesion() {
    // Intentar restaurar desde sessionStorage primero
    const sessionJSON = sessionStorage.getItem('bermely_session');
    if (sessionJSON) {
        const sessionData = JSON.parse(sessionJSON);
        const usuario = usuarios.find(u => u.id === sessionData.usuarioId);
        
        if (usuario && sessionData.token === generarToken(usuario.id)) {
            usuarioActual = {
                ...usuario,
                fechaLogin: sessionData.fechaLogin,
                token: sessionData.token,
                sessionId: generarSessionId()
            };
            return true;
        }
    }
    
    // Intentar restaurar desde localStorage
    const usuarioJSON = localStorage.getItem('bermely_usuario_actual');
    if (usuarioJSON) {
        const usuarioData = JSON.parse(usuarioJSON);
        const usuario = usuarios.find(u => u.id === usuarioData.id);
        
        if (usuario && usuarioData.token === generarToken(usuario.id)) {
            // Verificar expiración (30 días para sesiones recordadas)
            const fechaLogin = new Date(usuarioData.fechaLogin);
            const ahora = new Date();
            const diasTranscurridos = (ahora - fechaLogin) / (1000 * 60 * 60 * 24);
            
            if (diasTranscurridos <= 30) {
                usuarioActual = {
                    ...usuario,
                    fechaLogin: usuarioData.fechaLogin,
                    token: usuarioData.token,
                    sessionId: generarSessionId()
                };
                return true;
            } else {
                // Sesión expirada, limpiar
                localStorage.removeItem('bermely_usuario_actual');
            }
        }
    }
    
    return false;
}

function actualizarUltimoAcceso() {
    if (!usuarioActual) return;
    
    actualizarUltimoAccesoUsuario(usuarioActual.id);
}

function actualizarUltimoAccesoUsuario(usuarioId) {
    const index = usuarios.findIndex(u => u.id === usuarioId);
    if (index !== -1) {
        usuarios[index].ultimoAcceso = new Date().toISOString();
        guardarUsuarios();
    }
}

// ===== FUNCIONES DE UTILIDAD =====

function generarToken(usuarioId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return btoa(`${usuarioId}:${timestamp}:${random}`).replace(/=/g, '');
}

function generarSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

function generarPasswordTemporal() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return password;
}

function getUsuarioActual() {
    if (!usuarioActual) {
        cargarUsuarioActual();
    }
    return usuarioActual;
}

function getUsuariosConectados() {
    // Esto sería más complejo en un sistema real con WebSockets
    // Por ahora devolvemos los usuarios que han accedido en los últimos 5 minutos
    const cincoMinutosAtras = new Date(Date.now() - 5 * 60 * 1000);
    
    return usuarios
        .filter(u => u.ultimoAcceso && new Date(u.ultimoAcceso) > cincoMinutosAtras)
        .map(u => ({
            id: u.id,
            nombre: u.nombre,
            rol: u.rol,
            ultimoAcceso: u.ultimoAcceso,
            turno: u.turno
        }));
}

function getEstadisticasUsuarios() {
    const total = usuarios.length;
    const activos = usuarios.filter(u => u.activo).length;
    
    const porRol = {};
    usuarios.forEach(u => {
        porRol[u.rol] = (porRol[u.rol] || 0) + 1;
    });
    
    const porTurno = {};
    usuarios.forEach(u => {
        porTurno[u.turno] = (porTurno[u.turno] || 0) + 1;
    });
    
    // Últimos 5 accesos
    const ultimosAccesos = usuarios
        .filter(u => u.ultimoAcceso)
        .sort((a, b) => new Date(b.ultimoAcceso) - new Date(a.ultimoAcceso))
        .slice(0, 5)
        .map(u => ({
            nombre: u.nombre,
            rol: u.rol,
            ultimoAcceso: u.ultimoAcceso
        }));
    
    return {
        total,
        activos,
        inactivos: total - activos,
        porRol,
        porTurno,
        ultimosAccesos
    };
}

// ===== EXPORTACIÓN DE FUNCIONES =====

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', function() {
    inicializarSistemaAuth();
    
    // Intentar restaurar sesión automáticamente
    if (window.location.pathname.includes('.html') && 
        !window.location.pathname.includes('index.html')) {
        if (restaurarSesion()) {
            console.log('Sesión restaurada automáticamente');
        }
    }
});

// Hacer funciones disponibles globalmente
window.auth = {
    // Autenticación
    login: login,
    logout: logout,
    verificarSesion: verificarSesion,
    restaurarSesion: restaurarSesion,
    
    // Usuario actual
    getUsuarioActual: getUsuarioActual,
    actualizarUltimoAcceso: actualizarUltimoAcceso,
    
    // Roles y permisos
    verificarRol: verificarRol,
    tienePermiso: tienePermiso,
    getPermisosPorRol: getPermisosPorRol,
    getRedireccionPorRol: getRedireccionPorRol,
    
    // Gestión de usuarios
    crearUsuario: crearUsuario,
    editarUsuario: editarUsuario,
    eliminarUsuario: eliminarUsuario,
    obtenerUsuarios: obtenerUsuarios,
    obtenerUsuarioPorId: obtenerUsuarioPorId,
    cambiarPassword: cambiarPassword,
    resetearPassword: resetearPassword,
    
    // Seguridad
    registrarIntentoFallido: registrarIntentoFallido,
    estaBloqueado: estaBloqueado,
    getIntentosRestantes: getIntentosRestantes,
    getTiempoBloqueoRestante: getTiempoBloqueoRestante,
    
    // Utilidades
    getUsuariosConectados: getUsuariosConectados,
    getEstadisticasUsuarios: getEstadisticasUsuarios,
    generarPasswordTemporal: generarPasswordTemporal
};

// También exportar individualmente para compatibilidad
window.login = login;
window.logout = logout;
window.verificarSesion = verificarSesion;
window.getUsuarioActual = getUsuarioActual;
window.tienePermiso = tienePermiso;
window.crearUsuario = crearUsuario;
window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.obtenerTodosUsuarios = () => obtenerUsuarios();

// Función helper para redirección automática
function protegerRuta(rolRequerido = null, permisosRequeridos = []) {
    const resultado = verificarSesion(rolRequerido, permisosRequeridos);
    
    if (!resultado.valida) {
        if (resultado.redireccion) {
            window.location.href = resultado.redireccion;
        } else {
            window.location.href = 'index.html';
        }
        return false;
    }
    
    return true;
}

// Exportar función de protección
window.protegerRuta = protegerRuta;