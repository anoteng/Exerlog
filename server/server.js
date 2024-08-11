const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Importer rutene
const exerciseRoutes = require('./routes/exercises');
const programRoutes = require('./routes/programs');
const workoutRoutes = require('./routes/workouts');

const SECRET_KEY = "supersecretkey";

// Swagger-konfigurasjon
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Treningsapp API',
            version: '1.0.0',
            description: 'API for treningslogg applikasjon',
            contact: {
                name: 'Utvikler',
                email: 'email@example.com'
            },
            servers: [
                {
                    url: 'http://localhost:3000',
                    description: 'Lokal utviklingsserver'
                }
            ]
        }
    },
    apis: ['./routes/*.js'], // Inkluderer alle rute-modulene
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Middleware for logging av alle forespørsler
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware for autentisering
function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
        req.userId = decoded.id;
        next();
    });
}

// Bruk rutemodulene
app.use('/exercises', verifyToken, exerciseRoutes);
app.use('/programs', verifyToken, programRoutes);
app.use('/workouts', verifyToken, workoutRoutes);

// Registrering av bruker
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            console.error(`Error registering user: ${err.message}`);
            return res.status(500).send("User already exists.");
        }
        const token = jwt.sign({ id: this.lastID }, SECRET_KEY, { expiresIn: 86400 });
        res.status(201).send({ auth: true, token });
    });
});

// Innlogging
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error(`Error finding user: ${err.message}`);
            return res.status(404).send("User not found.");
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            console.warn(`Invalid password attempt for user ${username}`);
            return res.status(401).send({ auth: false, token: null });
        }

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: 86400 });
        res.status(200).send({ auth: true, token });
    });
});

// Start serveren
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
