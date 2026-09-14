# Integración Completa: Bot Telegram → Frontend → Base de Datos

## ✅ Cambios Realizados

### 1. Frontend - Pantalla de Crear Usuario (Admin)
**Archivo:** [src/screens/Usuarios.jsx](../FRONT/src/screens/Usuarios.jsx)

La pantalla de administrador ahora incluye:
- **Botón "+ Nuevo"** en la esquina superior derecha
- **Modal de creación** con campos:
  - Nombre (requerido)
  - Usuario/alias (opcional si hay teléfono)
  - Teléfono (opcional si hay usuario)
  - PIN 4 dígitos (requerido)
  - Rol (Brigadista, Coordinador, Observador, Admin)
- **Validaciones**: Al menos nombre y PIN 4 dígitos
- **Llamada POST /api/usuarios** al backend
- **Mensaje de confirmación** al crear exitosamente

### 2. Backend - Endpoint POST /api/usuarios
**Ya existe** en [routes/usuarios.routes.js](../BACK/routes/usuarios.routes.js)

Acepta:
```json
{
  "nombre": "string",
  "usuario": "string (opcional)",
  "telefono": "string (opcional)",
  "pin": "string (4 dígitos)",
  "rol": "string (admin|coordinador|brigadista|observador)"
}
```

### 3. Base de Datos - ALTER TABLE reportes
**Archivo:** [migrations/001_add_all_report_fields.sql](../BACK/migrations/001_add_all_report_fields.sql)

Se agregaron **25 columnas nuevas** mapeadas directamente del bot de Telegram:

```sql
ALTER TABLE reportes ADD COLUMN (
    lugar_votacion VARCHAR(255),           -- Ubicación para votación
    telefono VARCHAR(20),                   -- Contacto del reportante
    distrito VARCHAR(100),                  -- Distrito electoral
    nombre_contacto VARCHAR(100),           -- Nombre de contacto
    personas_votan INT,                     -- Cantidad de personas que votan
    tipo_necesidad VARCHAR(100),            -- Para tipo "Necesidad barrial"
    cuantos_brigadistas INT,                -- Para tipo "Brigada activa"
    responsable_brigada VARCHAR(100),       -- Encargado de la brigada
    tipo_evento VARCHAR(100),               -- Para tipo "Evento de campaña"
    candidato_evento VARCHAR(100),          -- Quién realiza el evento
    num_asistentes INT,                     -- Cantidad de asistentes
    aceptacion_evento VARCHAR(50),          -- Nivel de aceptación del evento
    tipo_presencia_rival VARCHAR(100),      -- Tipo de actividad rival
    nivel_amenaza VARCHAR(50),              -- Bajo/Medio/Alto/Crítico
    tipo_rumor VARCHAR(100),                -- Para tipo "Rumor electoral"
    sobre_quien_rumor VARCHAR(100),         -- A quién afecta el rumor
    necesidad_movilizacion VARCHAR(100),    -- Para tipo "Movilización"
    edad_rango VARCHAR(20),                 -- Para tipo "Voto indeciso"
    genero_indeciso VARCHAR(20),            -- Género del indeciso
    ocupacion_indeciso VARCHAR(100),        -- Ocupación del indeciso
    factor_duda VARCHAR(100),               -- Razón de la indecisión
    accion_sugerida VARCHAR(500),           -- Acción recomendada por el bot
    perfil_votante VARCHAR(100),            -- Perfil del votante objetivo
    fuente VARCHAR(50),                     -- Origen del reporte
    procesado VARCHAR(20),                  -- Si fue procesado o no
    INDEX idx_tipo_reporte (tipo_reporte),
    INDEX idx_estado (estado),
    INDEX idx_parroquia (parroquia),
    INDEX idx_responsable (responsable)
);
```

---

## 🗺️ Mapeo de Tipos de Reporte → Campos Específicos

| Tipo de Reporte | Campos Específicos | Opciones |
|---|---|---|
| **Reporte ciudadano** | descripcion, prioridad, estado | Genéricas |
| **Incidencia** | descripcion, tipo_necesidad (si aplica) | Genéricas |
| **Brigada activa** | cuantos_brigadistas, responsable_brigada, descripcion | - |
| **Evento de campaña** | tipo_evento, candidato_evento, num_asistentes, aceptacion_evento, accion_sugerida | Caminata, Casa abierta, Concentración, Reunión barrial, Rueda de prensa, Otro |
| **Casa amiga** | personas_votan, lugar_votacion, descripcion | - |
| **Coordinador** | descripcion | Genéricas |
| **Observación electoral** | distrito, lugar_votacion, descripcion | - |
| **Presencia rival** | tipo_presencia_rival, nivel_amenaza, accion_sugerida | Volanteo, Brigada puerta a puerta, Valla, Evento, Candidato presente, Otro |
| **Necesidad barrial** | tipo_necesidad, descripcion, accion_sugerida | Seguridad, Agua, Luz, Alcantarillado, Vialidad, Salud, Educación, Ambiente, Turismo, Servicios públicos, Otro |
| **Líder local** | nombre_contacto, telefono, descripcion | - |
| **Rumor electoral** | tipo_rumor, sobre_quien_rumor, accion_sugerida | Compra de votos, Fraude, Ataque personal, Falsa renuncia, Vínculo con corrupción, Otro |
| **Movilización** | necesidad_movilizacion, cuantos_brigadistas, accion_sugerida | Candidato, Brigadas, Transporte, Material, Refuerzo, Otro |
| **Voto indeciso** | edad_rango, genero_indeciso, ocupacion_indeciso, factor_duda, perfil_votante, accion_sugerida | Ver tablas de opciones abajo |

---

## 📋 Catálogos de Opciones (del bot)

### PARROQUIAS (16)
12 de Marzo, 18 de Octubre, Andrés de Vera, Colón, Francisco Pacheco, Picoazá, Portoviejo, San Pablo, Simón Bolívar, Abdón Calderón, Alhajuela, Chirijo, Crucita, Pueblo Nuevo, Riochico, San Plácido

### TIPOS (13)
Reporte ciudadano, Incidencia, Brigada activa, Evento de campana, Casa amiga, Coordinador, Observacion electoral, Presencia rival, Necesidad barrial, Lider local, Rumor electoral, Movilizacion, Voto indeciso

### PRIORIDADES (4)
Baja, Media, Alta, Critica

### ESTADOS (3)
Pendiente, En proceso, Resuelto

### NECESIDADES (11)
Seguridad, Agua potable, Luz / Energia electrica, Alcantarillado, Vialidad, Salud, Educacion, Ambiente, Turismo, Servicios publicos (otros), Otro

### TIPO_EVENTO (6)
Caminata, Casa abierta, Concentracion, Reunion barrial, Rueda de prensa, Otro

### CANDIDATO_EVENTO (2)
Nuestro candidato (Dennys Guillen), Candidato rival

### ACEPTACION_EVENTO (4)
Muy buena, Buena, Regular, Mala

### TIPO_PRESENCIA_RIVAL (6)
Volanteo, Brigada puerta a puerta, Valla o publicidad, Evento o concentracion, Candidato presente, Otro

### NIVEL_AMENAZA (4)
Bajo, Medio, Alto, Critico

### TIPO_RUMOR (6)
Compra de votos, Fraude electoral, Ataque personal, Falsa renuncia, Vinculo con corrupcion, Otro

### SOBRE_QUIEN_RUMOR (2)
Nuestro candidato, Un candidato rival

### NECESIDAD_MOVILIZACION (6)
Presencia del candidato, Presencia de brigadas, Transporte de votantes, Material de campana, Refuerzo de coordinador, Otro

### EDAD_RANGOS (5)
18-25, 26-35, 36-45, 46-60, 60+

### GENERO (3)
Hombre, Mujer, Otro

### OCUPACION (8)
Comerciante, Agricultor, Estudiante, Empleado publico, Empleado privado, Ama de casa, Jubilado, Otro

### FACTOR_DUDA (4)
Sin definir candidato, Duda entre 2 candidatos, No piensa votar, Indeciso por desinformacion

### PERFIL_VOTANTE (6)
Jovenes, Mujeres, Adultos mayores, Comerciantes, Agricultores, Lideres barriales

### ACCIONES_GENERICAS (5)
Brigada puerta a puerta, Visita del candidato, Reunion barrial, Gestion municipal, Respuesta comunicacional

---

## 🚀 Próximos Pasos (Pendientes)

### Fase 1: Completar Frontend (Formulario Condicional)
El archivo [src/screens/NuevoReporte.jsx](../FRONT/src/screens/NuevoReporte.jsx) necesita actualización para incluir campos dinámicos:

```javascript
// Pseudocódigo de lógica requerida:
if (tipoReporte === 'Evento de campana') {
    mostrar: tipo_evento, candidato_evento, num_asistentes, aceptacion_evento
}
if (tipoReporte === 'Necesidad barrial') {
    mostrar: tipo_necesidad (con 11 opciones)
}
if (tipoReporte === 'Voto indeciso') {
    mostrar: edad_rango, genero_indeciso, ocupacion_indeciso, factor_duda, perfil_votante
}
// Etc. para los otros 10 tipos...
```

### Fase 2: Integrar Acciones Dinámicas
Implementar las funciones del bot que sugieren acciones:
- `acciones_necesidad()` - Sugerencias según tipo de necesidad
- `acciones_presencia_rival()` - Según nivel de amenaza
- `acciones_rumor()` - Según a quién afecta el rumor
- `acciones_evento()` - Según candidato y aceptación
- Y otras funciones de acciones condicionales

### Fase 3: Optimizar Backend
El backend debe actualizar reportes para guardar todos los nuevos campos y retornarlos en listados.

---

## 📦 Archivos Generados/Modificados

- ✅ [src/screens/Usuarios.jsx](../FRONT/src/screens/Usuarios.jsx) - Agregada capacidad crear usuario
- ✅ [migrations/001_add_all_report_fields.sql](../BACK/migrations/001_add_all_report_fields.sql) - SQL para expandir tabla
- 📝 [src/screens/NuevoReporte.jsx](../FRONT/src/screens/NuevoReporte.jsx) - PENDIENTE: Agregar campos condicionados
- 📝 [Bot integration](../bot_telegram_reportes.py) - REFERENCIA: Lógica condicional completa

---

## 🎯 Estado Actual

✅ **COMPLETADO:**
- Admin puede crear usuarios desde el frontend
- Todos los campos del bot mapeados a la BD
- Build de Vite sin errores

🟡 **EN PROGRESO:**
- Frontend aún tiene solo campos genéricos fijos
- Las acciones dinámicas del bot no se integran aún

---

