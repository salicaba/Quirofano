const pool = require('../config/db');

const Horarios = {
  async create(horarioData) {
    const { id_cirugia, hora_inicio, hora_fin, hora_recuperacion, hora_egreso } = horarioData;
    
    const query = `
      INSERT INTO horarios (id_cirugia, hora_inicio, hora_fin, hora_recuperacion, hora_egreso)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [id_cirugia, hora_inicio, hora_fin, hora_recuperacion, hora_egreso];

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error al crear horario:', error);
      throw error;
    }
  }
};

module.exports = Horarios;