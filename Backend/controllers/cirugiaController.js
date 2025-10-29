const { query } = require('../config/db');
const { Pool } = require('pg');

// Configuración de pool (ajusta según tu configuración)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hospital_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

const cirugiaController = {
  
  // --- FUNCIÓN GET ALL ---
  getCirugias: async (req, res) => {
    try {
      console.log('📋 Obteniendo todas las cirugías...');
      
      const consulta_sql = `
        SELECT 
          c.id_cirugia, c.id_expediente, c.fecha, c.diagnostico_pre,
          c.diagnostico_post, c.procedimiento, c.resultado, c.id_quirofano,
          c.id_equipomedico, c.creado_en, c.actualizado_en, c.estado,
          c.creado_por, c.hora_inicio, c.hora_fin, c.duracion,
          c.nombre_paciente, c.especialista, c.urgencia,
          q.sala as quirofano_sala, 
          p.nombre as paciente_nombre, p.apellido as paciente_apellido,
          ex.numero_expediente, eq.nombre as equipo_nombre
        FROM cirugias c
        LEFT JOIN quirofanos q ON c.id_quirofano = q.id_quirofano
        LEFT JOIN expedientes ex ON c.id_expediente = ex.id_expediente
        LEFT JOIN pacientes p ON ex.id_paciente = p.id_paciente
        LEFT JOIN equipo_medico eq ON c.id_equipomedico = eq.id_equipomedico
        ORDER BY c.fecha DESC, c.creado_en DESC
      `;
      
      const result = await pool.query(consulta_sql);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('❌ Error al obtener cirugías:', error);
      res.status(500).json({
        success: false,
        message: error.message,
        data: [] 
      });
    }
  },

  // --- FUNCIÓN GET PENDIENTES ---
  getCirugiasPendientes: async (req, res) => {
    try {
      console.log('📋 Obteniendo cirugías pendientes...');
      
      const consulta_sql = `
        SELECT 
          c.id_cirugia, c.id_expediente, c.fecha, c.diagnostico_pre,
          c.procedimiento, c.estado, c.id_quirofano, c.nombre_paciente,
          c.especialista, c.urgencia, c.hora_inicio, c.hora_fin,
          q.sala as quirofano
        FROM cirugias c
        LEFT JOIN quirofanos q ON c.id_quirofano = q.id_quirofano
        WHERE c.estado = 'Pendiente de Horario'
        ORDER BY c.fecha ASC
      `;
      
      const result = await pool.query(consulta_sql);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('❌ Error al obtener cirugías pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener cirugías pendientes'
      });
    }
  },

  // --- FUNCIÓN CREATE ---
  crearCirugia: async (req, res) => {
    try {
      const {
        id_expediente, fecha, diagnostico_pre, procedimiento,
        id_quirofano, id_equipomedico, estado,
        diagnostico_post, resultado, nombre_paciente, especialista, urgencia
      } = req.body;
      
      const creado_por_str = req.user ? req.user.id.toString() : 'sistema';

      console.log('➕ Creando nueva cirugía...');

      if (!id_expediente || !fecha || !procedimiento) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: expediente, fecha, procedimiento.'
        });
      }
      
      const consulta_sql = `
        INSERT INTO cirugias 
        (id_expediente, fecha, diagnostico_pre, procedimiento, id_quirofano, id_equipomedico, estado, diagnostico_post, resultado, creado_por, nombre_paciente, especialista, urgencia) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
        RETURNING *
      `;
      
      const values = [
        id_expediente, fecha,
        diagnostico_pre || null,
        procedimiento, 
        id_quirofano || null,
        id_equipomedico || null,
        estado || 'Pendiente de Horario',
        diagnostico_post || null,
        resultado || null,
        creado_por_str,
        nombre_paciente || null,
        especialista || null,
        urgencia || null
      ];
      
      const result = await pool.query(consulta_sql, values); 

      res.status(201).json({
        success: true,
        message: 'Cirugía creada con éxito',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('❌ Error al crear cirugía:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor al crear la cirugía',
        error: error.message 
      });
    }
  },

  // --- FUNCIÓN UPDATE BÁSICA ---
  actualizarCirugia: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, id_quirofano, fecha, hora_inicio, hora_fin, duracion } = req.body;
      
      console.log(`🔄 Actualizando cirugía ${id}:`, req.body);
      
      // Validar que el ID sea un número
      const idCirugia = parseInt(id);
      if (isNaN(idCirugia)) {
        return res.status(400).json({
          success: false,
          message: 'ID de cirugía no válido'
        });
      }
      
      // Construir consulta dinámica
      const campos = [];
      const valores = [];
      let contador = 1;
      
      if (estado !== undefined) {
        campos.push(`estado = $${contador}`);
        valores.push(estado);
        contador++;
      }
      
      if (id_quirofano !== undefined && id_quirofano !== null && id_quirofano !== '') {
        const quirofanoValue = parseInt(id_quirofano);
        if (!isNaN(quirofanoValue)) {
          campos.push(`id_quirofano = $${contador}`);
          valores.push(quirofanoValue);
          contador++;
        }
      }
      
      if (fecha !== undefined) {
        campos.push(`fecha = $${contador}`);
        valores.push(fecha);
        contador++;
      }
      
      if (hora_inicio !== undefined) {
        campos.push(`hora_inicio = $${contador}`);
        valores.push(hora_inicio);
        contador++;
      }
      
      if (hora_fin !== undefined) {
        campos.push(`hora_fin = $${contador}`);
        valores.push(hora_fin);
        contador++;
      }
      
      if (duracion !== undefined) {
        campos.push(`duracion = $${contador}`);
        valores.push(duracion);
        contador++;
      }
      
      // Siempre actualizar la fecha de modificación
      campos.push(`actualizado_en = CURRENT_TIMESTAMP`);
      
      if (campos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No hay campos para actualizar'
        });
      }
      
      valores.push(idCirugia);
      
      const consulta_sql = `
        UPDATE cirugias 
        SET ${campos.join(', ')}
        WHERE id_cirugia = $${contador}
        RETURNING *
      `;
      
      console.log('📝 Ejecutando consulta:', consulta_sql);
      console.log('📦 Valores:', valores);
      
      const result = await pool.query(consulta_sql, valores);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Cirugía no encontrada'
        });
      }

      // Si se asignó horario, actualizar también la tabla horarios
      if (hora_inicio && hora_fin) {
        await cirugiaController.actualizarTablaHorarios(idCirugia, hora_inicio, hora_fin);
      }
      
      res.json({
        success: true,
        message: 'Cirugía actualizada correctamente',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('❌ Error al actualizar cirugía:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la cirugía: ' + error.message
      });
    }
  },

  // --- FUNCIÓN AUXILIAR PARA ACTUALIZAR TABLA HORARIOS ---
  actualizarTablaHorarios: async (id_cirugia, hora_inicio, hora_fin) => {
    try {
      // Verificar si ya existe un horario para esta cirugía
      const checkHorario = await pool.query(
        'SELECT * FROM horarios WHERE id_cirugia = $1', 
        [id_cirugia]
      );
      
      // Calcular horas de recuperación y egreso
      const horaRecuperacion = new Date(`2000-01-01T${hora_fin}`);
      horaRecuperacion.setHours(horaRecuperacion.getHours() + 1);
      
      const horaEgreso = new Date(horaRecuperacion);
      horaEgreso.setHours(horaEgreso.getHours() + 2);

      if (checkHorario.rows.length > 0) {
        // Actualizar horario existente
        const updateHorario = `
          UPDATE horarios 
          SET hora_inicio = $1, hora_fin = $2, hora_recuperacion = $3, 
              hora_egreso = $4, actualizado_en = CURRENT_TIMESTAMP
          WHERE id_cirugia = $5
          RETURNING *
        `;
        await pool.query(updateHorario, [
          hora_inicio, 
          hora_fin,
          horaRecuperacion.toTimeString().split(' ')[0],
          horaEgreso.toTimeString().split(' ')[0],
          id_cirugia
        ]);
        console.log('✅ Horario actualizado en tabla horarios');
      } else {
        // Insertar nuevo horario
        const insertHorario = `
          INSERT INTO horarios 
          (id_cirugia, hora_inicio, hora_fin, hora_recuperacion, hora_egreso) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *
        `;
        await pool.query(insertHorario, [
          id_cirugia, 
          hora_inicio, 
          hora_fin,
          horaRecuperacion.toTimeString().split(' ')[0],
          horaEgreso.toTimeString().split(' ')[0]
        ]);
        console.log('✅ Nuevo horario insertado en tabla horarios');
      }
    } catch (error) {
      console.error('❌ Error al actualizar tabla horarios:', error);
      throw error;
    }
  },

  // --- FUNCIÓN PARA ASIGNAR HORARIO COMPLETO ---
  asignarHorarioCompleto: async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      const { fecha, hora_inicio, hora_fin, id_quirofano, duracion } = req.body;
      
      console.log(`🔄 Asignando horario completo a cirugía ${id}:`, req.body);
      
      const idCirugia = parseInt(id);
      if (isNaN(idCirugia)) {
        return res.status(400).json({
          success: false,
          message: 'ID de cirugía no válido'
        });
      }
      
      await client.query('BEGIN');

      // 1. Actualizar cirugía con estado "Programada"
      const updateCirugia = `
        UPDATE cirugias 
        SET estado = 'Programada', id_quirofano = $1, fecha = $2, 
            hora_inicio = $3, hora_fin = $4, duracion = $5, 
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id_cirugia = $6
        RETURNING *
      `;
      
      const valuesCirugia = [id_quirofano, fecha, hora_inicio, hora_fin, duracion, idCirugia];
      
      const resultCirugia = await client.query(updateCirugia, valuesCirugia);
      
      if (resultCirugia.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Cirugía no encontrada'
        });
      }

      // 2. Manejar tabla horarios
      const checkHorario = await client.query(
        'SELECT * FROM horarios WHERE id_cirugia = $1', 
        [idCirugia]
      );
      
      // Calcular horas de recuperación y egreso
      const horaRecuperacion = new Date(`2000-01-01T${hora_fin}`);
      horaRecuperacion.setHours(horaRecuperacion.getHours() + 1);
      
      const horaEgreso = new Date(horaRecuperacion);
      horaEgreso.setHours(horaEgreso.getHours() + 2);

      if (checkHorario.rows.length > 0) {
        // Actualizar horario existente
        const updateHorario = `
          UPDATE horarios 
          SET hora_inicio = $1, hora_fin = $2, hora_recuperacion = $3, 
              hora_egreso = $4, actualizado_en = CURRENT_TIMESTAMP
          WHERE id_cirugia = $5
          RETURNING *
        `;
        await client.query(updateHorario, [
          hora_inicio, 
          hora_fin,
          horaRecuperacion.toTimeString().split(' ')[0],
          horaEgreso.toTimeString().split(' ')[0],
          idCirugia
        ]);
        console.log('✅ Horario actualizado en tabla horarios');
      } else {
        // Insertar nuevo horario
        const insertHorario = `
          INSERT INTO horarios 
          (id_cirugia, hora_inicio, hora_fin, hora_recuperacion, hora_egreso) 
          VALUES ($1, $2, $3, $4, $5) 
          RETURNING *
        `;
        await client.query(insertHorario, [
          idCirugia, 
          hora_inicio, 
          hora_fin,
          horaRecuperacion.toTimeString().split(' ')[0],
          horaEgreso.toTimeString().split(' ')[0]
        ]);
        console.log('✅ Nuevo horario insertado en tabla horarios');
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Horario asignado correctamente',
        data: resultCirugia.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error al asignar horario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al asignar horario: ' + error.message
      });
    } finally {
      client.release();
    }
  },

  // --- FUNCIÓN DELETE ---
  eliminarCirugia: async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
      console.log(`🗑️ Intentando eliminar cirugía con ID: ${id}`);
      
      await client.query('BEGIN');

      // 1. Eliminar horarios relacionados primero
      await client.query('DELETE FROM horarios WHERE id_cirugia = $1', [id]);
      
      // 2. Eliminar la cirugía
      const consulta_sql = 'DELETE FROM cirugias WHERE id_cirugia = $1 RETURNING *';
      const result = await client.query(consulta_sql, [id]);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Cirugía no encontrada para eliminar'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Cirugía eliminada correctamente',
        data: result.rows[0]
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error al eliminar cirugía:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor al eliminar la cirugía'
      });
    } finally {
      client.release();
    }
  },

  // --- FUNCIÓN PARA GENERAR HORARIOS AUTOMÁTICOS ---
  generarHorariosAutomaticos: async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { fecha, cirugias } = req.body;
      
      console.log(`🔄 Generando horarios automáticos para ${cirugias.length} cirugías en fecha: ${fecha}`);
      
      await client.query('BEGIN');

      const resultados = [];
      const errores = [];

      for (const cirugia of cirugias) {
        try {
          const { id_cirugia, hora_inicio, hora_fin, id_quirofano, duracion } = cirugia;
          
          // 1. Actualizar cirugía
          const updateCirugia = `
            UPDATE cirugias 
            SET estado = 'Programada', id_quirofano = $1, fecha = $2, 
                hora_inicio = $3, hora_fin = $4, duracion = $5, 
                actualizado_en = CURRENT_TIMESTAMP
            WHERE id_cirugia = $6
            RETURNING *
          `;
          
          const resultCirugia = await client.query(updateCirugia, [
            id_quirofano, fecha, hora_inicio, hora_fin, duracion, id_cirugia
          ]);

          // 2. Manejar tabla horarios
          const checkHorario = await client.query(
            'SELECT * FROM horarios WHERE id_cirugia = $1', 
            [id_cirugia]
          );
          
          // Calcular horas de recuperación y egreso
          const horaRecuperacion = new Date(`2000-01-01T${hora_fin}`);
          horaRecuperacion.setHours(horaRecuperacion.getHours() + 1);
          
          const horaEgreso = new Date(horaRecuperacion);
          horaEgreso.setHours(horaEgreso.getHours() + 2);

          if (checkHorario.rows.length > 0) {
            // Actualizar horario existente
            await client.query(`
              UPDATE horarios 
              SET hora_inicio = $1, hora_fin = $2, hora_recuperacion = $3, 
                  hora_egreso = $4, actualizado_en = CURRENT_TIMESTAMP
              WHERE id_cirugia = $5
            `, [hora_inicio, hora_fin, 
                horaRecuperacion.toTimeString().split(' ')[0],
                horaEgreso.toTimeString().split(' ')[0],
                id_cirugia]);
          } else {
            // Insertar nuevo horario
            await client.query(`
              INSERT INTO horarios 
              (id_cirugia, hora_inicio, hora_fin, hora_recuperacion, hora_egreso) 
              VALUES ($1, $2, $3, $4, $5)
            `, [id_cirugia, hora_inicio, hora_fin,
                horaRecuperacion.toTimeString().split(' ')[0],
                horaEgreso.toTimeString().split(' ')[0]]);
          }

          resultados.push({
            id_cirugia,
            success: true,
            mensaje: `Horario asignado: ${hora_inicio} - ${hora_fin}`
          });

        } catch (error) {
          errores.push({
            id_cirugia: cirugia.id_cirugia,
            error: error.message
          });
          console.error(`❌ Error con cirugía ${cirugia.id_cirugia}:`, error);
        }
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: `Procesadas ${resultados.length} cirugías, ${errores.length} errores`,
        data: {
          exitosas: resultados,
          errores: errores
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en generación automática:', error);
      res.status(500).json({
        success: false,
        message: 'Error en generación automática: ' + error.message
      });
    } finally {
      client.release();
    }
  }
};

module.exports = cirugiaController;