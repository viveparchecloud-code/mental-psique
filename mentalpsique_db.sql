-- ============================================================
--  MentalPsique — Script de creación de base de datos
--  Motor: MySQL 8.0+
--  Codificación: UTF-8
-- ============================================================

CREATE DATABASE IF NOT EXISTS mentalpsique
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE mentalpsique;

-- ------------------------------------------------------------
-- 1. USUARIOS  (tabla base de autenticación)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id_usuario     INT            NOT NULL AUTO_INCREMENT,
  nombre         VARCHAR(80)    NOT NULL,
  apellido       VARCHAR(80)    NOT NULL,
  email          VARCHAR(150)   NOT NULL UNIQUE,
  password_hash  VARCHAR(255)   NOT NULL,
  rol            ENUM('paciente','psicologo','admin') NOT NULL DEFAULT 'paciente',
  activo         TINYINT(1)     NOT NULL DEFAULT 1,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- 2. PACIENTES  (perfil extendido del paciente)
-- ------------------------------------------------------------
CREATE TABLE pacientes (
  id_paciente      INT          NOT NULL AUTO_INCREMENT,
  id_usuario       INT          NOT NULL UNIQUE,
  fecha_nacimiento DATE         NOT NULL,
  genero           ENUM('masculino','femenino','otro','prefiero_no_decir') NOT NULL,
  telefono         VARCHAR(20)  NOT NULL,
  direccion        VARCHAR(255) NULL,
  ciudad           VARCHAR(100) NULL,
  eps              VARCHAR(120) NULL,
  estado           ENUM('activo','inactivo','suspendido') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (id_paciente),
  CONSTRAINT fk_paciente_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- 3. PSICOLOGOS  (perfil extendido del psicólogo)
-- ------------------------------------------------------------
CREATE TABLE psicologos (
  id_psicologo     INT          NOT NULL AUTO_INCREMENT,
  id_usuario       INT          NOT NULL UNIQUE,
  especialidad     VARCHAR(150) NOT NULL,
  numero_tarjeta   VARCHAR(40)  NOT NULL UNIQUE,   -- tarjeta profesional
  descripcion_bio  TEXT         NULL,
  foto_url         VARCHAR(300) NULL,
  duracion_sesion  INT          NOT NULL DEFAULT 60, -- minutos
  precio_sesion    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id_psicologo),
  CONSTRAINT fk_psicologo_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- 4. DISPONIBILIDAD  (horarios semanales del psicólogo)
-- ------------------------------------------------------------
CREATE TABLE disponibilidad (
  id_disponibilidad INT         NOT NULL AUTO_INCREMENT,
  id_psicologo      INT         NOT NULL,
  dia_semana        TINYINT     NOT NULL,  -- 0=Lunes … 6=Domingo
  hora_inicio       TIME        NOT NULL,
  hora_fin          TIME        NOT NULL,
  PRIMARY KEY (id_disponibilidad),
  CONSTRAINT fk_disp_psicologo
    FOREIGN KEY (id_psicologo) REFERENCES psicologos(id_psicologo)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- 5. CITAS
-- ------------------------------------------------------------
CREATE TABLE citas (
  id_cita        INT          NOT NULL AUTO_INCREMENT,
  id_paciente    INT          NOT NULL,
  id_psicologo   INT          NOT NULL,
  fecha_hora     DATETIME     NOT NULL,
  duracion_min   INT          NOT NULL DEFAULT 60,
  modalidad      ENUM('presencial','videollamada','telefonica') NOT NULL DEFAULT 'presencial',
  estado         ENUM('pendiente','confirmada','completada','cancelada','no_asistio')
                              NOT NULL DEFAULT 'pendiente',
  notas_previas  TEXT         NULL,
  link_reunion   VARCHAR(300) NULL,   -- para videollamadas
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_cita),
  CONSTRAINT fk_cita_paciente
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_cita_psicologo
    FOREIGN KEY (id_psicologo) REFERENCES psicologos(id_psicologo)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_cita_fecha (fecha_hora),
  INDEX idx_cita_psicologo_fecha (id_psicologo, fecha_hora)
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- 6. HISTORIAS_CLINICAS
-- ------------------------------------------------------------
CREATE TABLE historias_clinicas (
  id_historia      INT   NOT NULL AUTO_INCREMENT,
  id_paciente      INT   NOT NULL UNIQUE,   -- 1 historia por paciente
  id_psicologo     INT   NOT NULL,          -- psicólogo que la abre
  fecha_apertura   DATE  NOT NULL DEFAULT (CURRENT_DATE),
  motivo_consulta  TEXT  NOT NULL,
  antecedentes     TEXT  NULL,
  diagnostico_cie  VARCHAR(20) NULL,        -- código CIE-10
  diagnostico_desc TEXT  NULL,
  estado           ENUM('abierta','cerrada','archivada') NOT NULL DEFAULT 'abierta',
  PRIMARY KEY (id_historia),
  CONSTRAINT fk_historia_paciente
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_historia_psicologo
    FOREIGN KEY (id_psicologo) REFERENCES psicologos(id_psicologo)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- 7. SESIONES  (notas de evolución por cita)
-- ------------------------------------------------------------
CREATE TABLE sesiones (
  id_sesion         INT       NOT NULL AUTO_INCREMENT,
  id_historia       INT       NOT NULL,
  id_cita           INT       NOT NULL UNIQUE,  -- 1 sesión por cita
  fecha             DATE      NOT NULL,
  evolucion         TEXT      NOT NULL,
  plan_tratamiento  TEXT      NULL,
  observaciones     TEXT      NULL,
  proxima_cita_sugerida DATE  NULL,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_sesion),
  CONSTRAINT fk_sesion_historia
    FOREIGN KEY (id_historia) REFERENCES historias_clinicas(id_historia)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sesion_cita
    FOREIGN KEY (id_cita) REFERENCES citas(id_cita)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ------------------------------------------------------------
-- 8. CONSENTIMIENTOS_INFORMADOS
-- ------------------------------------------------------------
CREATE TABLE consentimientos (
  id_consentimiento INT          NOT NULL AUTO_INCREMENT,
  id_paciente       INT          NOT NULL,
  version           VARCHAR(10)  NOT NULL DEFAULT '1.0',
  contenido         TEXT         NOT NULL,
  aceptado          TINYINT(1)   NOT NULL DEFAULT 0,
  fecha_firma       TIMESTAMP    NULL,
  ip_firma          VARCHAR(45)  NULL,   -- IPv4 o IPv6
  PRIMARY KEY (id_consentimiento),
  CONSTRAINT fk_consent_paciente
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;


-- ============================================================
--  DATOS DE PRUEBA  (para desarrollo)
-- ============================================================

-- Admin
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
VALUES ('Admin', 'Sistema', 'admin@mentalpsique.com',
        '$2b$10$examplehashplaceholder000000000000000000000', 'admin');

-- Psicólogo de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
VALUES ('Laura', 'Gómez', 'laura.gomez@mentalpsique.com',
        '$2b$10$examplehashplaceholder000000000000000000000', 'psicologo');

INSERT INTO psicologos (id_usuario, especialidad, numero_tarjeta, duracion_sesion, precio_sesion)
VALUES (2, 'Psicología clínica y cognitivo-conductual', 'PSI-COL-12345', 60, 120000.00);

INSERT INTO disponibilidad (id_psicologo, dia_semana, hora_inicio, hora_fin) VALUES
(1, 0, '08:00', '12:00'),
(1, 0, '14:00', '18:00'),
(1, 2, '08:00', '12:00'),
(1, 4, '08:00', '17:00');

-- Paciente de prueba
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
VALUES ('Carlos', 'Rodríguez', 'carlos.r@email.com',
        '$2b$10$examplehashplaceholder000000000000000000000', 'paciente');

INSERT INTO pacientes (id_usuario, fecha_nacimiento, genero, telefono, eps, ciudad)
VALUES (3, '1995-04-20', 'masculino', '+57 300 000 0000', 'Sura', 'Medellín');

-- ------------------------------------------------------------
-- 9. LOGS_ACCESO  (auditoría de autenticación)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS logs_acceso (
  id_log      INT         NOT NULL AUTO_INCREMENT,
  id_usuario  INT         NOT NULL,
  ip          VARCHAR(45) NULL,
  resultado   ENUM('exitoso','fallido') NOT NULL DEFAULT 'exitoso',
  fecha       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_log),
  INDEX idx_log_usuario (id_usuario),
  CONSTRAINT fk_log_usuario
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
