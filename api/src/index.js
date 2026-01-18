const cors = require('cors')
const morgan = require('morgan')
require('dotenv').config()

const app = express()

// Middlewares

// Permite peticiones de la app de electron
app.use(cors())

// Log de peticiones de consola
app.use(morgan('dev'))

// Permite leer JSON en el body de las peticiones
app.use(express.json())

// Ruta de prueba 
app.get('/api/health', (req, res) => {
    res.json({ status: "Servidor funcionando", odsc: "Salud y Bienestar" })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto: ${PORT}`)
})