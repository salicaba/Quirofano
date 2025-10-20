const pool = require('../config/db');

const EquipoMedico = {

  async create(equipoData) {
    const { nombre, id_medico } = equipoData;
    const query = `
      INSERT INTO equipo_medico (nombre, id_medico) 
      VALUES ($1, $2) 
      RETURNING *
    `;
    try {
      const { rows } = await pool.query(query, [nombre, id_medico]);
      return rows[0];
    } catch (error) {
      console.error('Error al crear equipo médico en el modelo:', error);
      throw error;
    }
  },


  async findByName(nombre) {
    const query = `
      SELECT 
        eq.id_equipomedico, 
        eq.nombre AS nombre_equipo, 
        mu.id_medicos,     
        mu.nombre AS medico_nombre, 
        mu.apellido_paterno, 
        e.descripcion AS especialidad 
      FROM equipo_medico eq
      LEFT JOIN medicos_usuarios mu ON eq.id_medico = mu.id_medicos
      LEFT JOIN especialidades e ON mu.id_especialidad = e.id_especialidad
      WHERE eq.nombre = $1
    `;
    try {
      const { rows } = await pool.query(query, [nombre]);
      return rows;
    } catch (error) {
      console.error('Error al buscar equipo por nombre:', error);
      throw error;
    }
  },


  async findAllTeamNames() {
    const query = 'SELECT DISTINCT nombre FROM equipo_medico ORDER BY nombre';
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error al obtener nombres de equipos:', error);
      throw error;
    }
  },

async findAllEntries() {
    // ESTA ES LA CONSULTA CORREGIDA
    const query = `
      SELECT DISTINCT ON (nombre) 
        id_equipomedico, 
        nombre
      FROM 
        equipo_medico 
      ORDER BY 
        nombre, id_equipomedico;
    `;
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error al obtener todas las entradas de equipo:', error);
      throw error;
    }
  },


  async update(id, equipoData) {
    const { id_medico } = equipoData;
    const query = `
      UPDATE equipo_medico 
      SET id_medico = $1 
      WHERE id_equipomedico = $2
      RETURNING *
    `;
    try {
      const { rows } = await pool.query(query, [id_medico, id]);
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar equipo médico en el modelo:', error);
      throw error;
    }
  },

  
  async removeByName(nombre) {
    const query = 'DELETE FROM equipo_medico WHERE nombre = $1';
    try {
      const result = await pool.query(query, [nombre]);
      return result.rowCount; 
    } catch (error) {
      console.error('Error al eliminar equipo por nombre:', error);
      throw error;
    }
  },


  async removeMemberById(id) {
    const query = 'DELETE FROM equipo_medico WHERE id_equipomedico = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount; 
    } catch (error) {
      console.error('Error al eliminar miembro por ID en el modelo:', error);
      throw error;
    }
  }

};


module.exports = EquipoMedico;