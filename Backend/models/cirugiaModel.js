const pool = require('../config/db');

const Cirugia = {
  /**
   * Crea una nueva cirugía en la base de datos.
   */
  async create(cirugiaData) {
    const {
      id_expediente, fecha, diagnostico_pre, procedimiento,
      id_quirofano, id_equipomedico, estado,
      diagnostico_post, resultado, creado_por
    } = cirugiaData;

    const fechaCirugia = fecha ? new Date(fecha) : new Date();

    const query = `
      INSERT INTO cirugias (
        id_expediente, fecha, diagnostico_pre, procedimiento, 
        id_quirofano, id_equipomedico, estado, diagnostico_post, resultado, creado_por
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    const values = [
      id_expediente, fechaCirugia, diagnostico_pre, procedimiento,
      id_quirofano, id_equipomedico, estado || 'Programada',
      diagnostico_post, resultado, creado_por || 'sistema'
    ];

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error al insertar cirugía en el modelo:', error);
      throw error;
    }
  },

  /**
   * Obtiene todas las cirugías con detalles de tablas relacionadas.
   */
  async findAllDetailed() {
    const query = `
      SELECT 
        ci.id_cirugia,
        ci.fecha,
        ci.estado,
        ex.numero_expediente,
        p.nombre AS paciente_nombre,
        p.apellido AS paciente_apellido,
        ci.diagnostico_pre,
        ci.procedimiento,
        q.sala AS quirofano_sala,
        eq.nombre AS equipo_nombre,
        ci.diagnostico_post,
        ci.resultado
      FROM cirugias ci 
      LEFT JOIN expedientes ex ON ci.id_expediente = ex.id_expediente
      LEFT JOIN pacientes p ON ex.id_paciente = p.id_paciente
      LEFT JOIN quirofanos q ON ci.id_quirofano = q.id_quirofano
      LEFT JOIN equipo_medico eq ON ci.id_equipomedico = eq.id_equipomedico
      ORDER BY ci.fecha DESC, ci.id_cirugia DESC;
    `;
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error al obtener cirugías detalladas:', error);
      throw error;
    }
  },

  /**
   * Busca una cirugía por su ID
   */
  async findById(id) {
    const query = 'SELECT * FROM cirugias WHERE id_cirugia = $1';
    try {
      const { rows } = await pool.query(query, [id]);
      return rows[0];
    } catch (error) {
      console.error(`Error al buscar cirugía con ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Actualiza una cirugía existente por su ID.
   */
  async update(id, cirugiaData) {
    const {
      fecha, diagnostico_pre, procedimiento, id_quirofano, 
      id_equipomedico, estado, diagnostico_post, resultado
    } = cirugiaData;
    
    const fechaCirugia = fecha ? new Date(fecha) : undefined;

    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (fechaCirugia !== undefined) { fields.push(`fecha = $${queryIndex++}`); values.push(fechaCirugia); }
    if (diagnostico_pre !== undefined) { fields.push(`diagnostico_pre = $${queryIndex++}`); values.push(diagnostico_pre); }
    if (procedimiento !== undefined) { fields.push(`procedimiento = $${queryIndex++}`); values.push(procedimiento); }
    if (id_quirofano !== undefined) { fields.push(`id_quirofano = $${queryIndex++}`); values.push(id_quirofano); }
    if (id_equipomedico !== undefined) { fields.push(`id_equipomedico = $${queryIndex++}`); values.push(id_equipomedico); }
    if (estado !== undefined) { fields.push(`estado = $${queryIndex++}`); values.push(estado); }
    if (diagnostico_post !== undefined) { fields.push(`diagnostico_post = $${queryIndex++}`); values.push(diagnostico_post); }
    if (resultado !== undefined) { fields.push(`resultado = $${queryIndex++}`); values.push(resultado); }
    
    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`actualizado_en = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE cirugias 
      SET ${fields.join(', ')} 
      WHERE id_cirugia = $${queryIndex}
      RETURNING *
    `;

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar cirugía en el modelo:', error);
      throw error;
    }
  },

  /**
   * Elimina una cirugía por su ID.
   */
  async remove(id) {
    const query = 'DELETE FROM cirugias WHERE id_cirugia = $1';
    try {
      const result = await pool.query(query, [id]);
      return result.rowCount;
    } catch (error) {
      console.error('Error al eliminar cirugía en el modelo:', error);
      throw error;
    }
  },

  // ========== NUEVAS FUNCIONES PARA HORARIOS AUTOMÁTICOS ==========

  /**
   * Obtiene cirugías programadas para una fecha y quirófano específicos
   */
  async findByFechaAndQuirofano(fecha, id_quirofano) {
    const query = `
      SELECT * FROM cirugias 
      WHERE DATE(fecha) = $1 
      AND id_quirofano = $2 
      AND estado IN ('Programada', 'En Proceso', 'Baja Urgencia', 'Media Urgencia', 'Emergencia')
      ORDER BY hora_inicio ASC
    `;
    try {
      const { rows } = await pool.query(query, [fecha, id_quirofano]);
      return rows;
    } catch (error) {
      console.error('Error al buscar cirugías por fecha y quirófano:', error);
      throw error;
    }
  },

  /**
   * Actualiza el horario de una cirugía
   */
  async updateHorario(id_cirugia, hora_inicio, hora_fin, duracion) {
    // Función para formatear hora para PostgreSQL
    const formatTimeForDB = (timeValue) => {
      if (!timeValue) return null;
      
      if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return timeValue;
      }
      
      if (typeof timeValue === 'string' && timeValue.includes('T')) {
        try {
          const date = new Date(timeValue);
          return date.toTimeString().split(' ')[0];
        } catch (error) {
          console.error('Error al formatear hora:', error);
          return '08:00:00';
        }
      }
      
      return timeValue;
    };

    const horaInicioFormatted = formatTimeForDB(hora_inicio);
    const horaFinFormatted = formatTimeForDB(hora_fin);

    const query = `
      UPDATE cirugias 
      SET hora_inicio = $1, hora_fin = $2, duracion = $3, actualizado_en = CURRENT_TIMESTAMP
      WHERE id_cirugia = $4
      RETURNING *
    `;
    try {
      const { rows } = await pool.query(query, [horaInicioFormatted, horaFinFormatted, duracion, id_cirugia]);
      return rows[0];
    } catch (error) {
      console.error('Error al actualizar horario de cirugía:', error);
      throw error;
    }
  },

  /**
   * Obtiene cirugías para el horario semanal
   */
  async findForHorarioSemanal(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        ci.*,
        p.nombre AS nombre_paciente,
        p.apellido AS paciente_apellido,
        q.sala AS quirofano_sala
      FROM cirugias ci
      LEFT JOIN expedientes ex ON ci.id_expediente = ex.id_expediente
      LEFT JOIN pacientes p ON ex.id_paciente = p.id_paciente
      LEFT JOIN quirofanos q ON ci.id_quirofano = q.id_quirofano
      WHERE ci.fecha BETWEEN $1 AND $2
      AND ci.estado != 'Cancelada'
      ORDER BY ci.fecha ASC, ci.hora_inicio ASC
    `;
    try {
      const { rows } = await pool.query(query, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      console.error('Error al obtener cirugías para horario semanal:', error);
      throw error;
    }
  },

  /**
   * Crea cirugía con horario automático
   */
  async createWithHorario(cirugiaData) {
    const {
      id_expediente, fecha, diagnostico_pre, procedimiento,
      id_quirofano, id_equipomedico, estado, urgencia,
      duracion_estimada, nombre_paciente, especialista, tipo_cirugia,
      hora_inicio, hora_fin, duracion, creado_por
    } = cirugiaData;

    const fechaCirugia = fecha ? new Date(fecha) : new Date();

    // Función para formatear hora para PostgreSQL
    const formatTimeForDB = (timeValue) => {
      if (!timeValue) return null;
      
      if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
        return timeValue;
      }
      
      if (typeof timeValue === 'string' && timeValue.includes('T')) {
        try {
          const date = new Date(timeValue);
          return date.toTimeString().split(' ')[0];
        } catch (error) {
          console.error('Error al formatear hora:', error);
          return '08:00:00';
        }
      }
      
      return timeValue;
    };

    const horaInicioFormatted = formatTimeForDB(hora_inicio);
    const horaFinFormatted = formatTimeForDB(hora_fin);

    const query = `
      INSERT INTO cirugias (
        id_expediente, fecha, diagnostico_pre, procedimiento, 
        id_quirofano, id_equipomedico, estado, urgencia,
        duracion_estimada, nombre_paciente, especialista, tipo_cirugia,
        hora_inicio, hora_fin, duracion, creado_por
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING *
    `;
    
    const values = [
      id_expediente, fechaCirugia, diagnostico_pre, procedimiento,
      id_quirofano, id_equipomedico, estado || 'Programada', urgencia,
      duracion_estimada, nombre_paciente, especialista, tipo_cirugia,
      horaInicioFormatted, horaFinFormatted, duracion, creado_por || 'sistema'
    ];

    try {
      const { rows } = await pool.query(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error al insertar cirugía con horario:', error);
      throw error;
    }
  },

  /**
   * Verifica disponibilidad de horario
   */
  async checkDisponibilidad(fecha, id_quirofano, hora_inicio, hora_fin, id_cirugia_excluir = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM cirugias 
      WHERE id_quirofano = $1 
      AND DATE(fecha) = $2
      AND estado IN ('Programada', 'En Proceso', 'Baja Urgencia', 'Media Urgencia', 'Emergencia')
      AND (
        (hora_inicio < $4 AND hora_fin > $3) OR
        (hora_inicio >= $3 AND hora_inicio < $4) OR
        (hora_fin > $3 AND hora_fin <= $4)
      )
    `;
    
    const values = [id_quirofano, fecha, hora_inicio, hora_fin];
    
    if (id_cirugia_excluir) {
      query += ' AND id_cirugia != $5';
      values.push(id_cirugia_excluir);
    }

    try {
      const { rows } = await pool.query(query, values);
      return parseInt(rows[0].count) === 0;
    } catch (error) {
      console.error('Error al verificar disponibilidad:', error);
      throw error;
    }
  },

  /**
   * Obtiene todos los quirófanos disponibles
   */
  async getQuirofanos() {
    const query = 'SELECT id_quirofano, sala FROM quirofanos WHERE estado = true ORDER BY sala';
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error al obtener quirófanos:', error);
      throw error;
    }
  },

  /**
   * Busca el primer horario disponible en cualquier quirófano
   */
  async findFirstAvailableSlot(fecha, duracionHoras) {
    const quirofanos = await this.getQuirofanos();
    
    for (const quirofano of quirofanos) {
      const horarioDisponible = await this.findAvailableSlot(fecha, quirofano.id_quirofano, duracionHoras);
      if (horarioDisponible) {
        return {
          ...horarioDisponible,
          id_quirofano: quirofano.id_quirofano,
          sala: quirofano.sala
        };
      }
    }
    
    return null;
  },

  /**
   * Encuentra horario disponible en un quirófano específico
   */
  async findAvailableSlot(fecha, id_quirofano, duracionHoras) {
    const cirugiasDelDia = await this.findByFechaAndQuirofano(fecha, id_quirofano);
    
    // Horario de trabajo: 7:00 AM a 7:00 PM
    const horaInicioDia = new Date(fecha);
    horaInicioDia.setHours(7, 0, 0, 0);
    
    const horaFinDia = new Date(fecha);
    horaFinDia.setHours(19, 0, 0, 0);

    // Si no hay cirugías, usar inicio del día
    if (cirugiasDelDia.length === 0) {
      return {
        hora_inicio: horaInicioDia,
        hora_fin: new Date(horaInicioDia.getTime() + duracionHoras * 60 * 60 * 1000)
      };
    }

    // Buscar espacios entre cirugías
    for (let i = 0; i <= cirugiasDelDia.length; i++) {
      let inicioDisponible, finDisponible;

      if (i === 0) {
        // Espacio antes de la primera cirugía
        inicioDisponible = horaInicioDia;
        finDisponible = new Date(cirugiasDelDia[i].hora_inicio);
      } else if (i === cirugiasDelDia.length) {
        // Espacio después de la última cirugía
        inicioDisponible = new Date(cirugiasDelDia[i-1].hora_fin);
        finDisponible = horaFinDia;
      } else {
        // Espacio entre cirugías
        inicioDisponible = new Date(cirugiasDelDia[i-1].hora_fin);
        finDisponible = new Date(cirugiasDelDia[i].hora_inicio);
      }

      const duracionDisponible = (finDisponible - inicioDisponible) / (1000 * 60 * 60);
      
      if (duracionDisponible >= duracionHoras) {
        return {
          hora_inicio: inicioDisponible,
          hora_fin: new Date(inicioDisponible.getTime() + duracionHoras * 60 * 60 * 1000)
        };
      }
    }

    return null;
  },

  /**
   * Crea cirugía con horario automático y guarda en tabla horarios
   */
  async createWithHorarioCompleto(cirugiaData) {
    const {
      id_expediente, fecha, diagnostico_pre, procedimiento,
      id_quirofano, id_equipomedico, estado, urgencia,
      duracion_estimada, nombre_paciente, especialista, tipo_cirugia,
      hora_inicio, hora_fin, duracion, creado_por
    } = cirugiaData;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Función para formatear hora para PostgreSQL
      const formatTimeForDB = (timeValue) => {
        if (!timeValue) return null;
        
        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
          return timeValue;
        }
        
        if (typeof timeValue === 'string' && timeValue.includes('T')) {
          try {
            const date = new Date(timeValue);
            return date.toTimeString().split(' ')[0];
          } catch (error) {
            console.error('Error al formatear hora:', error);
            return '08:00:00';
          }
        }
        
        return timeValue;
      };

      const horaInicioFormatted = formatTimeForDB(hora_inicio);
      const horaFinFormatted = formatTimeForDB(hora_fin);

      // 1. Insertar en tabla cirugias
      const queryCirugia = `
        INSERT INTO cirugias (
          id_expediente, fecha, diagnostico_pre, procedimiento, 
          id_quirofano, id_equipomedico, estado, urgencia,
          duracion_estimada, nombre_paciente, especialista, tipo_cirugia,
          hora_inicio, hora_fin, duracion, creado_por
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
        RETURNING id_cirugia
      `;
      
      const valuesCirugia = [
        id_expediente, fecha, diagnostico_pre, procedimiento,
        id_quirofano, id_equipomedico, estado || 'Programada', urgencia,
        duracion_estimada, nombre_paciente, especialista, tipo_cirugia,
        horaInicioFormatted, horaFinFormatted, duracion, creado_por || 'sistema'
      ];

      const { rows: cirugiaRows } = await client.query(queryCirugia, valuesCirugia);
      const id_cirugia = cirugiaRows[0].id_cirugia;

      // 2. Insertar en tabla horarios
      const queryHorario = `
        INSERT INTO horarios (
          id_cirugia, hora_inicio, hora_fin, hora_recuperacion, hora_egreso
        ) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *
      `;
      
      // Calcular horas de recuperación y egreso
      const horaRecuperacion = new Date(hora_fin);
      horaRecuperacion.setHours(horaRecuperacion.getHours() + 1);
      
      const horaEgreso = new Date(horaRecuperacion);
      horaEgreso.setHours(horaEgreso.getHours() + 2);

      const horaRecuperacionFormatted = formatTimeForDB(horaRecuperacion.toISOString());
      const horaEgresoFormatted = formatTimeForDB(horaEgreso.toISOString());

      const valuesHorario = [
        id_cirugia,
        horaInicioFormatted,
        horaFinFormatted,
        horaRecuperacionFormatted,
        horaEgresoFormatted
      ];

      const { rows: horarioRows } = await client.query(queryHorario, valuesHorario);

      await client.query('COMMIT');

      // Devolver ambos resultados
      return {
        cirugia: { id_cirugia, ...cirugiaData },
        horario: horarioRows[0]
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al insertar cirugía con horario:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Actualiza horario en ambas tablas
   */
  async updateHorarioCompleto(id_cirugia, hora_inicio, hora_fin, duracion) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Función para formatear hora para PostgreSQL
      const formatTimeForDB = (timeValue) => {
        if (!timeValue) return null;
        
        if (typeof timeValue === 'string' && timeValue.match(/^\d{2}:\d{2}:\d{2}$/)) {
          return timeValue;
        }
        
        if (typeof timeValue === 'string' && timeValue.includes('T')) {
          try {
            const date = new Date(timeValue);
            return date.toTimeString().split(' ')[0];
          } catch (error) {
            console.error('Error al formatear hora:', error);
            return '08:00:00';
          }
        }
        
        return timeValue;
      };

      const horaInicioFormatted = formatTimeForDB(hora_inicio);
      const horaFinFormatted = formatTimeForDB(hora_fin);

      // 1. Actualizar tabla cirugias
      const queryCirugia = `
        UPDATE cirugias 
        SET hora_inicio = $1, hora_fin = $2, duracion = $3, actualizado_en = CURRENT_TIMESTAMP
        WHERE id_cirugia = $4
        RETURNING *
      `;
      
      const { rows: cirugiaRows } = await client.query(queryCirugia, [horaInicioFormatted, horaFinFormatted, duracion, id_cirugia]);

      // 2. Actualizar o insertar en tabla horarios
      // Primero verificar si ya existe un horario para esta cirugía
      const checkHorario = await client.query('SELECT * FROM horarios WHERE id_cirugia = $1', [id_cirugia]);
      
      let horarioResult;
      if (checkHorario.rows.length > 0) {
        // Actualizar horario existente
        const queryUpdateHorario = `
          UPDATE horarios 
          SET hora_inicio = $1, hora_fin = $2, actualizado_en = CURRENT_TIMESTAMP
          WHERE id_cirugia = $3
          RETURNING *
        `;
        const { rows } = await client.query(queryUpdateHorario, [horaInicioFormatted, horaFinFormatted, id_cirugia]);
        horarioResult = rows[0];
      } else {
        // Insertar nuevo horario
        const horaRecuperacion = new Date(hora_fin);
        horaRecuperacion.setHours(horaRecuperacion.getHours() + 1);
        
        const horaEgreso = new Date(horaRecuperacion);
        horaEgreso.setHours(horaEgreso.getHours() + 2);

        const horaRecuperacionFormatted = formatTimeForDB(horaRecuperacion.toISOString());
        const horaEgresoFormatted = formatTimeForDB(horaEgreso.toISOString());

        const queryInsertHorario = `
          INSERT INTO horarios (id_cirugia, hora_inicio, hora_fin, hora_recuperacion, hora_egreso)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        const { rows } = await client.query(queryInsertHorario, [id_cirugia, horaInicioFormatted, horaFinFormatted, horaRecuperacionFormatted, horaEgresoFormatted]);
        horarioResult = rows[0];
      }

      await client.query('COMMIT');

      return {
        cirugia: cirugiaRows[0],
        horario: horarioResult
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar horario:', error);
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Obtiene horarios con información de cirugías
   */
  async getHorariosConCirugias(fechaInicio, fechaFin) {
    const query = `
      SELECT 
        h.*,
        c.id_expediente,
        c.fecha,
        c.procedimiento,
        c.estado,
        c.urgencia,
        c.nombre_paciente,
        c.especialista,
        c.tipo_cirugia,
        q.sala AS quirofano_sala
      FROM horarios h
      INNER JOIN cirugias c ON h.id_cirugia = c.id_cirugia
      LEFT JOIN quirofanos q ON c.id_quirofano = q.id_quirofano
      WHERE c.fecha BETWEEN $1 AND $2
      AND c.estado != 'Cancelada'
      ORDER BY c.fecha ASC, h.hora_inicio ASC
    `;
    
    try {
      const { rows } = await pool.query(query, [fechaInicio, fechaFin]);
      return rows;
    } catch (error) {
      console.error('Error al obtener horarios con cirugías:', error);
      throw error;
    }
  },

  /**
   * Verifica disponibilidad considerando tabla horarios
   */
  async checkDisponibilidadConHorarios(fecha, id_quirofano, hora_inicio, hora_fin, id_cirugia_excluir = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM cirugias c
      INNER JOIN horarios h ON c.id_cirugia = h.id_cirugia
      WHERE c.id_quirofano = $1 
      AND DATE(c.fecha) = $2
      AND c.estado IN ('Programada', 'En Proceso', 'Baja Urgencia', 'Media Urgencia', 'Emergencia')
      AND (
        (h.hora_inicio < $4 AND h.hora_fin > $3) OR
        (h.hora_inicio >= $3 AND h.hora_inicio < $4) OR
        (h.hora_fin > $3 AND h.hora_fin <= $4)
      )
    `;
    
    const values = [id_quirofano, fecha, hora_inicio, hora_fin];
    
    if (id_cirugia_excluir) {
      query += ' AND c.id_cirugia != $5';
      values.push(id_cirugia_excluir);
    }

    try {
      const { rows } = await pool.query(query, values);
      return parseInt(rows[0].count) === 0;
    } catch (error) {
      console.error('Error al verificar disponibilidad con horarios:', error);
      throw error;
    }
  },
};

module.exports = Cirugia;