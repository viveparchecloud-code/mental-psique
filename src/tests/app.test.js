process.env.JWT_SECRET     = 'mentalpsique_jwt_secret_super_seguro_2025';
process.env.JWT_EXPIRES_IN = '8h';
process.env.BCRYPT_ROUNDS  = '10';
process.env.NODE_ENV       = 'test';

const request = require('supertest');
const jwt     = require('jsonwebtoken');

const SECRET     = process.env.JWT_SECRET;
const mkToken    = (id, rol, nombre) =>
  jwt.sign({ id_usuario: id, rol, nombre }, SECRET, { expiresIn: '1h' });

const tokenAdmin    = mkToken(1, 'admin',     'Admin');
const tokenPaciente = mkToken(2, 'paciente',  'Paciente');
const tokenPsicologo = mkToken(3, 'psicologo','Psicologo');

jest.mock('../config/db', () => {
  const bcrypt = require('bcryptjs');
  const HASH   = bcrypt.hashSync('Password123!', 10);
  const usuarios = [
    { id_usuario:1, nombre:'Admin',    apellido:'Test', email:'admin@test.com',    password_hash:HASH, rol:'admin',    activo:1 },
    { id_usuario:2, nombre:'Paciente', apellido:'Test', email:'paciente@test.com', password_hash:HASH, rol:'paciente', activo:1 },
    { id_usuario:3, nombre:'Psico',    apellido:'Test', email:'psico@test.com',    password_hash:HASH, rol:'psicologo',activo:1 },
  ];
  const citas = [{ id_cita:1, id_paciente:1, id_psicologo:1, fecha_hora:'2025-06-01 10:00:00',
    estado:'pendiente', modalidad:'presencial', notas_previas:null,
    nombre_paciente:'Paciente', apellido_paciente:'Test',
    nombre_psicologo:'Psico',   apellido_psicologo:'Test' }];

  const mockExecute = jest.fn((sql, params=[]) => {
    const q = sql.replace(/\s+/g,' ').trim().toUpperCase();
    if (q.includes('FROM USUARIOS WHERE EMAIL')) {
      const u = usuarios.find(x=>x.email===params[0]&&x.activo===1);
      return Promise.resolve([[...(u?[u]:[])]]); }
    if (q.includes('INSERT INTO USUARIOS'))   return Promise.resolve([{insertId:99}]);
    if (q.includes('FROM USUARIOS WHERE ID_USUARIO')) {
      const u = usuarios.find(x=>x.id_usuario===params[0]);
      return Promise.resolve([[...(u?[u]:[])]]); }
    if (q.includes('INSERT INTO LOGS_ACCESO')) return Promise.resolve([{}]);
    if (q.includes('FROM PACIENTES WHERE ID_USUARIO')) return Promise.resolve([[{id_paciente:params[0]}]]);
    if (q.includes('FROM PSICOLOGOS WHERE ID_USUARIO')) return Promise.resolve([[{id_psicologo:1}]]);
    if (q.includes('FROM PSICOLOGOS PS')||q.includes('FROM PSICOLOGOS P')) {
      return Promise.resolve([[{id_psicologo:1,nombre:'Psico',apellido:'Test',especialidad:'Clinica',duracion_sesion:60,precio_sesion:100000}]]); }
    if (q.includes('FROM DISPONIBILIDAD')) return Promise.resolve([[{dia_semana:0,hora_inicio:'08:00',hora_fin:'12:00'}]]);
    if (q.includes('SELECT ID_CITA FROM CITAS'))  return Promise.resolve([[]]);
    if (q.includes('INSERT INTO CITAS'))          return Promise.resolve([{insertId:42}]);
    if (q.includes('UPDATE CITAS SET ESTADO'))    return Promise.resolve([{affectedRows:1}]);
    if (q.includes('FROM CITAS C')||(q.includes('FROM CITAS')&&q.includes('JOIN'))) return Promise.resolve([citas]);
    if (q.includes('FROM CITAS')&&q.includes('WHERE C.ID_CITA')) {
      const c=citas.find(x=>x.id_cita===parseInt(params[0]));
      return Promise.resolve([[...(c?[c]:[])]]); }
    if (q.includes('SELECT ID_HISTORIA FROM HISTORIAS')) return Promise.resolve([[]]);
    if (q.includes('INSERT INTO HISTORIAS_CLINICAS'))    return Promise.resolve([{insertId:5}]);
    if (q.includes('FROM HISTORIAS_CLINICAS')) {
      return Promise.resolve([[{id_historia:5,id_paciente:parseInt(params[0])||1,
        motivo_consulta:'Ansiedad',estado:'abierta',
        nombre_paciente:'Paciente',apellido_paciente:'Test',
        nombre_psicologo:'Psico',  apellido_psicologo:'Test'}]]); }
    if (q.includes('SELECT ID_CONSENTIMIENTO FROM CONSENTIMIENTOS')) return Promise.resolve([[]]);
    if (q.includes('FROM CONSENTIMIENTOS'))       return Promise.resolve([[{aceptado:false}]]);
    if (q.includes('INSERT INTO CONSENTIMIENTOS'))return Promise.resolve([{insertId:1}]);
    return Promise.resolve([[]]);
  });
  return { pool:{ execute:mockExecute }, testConnection:jest.fn() };
});

const app = require('../app');

describe('1. Auth — Login', () => {
  test('T01 login admin exitoso → 200 + token', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email:'admin@test.com', password:'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.rol).toBe('admin');
  });
  test('T02 login paciente → 200 + token', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email:'paciente@test.com', password:'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
  test('T03 login psicólogo → 200 + token', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email:'psico@test.com', password:'Password123!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
  test('T04 credenciales incorrectas → 401', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email:'admin@test.com', password:'wrongpass' });
    expect(res.status).toBe(401);
  });
  test('T05 email inválido → 422', async () => {
    const res = await request(app).post('/api/v1/auth/login')
      .send({ email:'noesEmail', password:'123' });
    expect(res.status).toBe(422);
  });
});

describe('2. Auth — Perfil y registro', () => {
  test('T06 GET /perfil sin token → 401', async () => {
    const res = await request(app).get('/api/v1/auth/perfil');
    expect(res.status).toBe(401);
  });
  test('T07 GET /perfil con token válido → 200', async () => {
    const res = await request(app).get('/api/v1/auth/perfil')
      .set('Authorization',`Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });
  test('T08 registro nuevo usuario → 201', async () => {
    const res = await request(app).post('/api/v1/auth/registro')
      .send({ nombre:'Nuevo', apellido:'Usuario', email:'nuevo@test.com', password:'Password123!' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id_usuario');
  });
});

describe('3. Citas — CRUD', () => {
  test('T09 listar citas con token → 200 array', async () => {
    const res = await request(app).get('/api/v1/citas')
      .set('Authorization',`Bearer ${tokenPaciente}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('T10 crear cita como paciente → 201', async () => {
    const res = await request(app).post('/api/v1/citas')
      .set('Authorization',`Bearer ${tokenPaciente}`)
      .send({ id_paciente:1, id_psicologo:1, fecha_hora:'2025-12-01T10:00:00' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id_cita');
  });
  test('T11 obtener cita por ID → 200', async () => {
    const res = await request(app).get('/api/v1/citas/1')
      .set('Authorization',`Bearer ${tokenAdmin}`);
    expect(res.status).toBe(200);
  });
  test('T12 cancelar cita → 200', async () => {
    const res = await request(app).patch('/api/v1/citas/1/cancelar')
      .set('Authorization',`Bearer ${tokenPaciente}`);
    expect(res.status).toBe(200);
  });
});

describe('4. Seguridad — Control de acceso', () => {
  test('T13 ruta protegida sin token → 401', async () => {
    const res = await request(app).get('/api/v1/citas');
    expect(res.status).toBe(401);
  });
  test('T14 paciente cambia estado (solo psicólogo/admin) → 403', async () => {
    const res = await request(app).patch('/api/v1/citas/1/estado')
      .set('Authorization',`Bearer ${tokenPaciente}`)
      .send({ estado:'completada' });
    expect(res.status).toBe(403);
  });
});

describe('5. Historias clínicas y psicólogos', () => {
  test('T15 psicólogo obtiene historia clínica → 200', async () => {
    const res = await request(app).get('/api/v1/historias/1')
      .set('Authorization',`Bearer ${tokenPsicologo}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id_historia');
  });
  test('T16 listar psicólogos (endpoint público) → 200 array', async () => {
    const res = await request(app).get('/api/v1/psicologos');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
