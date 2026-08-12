BEGIN;

-- Tipos ENUM
CREATE TYPE role_type AS ENUM ('paciente','psicologo','admin');
CREATE TYPE genero_type AS ENUM ('masculino','femenino','otro','prefiero_no_decir');
CREATE TYPE estado_paciente_type AS ENUM ('activo','inactivo','suspendido');
CREATE TYPE modalidad_type AS ENUM ('presencial','videollamada','telefonica');
CREATE TYPE estado_cita_type AS ENUM ('pendiente','confirmada','completada','cancelada','no_asistio');
CREATE TYPE estado_historia_type AS ENUM ('abierta','cerrada','archivada');
CREATE TYPE resultado_log_type AS ENUM ('exitoso','fallido');

-- Tabla usuarios
CREATE TABLE usuarios (
  id_usuario     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre         VARCHAR(80)    NOT NULL,
  apellido       VARCHAR(80)    NOT NULL,
  email          VARCHAR(150)   NOT NULL UNIQUE,
  password_hash  VARCHAR(255)   NOT NULL,
  rol            role_type      NOT NULL DEFAULT 'paciente',
  activo         BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para updated_at en usuarios
CREATE OR REPLACE FUNCTION set_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION set_timestamp_updated_at();

-- Tabla psicologos
CREATE TABLE psicologos (
  id_psicologo     INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario       INTEGER NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  especialidad     VARCHAR(150) NOT NULL,
  numero_tarjeta   VARCHAR(40)  NOT NULL UNIQUE,
  descripcion_bio  TEXT,
  foto_url         VARCHAR(300),
  duracion_sesion  INTEGER NOT NULL DEFAULT 60,
  precio_sesion    NUMERIC(10,2) NOT NULL DEFAULT 0.00
);

-- Tabla pacientes
CREATE TABLE pacientes (
  id_paciente      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario       INTEGER NOT NULL UNIQUE REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  fecha_nacimiento DATE    NOT NULL,
  genero           genero_type NOT NULL,
  telefono         VARCHAR(20)  NOT NULL,
  direccion        VARCHAR(255),
  ciudad           VARCHAR(100),
  eps              VARCHAR(120),
  estado           estado_paciente_type NOT NULL DEFAULT 'activo'
);

-- Tabla disponibilidad
CREATE TABLE disponibilidad (
  id_disponibilidad INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_psicologo      INTEGER NOT NULL REFERENCES psicologos(id_psicologo) ON DELETE CASCADE ON UPDATE CASCADE,
  dia_semana        SMALLINT NOT NULL,
  hora_inicio       TIME NOT NULL,
  hora_fin          TIME NOT NULL
);

-- Tabla citas
CREATE TABLE citas (
  id_cita        INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_paciente    INTEGER NOT NULL REFERENCES pacientes(id_paciente) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_psicologo   INTEGER NOT NULL REFERENCES psicologos(id_psicologo) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha_hora     TIMESTAMP NOT NULL,
  duracion_min   INTEGER NOT NULL DEFAULT 60,
  modalidad      modalidad_type NOT NULL DEFAULT 'presencial',
  estado         estado_cita_type NOT NULL DEFAULT 'pendiente',
  notas_previas  TEXT,
  link_reunion   VARCHAR(300),
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cita_fecha ON citas (fecha_hora);
CREATE INDEX idx_cita_psicologo_fecha ON citas (id_psicologo, fecha_hora);

-- Tabla historias_clinicas
CREATE TABLE historias_clinicas (
  id_historia      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_paciente      INTEGER NOT NULL UNIQUE REFERENCES pacientes(id_paciente) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_psicologo     INTEGER NOT NULL REFERENCES psicologos(id_psicologo) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha_apertura   DATE NOT NULL DEFAULT CURRENT_DATE,
  motivo_consulta  TEXT NOT NULL,
  antecedentes     TEXT,
  diagnostico_cie  VARCHAR(20),
  diagnostico_desc TEXT,
  estado           estado_historia_type NOT NULL DEFAULT 'abierta'
);

-- Tabla sesiones
CREATE TABLE sesiones (
  id_sesion         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_historia       INTEGER NOT NULL REFERENCES historias_clinicas(id_historia) ON DELETE RESTRICT ON UPDATE CASCADE,
  id_cita           INTEGER NOT NULL UNIQUE REFERENCES citas(id_cita) ON DELETE RESTRICT ON UPDATE CASCADE,
  fecha             DATE NOT NULL,
  evolucion         TEXT NOT NULL,
  plan_tratamiento  TEXT,
  observaciones     TEXT,
  proxima_cita_sugerida DATE,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabla consentimientos
CREATE TABLE consentimientos (
  id_consentimiento INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_paciente       INTEGER NOT NULL REFERENCES pacientes(id_paciente) ON DELETE RESTRICT ON UPDATE CASCADE,
  version           VARCHAR(10) NOT NULL DEFAULT '1.0',
  contenido         TEXT NOT NULL,
  aceptado          BOOLEAN NOT NULL DEFAULT FALSE,
  fecha_firma       TIMESTAMP,
  ip_firma          VARCHAR(45)
);

-- Tabla logs_acceso
CREATE TABLE logs_acceso (
  id_log      INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_usuario  INTEGER NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE ON UPDATE CASCADE,
  ip          VARCHAR(45),
  resultado   resultado_log_type NOT NULL DEFAULT 'exitoso',
  fecha       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_usuario ON logs_acceso (id_usuario);

-- Datos de prueba (mantengo el orden original para que los IDs coincidan)
INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
VALUES ('Admin', 'Sistema', 'admin@mentalpsique.com',
        '$2b$10$examplehashplaceholder000000000000000000000', 'admin');

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

INSERT INTO usuarios (nombre, apellido, email, password_hash, rol)
VALUES ('Carlos', 'Rodríguez', 'carlos.r@email.com',
        '$2b$10$examplehashplaceholder000000000000000000000', 'paciente');

INSERT INTO pacientes (id_usuario, fecha_nacimiento, genero, telefono, eps, ciudad)
VALUES (3, '1995-04-20', 'masculino', '+57 300 000 0000', 'Sura', 'Medellín');

INSERT INTO consentimientos (id_paciente, version, contenido, aceptado)
VALUES ( (SELECT id_paciente FROM pacientes WHERE id_usuario = 3), '1.0', 'Consentimiento inicial', FALSE )
ON CONFLICT DO NOTHING;

COMMIT;
