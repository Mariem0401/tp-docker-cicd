// database/mongo-init.js

// Sélection de la base
const db = db.getSiblingDB('mydb'); // nom de ta base

// Création de la collection messages
db.createCollection('messages');
db.messages.insertMany([
  { text: "Bienvenue dans ta base MongoDB 🎉", createdAt: new Date() },
]);

// Création de la collection users
db.createCollection('users');
db.users.insertMany([
  { username: "nawel", email: "nawel@example.com", createdAt: new Date() },
  { username: "hadil", email: "hadil@example.com", createdAt: new Date() }
]);

// Optionnel : créer un utilisateur MongoDB pour la connexion sécurisée
db.createUser({
  user: "admin",
  pwd: "admin",
  roles: [{ role: "readWrite", db: "mydb" }]
});

