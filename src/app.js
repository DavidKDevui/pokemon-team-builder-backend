//Dependencies
const express = require("express");
const sequelize = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');
const cors = require('cors');
const { xss } = require('express-xss-sanitizer');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

dotenv.config();

// Configs
const swaggerSpecs = require('./config/swagger');

// Routes
const trainerRoutes = require('./routes/trainerRoutes');
const authRoutes = require('./routes/authRoutes');


// Middleware pour parser le JSON
const app = express();
app.use(express.json());
app.use(express.json({ limit: '8mb' }));

app.use(helmet());
app.use(hpp());
app.use(xss());
app.disable('x-powered-by');
app.set('trust proxy', 1);


// Middleware pour limiter le nombre de requêtes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 200, // Limite à 100 requêtes par fenêtre
    message: "Trop de requêtes, veuillez réessayer plus tard."
});



// Configuration CORS
// On autorise toutes les origines (dev)
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

// Middleware pour parser le JSON


// Environment Variables
const PORT = process.env.PORT || 3000;



// Connexion à la base de données et synchronisation des modèles (en cas d'erreur, on retry 3 fois)
const retry = 3;
let attempts = 0;


const connectToDatabase = async () => {
    try {
        await sequelize.authenticate(); 
        console.log('Connexion à la base de données établie avec succès.');
        return sequelize.sync();
    } catch (error) {
        if (attempts < retry) {
            attempts++;
            console.log(`Tentative ${attempts} de connexion à la base de données...`);
            setTimeout(connectToDatabase, 4000);
        } else {
            console.error('Erreur de connexion à la base de données:', error);
            process.exit(1);
        }
    }
}

connectToDatabase();





sequelize.authenticate()
    .then(() => { console.log('Connexion à la base de données établie avec succès.'); return sequelize.sync(); })
    .then(() => { console.log('Modèles synchronisés avec la base de données.'); })
    .catch(err => { console.error('Erreur de connexion à la base de données:', err); });


// Routes
app.use('/api/v1/trainers', limiter, trainerRoutes);
app.use('/api/v1/auth', limiter, authRoutes);
app.use('/api/v1/docs', limiter, swaggerUi.serve, swaggerUi.setup(swaggerSpecs));



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ statusCode: 500, message: "Internal Server Error" });
});
app.use((req, res, next) => {
    res.status(404).json({ statusCode: 404, message: "Not Found" });
});



app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

