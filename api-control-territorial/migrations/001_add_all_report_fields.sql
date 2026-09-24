-- Agregar todos los campos faltantes a la tabla reportes para que coincida con el bot de Telegram

ALTER TABLE reportes ADD COLUMN tipo_registro VARCHAR(30) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN nombre_persona VARCHAR(150) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN contacto VARCHAR(100) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN foto_base64 LONGTEXT DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN foto_nombre VARCHAR(255) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN foto_mime VARCHAR(100) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN tamano VARCHAR(30) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN latitud DECIMAL(10,7) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN longitud DECIMAL(10,7) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN whatsapp VARCHAR(50) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN correo VARCHAR(150) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN lugar_votacion VARCHAR(255);
ALTER TABLE reportes ADD COLUMN telefono VARCHAR(20);
ALTER TABLE reportes ADD COLUMN distrito VARCHAR(100);
ALTER TABLE reportes ADD COLUMN nombre_contacto VARCHAR(100);
ALTER TABLE reportes ADD COLUMN personas_votan INT;
ALTER TABLE reportes ADD COLUMN tipo_necesidad VARCHAR(100);
ALTER TABLE reportes ADD COLUMN cuantos_brigadistas INT;
ALTER TABLE reportes ADD COLUMN responsable_brigada VARCHAR(100);
ALTER TABLE reportes ADD COLUMN tipo_evento VARCHAR(100);
ALTER TABLE reportes ADD COLUMN candidato_evento VARCHAR(100);
ALTER TABLE reportes ADD COLUMN num_asistentes INT;
ALTER TABLE reportes ADD COLUMN aceptacion_evento VARCHAR(50);
ALTER TABLE reportes ADD COLUMN tipo_presencia_rival VARCHAR(100);
ALTER TABLE reportes ADD COLUMN nivel_amenaza VARCHAR(50);
ALTER TABLE reportes ADD COLUMN tipo_rumor VARCHAR(100);
ALTER TABLE reportes ADD COLUMN sobre_quien_rumor VARCHAR(100);
ALTER TABLE reportes ADD COLUMN necesidad_movilizacion VARCHAR(100);
ALTER TABLE reportes ADD COLUMN edad_rango VARCHAR(20);
ALTER TABLE reportes ADD COLUMN genero_indeciso VARCHAR(20);
ALTER TABLE reportes ADD COLUMN ocupacion_indeciso VARCHAR(100);
ALTER TABLE reportes ADD COLUMN factor_duda VARCHAR(100);
ALTER TABLE reportes ADD COLUMN accion_sugerida VARCHAR(500);
ALTER TABLE reportes ADD COLUMN perfil_votante VARCHAR(100);
ALTER TABLE reportes ADD COLUMN fuente VARCHAR(50) DEFAULT 'Web';
ALTER TABLE reportes ADD COLUMN procesado VARCHAR(20) DEFAULT 'No';

-- Crear índices útiles (solo en columnas que existen)
ALTER TABLE reportes ADD INDEX idx_tipo_necesidad (tipo_necesidad);
ALTER TABLE reportes ADD INDEX idx_tipo_evento (tipo_evento);
ALTER TABLE reportes ADD INDEX idx_tipo_rumor (tipo_rumor);
ALTER TABLE reportes ADD INDEX idx_accion_sugerida (accion_sugerida);

-- Eliminar columna gps de texto y asegurarse de que latitud/longitud existan en reportes
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS latitud DECIMAL(10,7) DEFAULT NULL;
ALTER TABLE reportes ADD COLUMN IF NOT EXISTS longitud DECIMAL(10,7) DEFAULT NULL;
ALTER TABLE reportes DROP COLUMN IF EXISTS gps;

-- Agregar partido a la tabla candidatos
ALTER TABLE candidatos ADD COLUMN partido VARCHAR(100) DEFAULT NULL AFTER nombre;

-- Reemplazar ubicacion_gps por latitud y longitud en encuestas_candidato
ALTER TABLE encuestas_candidato ADD COLUMN latitud DECIMAL(10,7) DEFAULT NULL AFTER candidato_id;
ALTER TABLE encuestas_candidato ADD COLUMN longitud DECIMAL(10,7) DEFAULT NULL AFTER latitud;
ALTER TABLE encuestas_candidato DROP COLUMN ubicacion_gps;

-- Insertar candidatos reales (borra los anteriores primero si ya existían datos de prueba)
DELETE FROM encuestas_candidato;
DELETE FROM candidatos;
INSERT INTO candidatos (nombre, partido, activo) VALUES
('Isaac Avellán', 'Unidad Popular 2', 1),
('Fressia Villacreses', 'CREO 21', 1),
('Leonel Muñoz', 'ADN 7', 1),
('María José Fernández', 'Caminantes 62', 1),
('Héctor Párraga', 'Avanza 8', 1),
('Mauricio Navia', 'Gente Nueva 97', 1),
('Juan José Peña', 'Amigo 16', 1),
('Dennys Guillén', 'EXUD 120', 1);
