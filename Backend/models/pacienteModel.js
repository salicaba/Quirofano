const pool = require('../config/db');

const Paciente = {
  async insertPacienteConExpediente(nombre, apellido, sexo, fecha_nacimiento, tipo_sangre, numero_expediente, procedencia) {
    const queryPaciente = `
      INSERT INTO pacientes (nombre, apellido, sexo, fecha_nacimiento, tipo_sangre) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id_paciente
    `;
    const resultPaciente = await pool.query(queryPaciente, [
      nombre, apellido, sexo, fecha_nacimiento, tipo_sangre
    ]);
    
    const paciente_id = resultPaciente.rows[0].id_paciente;

    const queryExpediente = `
      INSERT INTO expedientes (id_paciente, numero_expediente, procedencia) 
      VALUES ($1, $2, $3)
    `;
    await pool.query(queryExpediente, [paciente_id, numero_expediente, procedencia]);

    return { paciente_id: paciente_id };
  },

  async findPacientes() {
    const query = `
      SELECT 
        pa.id_paciente,
        pa.nombre,
        pa.apellido,
        e.id_expediente,
        e.numero_expediente
      FROM pacientes pa 
      INNER JOIN expedientes e ON pa.id_paciente = e.id_paciente
      WHERE pa.activo = true
      ORDER BY pa.nombre, pa.apellido;
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  async updatePaciente(id_paciente, datos) {
    const queryPaciente = `
      UPDATE pacientes 
      SET nombre = $1, apellido = $2, sexo = $3, fecha_nacimiento = $4, tipo_sangre = $5
      WHERE id_paciente = $6
    `;
    await pool.query(queryPaciente, [
      datos.nombre, datos.apellido, datos.sexo, datos.fecha_nacimiento, datos.tipo_sangre, id_paciente
    ]);

    const queryExpediente = `
      UPDATE expedientes 
      SET numero_expediente = $1, procedencia = $2
      WHERE id_paciente = $3
    `;
    await pool.query(queryExpediente, [
      datos.numero_expediente, datos.procedencia, id_paciente
    ]);

    return { success: true };
  },

  async deletePaciente(id_paciente) {
    await pool.query('DELETE FROM expedientes WHERE id_paciente = $1', [id_paciente]);
    const result = await pool.query('DELETE FROM pacientes WHERE id_paciente = $1', [id_paciente]);
    return { deleted: result.rowCount > 0 };
  }

  
};

module.exports = Paciente;