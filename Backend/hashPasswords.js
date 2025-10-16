const pool = require('./config/db');
const bcrypt = require('bcryptjs');

// ▼▼▼ EDITA ESTA LISTA CON TUS USUARIOS Y LAS CONTRASEÑAS QUE QUIERAS ASIGNAR ▼▼▼
const usuariosAActualizar = [
  { cedula: '123456789', passwordPlano: 'PasswordParaErick123' },
];
// ▲▲▲ FIN DE LA ZONA DE EDICIÓN ▲▲▲


const hashearYActualizar = async () => {
  console.log('Iniciando el proceso de hasheo de contraseñas...');

  try {
    for (const usuario of usuariosAActualizar) {
      console.log(`Procesando usuario con cédula: ${usuario.cedula}...`);

      // 1. Generar el hash de la contraseña
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(usuario.passwordPlano, salt);

      // 2. Actualizar la base de datos con el hash
      const query = 'UPDATE medicos_usuarios SET password = $1 WHERE cedula_profecional = $2 ';
      await pool.query(query, [passwordHash, usuario.cedula]);

      console.log(`✅ Contraseña para ${usuario.cedula} actualizada exitosamente.`);
    }
    console.log('\nProceso completado.');

  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  } finally {
    // Cierra la conexión a la base de datos
    pool.end();
  }
};

hashearYActualizar();