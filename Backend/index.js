const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;


app.use(cors());
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/pacientes', require('./routes/pacientesRoutes'));
app.use('/api/roles', require('./routes/rolesRoutes'));
app.use('/api/especialidades', require('./routes/especialidadRoutes'));
app.use('/api/quirofanos', require('./routes/quirofanoRoutes'));
app.use('/api/equipos', require('./routes/equipoMedicoRoutes'));
app.use('/api/cirugias', require('./routes/cirugiaRoutes'));


app.listen(PORT, () => {
    console.log(`Servidor ABMODEL corriendo en el puerto ${PORT}`);
});