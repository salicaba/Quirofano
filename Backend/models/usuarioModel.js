const pool = require('../config/db');

const Usuario = {
  async findByCedula(cedula){
    const query = 'SELECT mu.*, r.descripcion AS rol_nombre FROM medicos_usuarios mu JOIN roles r ON mu.id_rol = r.id_rol WHERE mu.cedula_profecional = $1';
    try {
      const { rows } = await pool.query(query, [cedula]);
      return rows[0];
    } catch (error) {
      console.error('Error al buscar por cédula:', error);
      throw error;
    }
  },

    async findById(id_medicos) {
    const query = `
      SELECT 
        mu.id_medicos, 
        mu.nombre, 
        mu.apellido_paterno,
        mu.apellido_materno,
        mu.cedula_profecional,
        mu.foto_perfil, 
        r.descripcion AS roles, 
        e.descripcion AS especialidades
      FROM 
        medicos_usuarios mu
      LEFT JOIN roles r ON mu.id_rol = r.id_rol
      LEFT JOIN especialidades e ON mu.id_especialidad = e.id_especialidad
      WHERE mu.id_medicos = $1
    `;
    try {
      const { rows } = await pool.query(query, [id_medicos]);
      return rows[0];
    } catch (error) {
      console.error('Error al buscar por ID:', error);
      throw error;
    }
  },

  async updateFotoPerfil(id_medicos, fotoPath) {
    const query = 'UPDATE medicos_usuarios SET foto_perfil = $1 WHERE id_medicos = $2';
    try {
        await pool.query(query, [fotoPath, id_medicos]);
    } catch (error) {
        console.error('Error al actualizar foto de perfil:', error);
        throw error;
    }
}
};





module.exports = Usuario;