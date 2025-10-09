const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Inicialización del servidor
const app = express();
const PORT = process.env.PORT || 4001;

// 2. Middlewares (configuraciones que se ejecutan en cada petición)
app.use(cors()); // Permite que tu frontend se comunique con este backend
app.use(express.json()); // Permite al servidor entender el formato JSON en las peticiones
app.use('/uploads', express.static('uploads'));

// 3. Conexión de las Rutas
// Le decimos al servidor que todas las rutas que empiecen con '/api/auth'
// deben ser manejadas por el archivo que importamos de './routes/auth'.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
// --- Aquí puedes agregar más rutas en el futuro ---
// app.use('/api/pacientes', require('./routes/pacientes'));
// app.use('/api/citas', require('./routes/citas'));
// app.use('/api/especialistas', require('./routes/especialistas'));


// 4. Iniciar el Servidor
app.listen(PORT, () => {
    console.log(`Servidor ABMODEL corriendo en el puerto ${PORT}`);
});