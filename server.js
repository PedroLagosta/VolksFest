// server.js - Hauptdatei für den Express-Server
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Environment-Variablen laden
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'volksfest-geheim-2025';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Verbindung
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/volksfestfinder')
  .then(() => console.log('MongoDB verbunden'))
  .catch(err => console.error('MongoDB Verbindungsfehler:', err));

// Modelle
// Festival-Modell
const festivalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  region: { type: String, required: true, enum: ['bayern', 'tirol', 'oesterreich'] },
  address: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  imageUrl: { type: String },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  website: { type: String },
  entryFee: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Festival = mongoose.model('Festival', festivalSchema);

// Benutzer-Modell
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscriptions: {
    regions: [{ type: String, enum: ['bayern', 'tirol', 'oesterreich'] }],
    festivals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Festival' }]
  },
  createdAt: { type: Date, default: Date.now }
});

// Passwort vor dem Speichern hashen
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);

// Middleware für Authentifizierung
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentifizierung erforderlich' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Benutzer nicht gefunden' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Fehler bei der Authentifizierung' });
  }
};

// Admin-Middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Zugriff verweigert. Administratorrechte erforderlich.' });
  }
  next();
};

// API Routen
// Benutzerregistrierung
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Überprüfen, ob Benutzer bereits existiert
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Benutzer oder E-Mail-Adresse existiert bereits' });
    }
    
    // Neuen Benutzer erstellen
    const user = new User({ username, email, password });
    await user.save();
    
    // Token erstellen
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      message: 'Benutzer erfolgreich registriert',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscriptions: user.subscriptions
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler bei der Registrierung' });
  }
});

// Benutzeranmeldung
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Benutzer finden
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
    }
    
    // Passwort überprüfen
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Ungültige Anmeldedaten' });
    }
    
    // Token erstellen
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      message: 'Anmeldung erfolgreich',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subscriptions: user.subscriptions
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler bei der Anmeldung' });
  }
});

// Festivals abrufen (öffentlich)
app.get('/api/festivals', async (req, res) => {
  try {
    const { region, search, startDate, endDate } = req.query;
    const query = {};
    
    // Filter nach Region
    if (region && region !== 'all') {
      query.region = region;
    }
    
    // Filter nach Suchbegriff
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter nach Datum
    if (startDate && endDate) {
      query.$or = [
        // Festivals, die im ausgewählten Zeitraum beginnen
        { startDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        // Festivals, die im ausgewählten Zeitraum enden
        { endDate: { $gte: new Date(startDate), $lte: new Date(endDate) } },
        // Festivals, die den ausgewählten Zeitraum umfassen
        { $and: [{ startDate: { $lte: new Date(startDate) } }, { endDate: { $gte: new Date(endDate) } }] }
      ];
    }
    
    const festivals = await Festival.find(query).sort({ startDate: 1 });
    res.json(festivals);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen der Festivals' });
  }
});

// Festival nach ID abrufen (öffentlich)
app.get('/api/festivals/:id', async (req, res) => {
  try {
    const festival = await Festival.findById(req.params.id);
    
    if (!festival) {
      return res.status(404).json({ error: 'Festival nicht gefunden' });
    }
    
    res.json(festival);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen des Festivals' });
  }
});

// Festival erstellen (nur Admin)
app.post('/api/festivals', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      name, description, location, region, address, startDate, endDate,
      imageUrl, coordinates, website, entryFee
    } = req.body;
    
    const festival = new Festival({
      name,
      description,
      location,
      region,
      address,
      startDate,
      endDate,
      imageUrl,
      coordinates,
      website,
      entryFee,
      createdBy: req.user._id
    });
    
    await festival.save();
    res.status(201).json({ message: 'Festival erfolgreich erstellt', festival });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Erstellen des Festivals' });
  }
});

// Festival aktualisieren (nur Admin)
app.put('/api/festivals/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const {
      name, description, location, region, address, startDate, endDate,
      imageUrl, coordinates, website, entryFee
    } = req.body;
    
    const festival = await Festival.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        location,
        region,
        address,
        startDate,
        endDate,
        imageUrl,
        coordinates,
        website,
        entryFee,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!festival) {
      return res.status(404).json({ error: 'Festival nicht gefunden' });
    }
    
    res.json({ message: 'Festival erfolgreich aktualisiert', festival });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Festivals' });
  }
});

// Festival löschen (nur Admin)
app.delete('/api/festivals/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const festival = await Festival.findByIdAndDelete(req.params.id);
    
    if (!festival) {
      return res.status(404).json({ error: 'Festival nicht gefunden' });
    }
    
    // Referenzen in Benutzerabonnements löschen
    await User.updateMany(
      { 'subscriptions.festivals': req.params.id },
      { $pull: { 'subscriptions.festivals': req.params.id } }
    );
    
    res.json({ message: 'Festival erfolgreich gelöscht' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen des Festivals' });
  }
});

// Regionsabonnement aktualisieren
app.put('/api/users/subscriptions/regions', authenticate, async (req, res) => {
  try {
    const { regions } = req.body;
    
    if (!Array.isArray(regions)) {
      return res.status(400).json({ error: 'Regionen müssen ein Array sein' });
    }
    
    // Nur gültige Regionen erlauben
    const validRegions = regions.filter(region => 
      ['bayern', 'tirol', 'oesterreich'].includes(region)
    );
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'subscriptions.regions': validRegions },
      { new: true }
    );
    
    res.json({
      message: 'Regionsabonnements erfolgreich aktualisiert',
      subscriptions: user.subscriptions
    });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Regionsabonnements' });
  }
});

// Festival abonnieren
app.post('/api/users/subscriptions/festivals/:festivalId', authenticate, async (req, res) => {
  try {
    const festivalId = req.params.festivalId;
    
    // Überprüfen, ob Festival existiert
    const festival = await Festival.findById(festivalId);
    
    if (!festival) {
      return res.status(404).json({ error: 'Festival nicht gefunden' });
    }
    
    // Überprüfen, ob Benutzer das Festival bereits abonniert hat
    const isSubscribed = req.user.subscriptions.festivals.includes(festivalId);
    
    if (isSubscribed) {
      return res.status(400).json({ error: 'Festival bereits abonniert' });
    }
    
    // Festival zum Abonnement hinzufügen
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { 'subscriptions.festivals': festivalId } },
      { new: true }
    );
    
    res.json({
      message: 'Festival erfolgreich abonniert',
      subscriptions: user.subscriptions
    });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abonnieren des Festivals' });
  }
});

// Festival abbestellen
app.delete('/api/users/subscriptions/festivals/:festivalId', authenticate, async (req, res) => {
  try {
    const festivalId = req.params.festivalId;
    
    // Festival aus Abonnement entfernen
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { 'subscriptions.festivals': festivalId } },
      { new: true }
    );
    
    res.json({
      message: 'Festivalabonnement erfolgreich gekündigt',
      subscriptions: user.subscriptions
    });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Kündigen des Festivalabonnements' });
  }
});

// Abonnierte Festivals abrufen
app.get('/api/users/subscriptions/festivals', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const subscribedFestivals = await Festival.find({
      _id: { $in: user.subscriptions.festivals }
    });
    
    res.json(subscribedFestivals);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Abrufen der abonnierten Festivals' });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
