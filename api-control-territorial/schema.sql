-- Esquema MySQL para proyecto CEPEID
-- Usar en tu base de datos de GoDaddy.

CREATE TABLE `usuarios` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(100) NOT NULL COLLATE 'latin1_swedish_ci',
	`telefono` VARCHAR(20) NOT NULL COLLATE 'latin1_swedish_ci',
	`usuario` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`pin_hash` VARCHAR(255) NOT NULL COLLATE 'latin1_swedish_ci',
	`rol` ENUM('admin','coordinador','brigadista','observador') NOT NULL DEFAULT 'brigadista' COLLATE 'latin1_swedish_ci',
	`activo` TINYINT(1) NOT NULL DEFAULT '1',
	`creado_at` TIMESTAMP NULL DEFAULT current_timestamp(),
	`actualizado_at` TIMESTAMP NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `telefono` (`telefono`) USING BTREE,
	UNIQUE INDEX `usuario` (`usuario`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=2
;


CREATE TABLE `reportes` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`usuario_id` INT(11) NOT NULL,
	`parroquia` VARCHAR(80) NOT NULL COLLATE 'latin1_swedish_ci',
	`sector` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`tipo_reporte` VARCHAR(80) NOT NULL COLLATE 'latin1_swedish_ci',
	`descripcion` TEXT NOT NULL COLLATE 'latin1_swedish_ci',
	`tipo_registro` VARCHAR(30) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`nombre_persona` VARCHAR(150) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`contacto` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`foto_base64` LONGTEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`foto_nombre` VARCHAR(255) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`foto_mime` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`tamano` VARCHAR(30) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`latitud` DECIMAL(10,7) NULL DEFAULT NULL,
	`longitud` DECIMAL(10,7) NULL DEFAULT NULL,
	`whatsapp` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`correo` VARCHAR(150) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`prioridad` ENUM('Baja','Media','Alta','Critica') NULL DEFAULT 'Media' COLLATE 'latin1_swedish_ci',
	`estado` ENUM('Pendiente','En proceso','Resuelto') NULL DEFAULT 'Pendiente' COLLATE 'latin1_swedish_ci',
	`latitud` DECIMAL(10,7) NULL DEFAULT NULL,
	`longitud` DECIMAL(10,7) NULL DEFAULT NULL,
	`creado_at` TIMESTAMP NULL DEFAULT current_timestamp(),
	`lugar_votacion` VARCHAR(255) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`telefono` VARCHAR(20) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`distrito` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`nombre_contacto` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`personas_votan` INT(11) NULL DEFAULT NULL,
	`tipo_necesidad` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`cuantos_brigadistas` INT(11) NULL DEFAULT NULL,
	`responsable_brigada` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`tipo_evento` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`candidato_evento` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`num_asistentes` INT(11) NULL DEFAULT NULL,
	`aceptacion_evento` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`tipo_presencia_rival` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`nivel_amenaza` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`tipo_rumor` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`sobre_quien_rumor` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`necesidad_movilizacion` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`edad_rango` VARCHAR(20) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`genero_indeciso` VARCHAR(20) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`ocupacion_indeciso` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`factor_duda` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`accion_sugerida` VARCHAR(500) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`perfil_votante` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`fuente` VARCHAR(50) NULL DEFAULT 'Web' COLLATE 'latin1_swedish_ci',
	`procesado` VARCHAR(20) NULL DEFAULT 'No' COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `usuario_id` (`usuario_id`) USING BTREE,
	INDEX `idx_tipo_necesidad` (`tipo_necesidad`) USING BTREE,
	INDEX `idx_tipo_evento` (`tipo_evento`) USING BTREE,
	INDEX `idx_tipo_rumor` (`tipo_rumor`) USING BTREE,
	INDEX `idx_accion_sugerida` (`accion_sugerida`) USING BTREE,
	CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=4
;


CREATE TABLE `sesiones` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`usuario_id` INT(11) NOT NULL,
	`token` VARCHAR(255) NOT NULL COLLATE 'latin1_swedish_ci',
	`remember_me` TINYINT(1) NOT NULL DEFAULT '0',
	`expiracion` DATETIME NOT NULL,
	`creado_at` TIMESTAMP NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	UNIQUE INDEX `token` (`token`) USING BTREE,
	INDEX `usuario_id` (`usuario_id`) USING BTREE,
	CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=12
;

CREATE TABLE `candidatos` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`nombre` VARCHAR(150) NOT NULL COLLATE 'latin1_swedish_ci',
	`partido` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`activo` TINYINT(1) NOT NULL DEFAULT '1',
	`creado_at` TIMESTAMP NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1
;

CREATE TABLE `encuestas_candidato` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`usuario_id` INT(11) NOT NULL,
	`parroquia` VARCHAR(100) NOT NULL COLLATE 'latin1_swedish_ci',
	`edad` INT(11) NOT NULL,
	`genero` VARCHAR(40) NOT NULL COLLATE 'latin1_swedish_ci',
	`candidato_id` INT(11) NOT NULL,
	`latitud` DECIMAL(10,7) NULL DEFAULT NULL,
	`longitud` DECIMAL(10,7) NULL DEFAULT NULL,
	`observacion` TEXT NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`creado_at` TIMESTAMP NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `usuario_id` (`usuario_id`) USING BTREE,
	INDEX `candidato_id` (`candidato_id`) USING BTREE,
	CONSTRAINT `encuestas_candidato_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT,
	CONSTRAINT `encuestas_candidato_ibfk_2` FOREIGN KEY (`candidato_id`) REFERENCES `candidatos` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1
;

CREATE TABLE `propagandas` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`usuario_id` INT(11) NOT NULL,
	`parroquia` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`nombre` VARCHAR(150) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`contacto` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`foto_url` VARCHAR(255) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`tamano` VARCHAR(20) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`gps` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`creado_at` TIMESTAMP NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `usuario_id` (`usuario_id`) USING BTREE,
	CONSTRAINT `propagandas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1
;

CREATE TABLE `lideres` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`usuario_id` INT(11) NOT NULL,
	`parroquia` VARCHAR(100) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`nombre` VARCHAR(150) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`whatsapp` VARCHAR(50) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`correo` VARCHAR(150) NULL DEFAULT NULL COLLATE 'latin1_swedish_ci',
	`creado_at` TIMESTAMP NULL DEFAULT current_timestamp(),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `usuario_id` (`usuario_id`) USING BTREE,
	CONSTRAINT `lideres_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON UPDATE RESTRICT ON DELETE RESTRICT
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=1
;

INSERT INTO candidatos (nombre, partido, activo) VALUES
('Isaac Avellán', 'Unidad Popular 2', 1),
('Fressia Villacreses', 'CREO 21', 1),
('Leonel Muñoz', 'ADN 7', 1),
('María José Fernández', 'Caminantes 62', 1),
('Héctor Párraga', 'Avanza 8', 1),
('Mauricio Navia', 'Gente Nueva 97', 1),
('Juan José Peña', 'Amigo 16', 1),
('Dennys Guillén', 'EXUD 120', 1);

-- Ejemplo de inserción para cargar candidatos desde la base:
-- INSERT INTO candidatos (nombre, activo) VALUES
-- ('Dennys Guillén', 1),
-- ('Candidato rival 1', 1),
-- ('Candidato rival 2', 1),
-- ('Otro', 1);

-- ──────────────────────────────────────────────────────────
-- Usuario administrador inicial
-- PIN por defecto: 1234  (cámbialo desde la app después)
-- Genera el hash con: node -e "const b=require('bcryptjs');console.log(b.hashSync('1234',10))"
-- O usa directamente este hash pre-generado para PIN 1234:
-- ──────────────────────────────────────────────────────────
INSERT INTO usuarios (nombre, telefono, usuario, pin_hash, rol)
VALUES (
  'Administrador',
  '0999999999',
  'admin',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin'
);
