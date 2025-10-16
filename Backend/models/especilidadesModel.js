const pool = require('../config/db');

const Especialidad = {
  async getAll() {
    const query = 'SELECT * FROM especialidades ORDER BY id_especialidad';
    try {
      const { rows } = await pool.query(query);
      
      return rows;
    } catch (error) {
      console.error('Error en el modelo de especialidades:', error);
      throw error;
    }
  }
};

module.exports = Especialidad;

