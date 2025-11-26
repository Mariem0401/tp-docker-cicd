const express = require("express"); // Framework web
const cors = require("cors"); // Gestion CORS
const { Pool } = require("pg"); // Client PostgreSQL
const app = express();
const PORT = process.env.PORT || 10000; // Utilisez 10000 comme dans les logs Render

// Permet à Express de lire le JSON dans le corps des requêtes POST
app.use(express.json());

// Configuration de la connexion à la base de données
// *** IMPORTANT *** : Pour Render, nous utilisons la variable DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requis pour certaines configurations cloud (Render)
    }
});

// ----------------------------------------------------
// MIDDLEWARE CORS : CORRECTION ESSENTIELLE
// ----------------------------------------------------
const allowedOrigins = [
    // L'URL de votre frontend déployé sur Vercel
    'https://mariemguibene.vercel.app', 
    
    // Autres environnements de développement
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    // ... toutes les autres origines nécessaires
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'], // Méthodes HTTP autorisées
    allowedHeaders: ['Content-Type'], // Headers autorisés
}));
// ----------------------------------------------------

// ROUTE API PRINCIPALE
app.get("/api", (req, res) => {
  res.json({
    message: "Hello from Backend!",
    timestamp: new Date().toISOString(),
    client: req.get('Origin') || 'unknown',
    success: true
  });
});

// ROUTE DB & ROUTE UTILISATEURS (celle que le frontend appelle)
app.get("/api/users", async (req, res) => {
  try {
    // Le frontend appelle /api/users pour récupérer la liste
    const result = await pool.query("SELECT id, name, email FROM users ORDER BY id DESC"); 
    res.json(result.rows); // Renvoyer directement le tableau d'utilisateurs comme attendu par le frontend
  } catch (err) {
    console.error("Database error (GET /api/users):", err.message);
    res.status(500).json({
      message: "Database error during fetch",
      error: err.message,
      success: false
    });
  }
});

// ROUTE AJOUT D'UTILISATEUR (celle que le formulaire du frontend appelle)
app.post("/api/users", async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ success: false, error: "Name and email are required." });
    }
    try {
        await pool.query(
            "INSERT INTO users (name, email) VALUES ($1, $2)",
            [name, email]
        );
        res.status(201).json({ success: true, message: "User added successfully" });
    } catch (err) {
        console.error("Database error (POST /api/users):", err.message);
        res.status(500).json({ success: false, error: "Database error during insert" });
    }
});

// ROUTE DE SANTE
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "OK", message: "API en bonne santé" });
});


// DÉMARRAGE SERVEUR
app.listen(PORT, () => {
  console.log(`🚀 Backend listening on port ${PORT}`);
  console.log(`API endpoint: https://tp-docker-cicd-onlr.onrender.com/api/users`);
});
