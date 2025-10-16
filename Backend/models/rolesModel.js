const pool = require('../config/db');

const Rol = {

  async getAll() {
    const query = 'SELECT *FROM roles ORDER BY id_rol'; 
    try {
      const {rows} = await pool.query(query);
      return rows;
     
    } catch (error) {
      console.error('Error al obtener los roles:', error);
      throw error;
    }
    
  }

};

module.exports = Rol;