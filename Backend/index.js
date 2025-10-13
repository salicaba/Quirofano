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



app.listen(PORT, () => {
    console.log(`Servidor ABMODEL corriendo en el puerto ${PORT}`);
});