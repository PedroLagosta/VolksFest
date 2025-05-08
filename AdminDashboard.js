// AdminDashboard.js - React-Komponente für das Admin-Dashboard
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Plus, Edit, Trash, Save, X, Users, Bell } from 'lucide-react';
import axios from 'axios';

// API Basis-URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Festival State
  const [festivals, setFestivals] = useState([]);
  const [editingFestival, setEditingFestival] = useState(null);
  const [showFestivalForm, setShowFestivalForm] = useState(false);
  
  // Neues/Bearbeitetes Festival
  const [festivalData, setFestivalData] = useState({
    name: '',
    description: '',
    location: '',
    region: 'bayern',
    address: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    coordinates: {
      latitude: 48.1351,  // Standardwert für München
      longitude: 11.5820
    },
    website: '',
    entryFee: ''
  });
  
  // Tabs
  const [activeTab, setActiveTab] = useState('festivals');
  
  // Abonnenten-Statistiken
  const [subscribers, setSubscribers] = useState({
    total: 0,
    byRegion: {
      bayern: 0,
      tirol: 0,
      oesterreich: 0
    },
    byFestival: []
  });
  
  // HTTP-Client mit Auth-Header
  const authAxios = axios.create({
    baseURL: API_URL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  
  // Überprüfen der Authentifizierung beim Laden
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) return;
      
      try {
        // Benutzerinformationen über geschützte Route abrufen
        const response = await authAxios.get('/users/subscriptions/festivals');
        setIsAuthenticated(true);
        setCurrentUser(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
      } catch (error) {
        console.error('Auth Error:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken('');
      }
    };
    
    checkAuth();
  }, [token]);
  
  // Festivals laden
  useEffect(() => {
    if (isAuthenticated) {
      fetchFestivals();
      fetchSubscriberStats();
    }
  }, [isAuthenticated]);
  
  // Festivals abrufen
  const fetchFestivals = async () => {
    try {
      const response = await authAxios.get('/festivals');
      setFestivals(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Festivals:', error);
    }
  };
  
  // Abonnenten-Statistiken abrufen
  const fetchSubscriberStats = async () => {
    try {
      // Dies würde eine spezielle Admin-API-Route erfordern, die in der Backend-Implementierung noch hinzugefügt werden müsste
      const response = await authAxios.get('/admin/subscribers/stats');
      setSubscribers(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Abonnenten-Statistiken:', error);
      // Dummy-Daten für die Demonstration
      setSubscribers({
        total: 187,
        byRegion: {
          bayern: 142,
          tirol: 76,
          oesterreich: 94
        },
        byFestival: [
          { id: '1', name: 'Oktoberfest', count: 128 },
          { id: '2', name: 'Almabtrieb', count: 43 },
          { id: '3', name: 'Salzburger Festspiele', count: 67 }
        ]
      });
    }
  };
  
  // Login-Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: loginEmail,
        password: loginPassword
      });
      
      const { token, user } = response.data;
      
      // Nur Admin-Zugriff erlauben
      if (user.role !== 'admin') {
        setLoginError('Nur Administratoren haben Zugriff auf dieses Dashboard.');
        return;
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setToken(token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      setLoginEmail('');
      setLoginPassword('');
    } catch (error) {
      console.error('Login-Fehler:', error);
      setLoginError(error.response?.data?.error || 'Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
    }
  };
  
  // Logout-Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };
  
  // Festival-Formular-Handler
  const handleFestivalInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('coordinates.')) {
      const coordField = name.split('.')[1];
      setFestivalData({
        ...festivalData,
        coordinates: {
          ...festivalData.coordinates,
          [coordField]: parseFloat(value)
        }
      });
    } else {
      setFestivalData({
        ...festivalData,
        [name]: value
      });
    }
  };
  
  // Festival hinzufügen oder aktualisieren
  const handleSaveFestival = async (e) => {
    e.preventDefault();
    
    try {
      if (editingFestival) {
        // Festival aktualisieren
        await authAxios.put(`/festivals/${editingFestival}`, festivalData);
      } else {
        // Neues Festival erstellen
        await authAxios.post('/festivals', festivalData);
      }
      
      // Formularzustand zurücksetzen
      setFestivalData({
        name: '',
        description: '',
        location: '',
        region: 'bayern',
        address: '',
        startDate: '',
        endDate: '',
        imageUrl: '',
        coordinates: {
          latitude: 48.1351,
          longitude: 11.5820
        },
        website: '',
        entryFee: ''
      });
      
      setEditingFestival(null);
      setShowFestivalForm(false);
      
      // Aktualisierte Liste abrufen
      fetchFestivals();
    } catch (error) {
      console.error('Fehler beim Speichern des Festivals:', error);
      alert('Fehler beim Speichern des Festivals. Bitte versuchen Sie es erneut.');
    }
  };
  
  // Festival bearbeiten
  const handleEditFestival = (festival) => {
    setEditingFestival(festival._id);
    setFestivalData({
      name: festival.name,
      description: festival.description,
      location: festival.location,
      region: festival.region,
      address: festival.address,
      startDate: new Date(festival.startDate).toISOString().split('T')[0],
      endDate: new Date(festival.endDate).toISOString().split('T')[0],
      imageUrl: festival.imageUrl || '',
      coordinates: festival.coordinates,
      website: festival.website || '',
      entryFee: festival.entryFee || ''
    });
    setShowFestivalForm(true);
  };
  
  // Festival löschen
  const handleDeleteFestival = async (id) => {
    if (!window.confirm('Sind Sie sicher, dass Sie dieses Festival löschen möchten?')) {
      return;
    }
    
    try {
      await authAxios.delete(`/festivals/${id}`);
      fetchFestivals();
    } catch (error) {
      console.error('Fehler beim Löschen des Festivals:', error);
      alert('Fehler beim Löschen des Festivals. Bitte versuchen Sie es erneut.');
    }
  };
  
  // Formular abbrechen
  const handleCancelForm = () => {
    setFestivalData({
      name: '',
      description: '',
      location: '',
      region: 'bayern',
      address: '',
      startDate: '',
      endDate: '',
      imageUrl: '',
      coordinates: {
        latitude: 48.1351,
        longitude: 11.5820
      },
      website: '',
      entryFee: ''
    });
    setEditingFestival(null);
    setShowFestivalForm(false);
  };
  
  // Rendering des Login-Formulars, wenn nicht authentifiziert
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="w-full max-w-md p-8 bg-amber-100 border-2 border-amber-800 rounded shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-amber-900" style={{fontFamily: 'Palatino, Georgia, serif'}}>
              VolksfestFinder Admin
            </h1>
            <p className="text-amber-800">Bitte melden Sie sich an, um fortzufahren</p>
          </div>
          
          {loginError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-amber-900 mb-2" htmlFor="email">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-amber-900 mb-2" htmlFor="password">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-amber-800 text-amber-100 rounded hover:bg-amber-900"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }
  
  // Admin-Dashboard, wenn authentifiziert
  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-900 text-amber-100 shadow-md border-b-4 border-amber-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar size={28} />
              <h1 className="text-2xl font-bold" style={{fontFamily: 'Palatino, Georgia, serif'}}>
                VolksfestFinder Admin
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-amber-200">
                Angemeldet als {currentUser?.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-amber-800 hover:bg-amber-700 text-amber-100 py-1 px-3 rounded border border-amber-700"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <div className="bg-amber-800 border-b-2 border-amber-900">
        <div className="container mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('festivals')}
              className={`py-4 px-6 text-amber-100 font-medium ${
                activeTab === 'festivals' 
                  ? 'bg-amber-50 text-amber-900 border-t-2 border-l-2 border-r-2 border-amber-900 rounded-t-lg' 
                  : 'hover:bg-amber-700'
              }`}
            >
              <Calendar size={18} className="inline mr-2" />
              Festivals verwalten
            </button>
            
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`py-4 px-6 text-amber-100 font-medium ${
                activeTab === 'subscribers' 
                  ? 'bg-amber-50 text-amber-900 border-t-2 border-l-2 border-r-2 border-amber-900 rounded-t-lg' 
                  : 'hover:bg-amber-700'
              }`}
            >
              <Users size={18} className="inline mr-2" />
              Abonnenten
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Festivals Tab */}
        {activeTab === 'festivals' && (
          <div>
            {/* Festival List Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-amber-900" style={{fontFamily: 'Palatino, Georgia, serif'}}>
                Festivals verwalten
              </h2>
              
              {!showFestivalForm && (
                <button
                  onClick={() => setShowFestivalForm(true)}
                  className="flex items-center bg-amber-800 hover:bg-amber-900 text-amber-100 py-2 px-4 rounded"
                >
                  <Plus size={18} className="mr-2" />
                  Neues Festival
                </button>
              )}
            </div>
            
            {/* Festival Form */}
            {showFestivalForm && (
              <div className="mb-8 p-6 bg-amber-100 border-2 border-amber-300 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-amber-900" style={{fontFamily: 'Palatino, Georgia, serif'}}>
                    {editingFestival ? 'Festival bearbeiten' : 'Neues Festival hinzufügen'}
                  </h3>
                  <button
                    onClick={handleCancelForm}
                    className="text-amber-700 hover:text-amber-900"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleSaveFestival}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Name */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="name">
                        Name*
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.name}
                        onChange={handleFestivalInputChange}
                        required
                      />
                    </div>
                    
                    {/* Location */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="location">
                        Ort*
                      </label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.location}
                        onChange={handleFestivalInputChange}
                        required
                      />
                    </div>
                    
                    {/* Region */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="region">
                        Region*
                      </label>
                      <select
                        id="region"
                        name="region"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.region}
                        onChange={handleFestivalInputChange}
                        required
                      >
                        <option value="bayern">Bayern</option>
                        <option value="tirol">Tirol</option>
                        <option value="oesterreich">Österreich</option>
                      </select>
                    </div>
                    
                    {/* Address */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="address">
                        Adresse*
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.address}
                        onChange={handleFestivalInputChange}
                        required
                      />
                    </div>
                    
                    {/* Start Date */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="startDate">
                        Startdatum*
                      </label>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.startDate}
                        onChange={handleFestivalInputChange}
                        required
                      />
                    </div>
                    
                    {/* End Date */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="endDate">
                        Enddatum*
                      </label>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.endDate}
                        onChange={handleFestivalInputChange}
                        required
                      />
                    </div>
                    
                    {/* Image URL */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="imageUrl">
                        Bild-URL
                      </label>
                      <input
                        id="imageUrl"
                        name="imageUrl"
                        type="url"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.imageUrl}
                        onChange={handleFestivalInputChange}
                      />
                    </div>
                    
                    {/* Website */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="website">
                        Website
                      </label>
                      <input
                        id="website"
                        name="website"
                        type="url"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.website}
                        onChange={handleFestivalInputChange}
                      />
                    </div>
                    
                    {/* Entry Fee */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="entryFee">
                        Eintrittspreis
                      </label>
                      <input
                        id="entryFee"
                        name="entryFee"
                        type="text"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.entryFee}
                        onChange={handleFestivalInputChange}
                        placeholder="z.B. 10-15€, Kostenlos, etc."
                      />
                    </div>
                    
                    {/* Latitude */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="coordinates.latitude">
                        Breitengrad*
                      </label>
                      <input
                        id="coordinates.latitude"
                        name="coordinates.latitude"
                        type="number"
                        step="0.000001"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.coordinates.latitude}
                        onChange={handleFestivalInputChange}
                        required
                      />
                    </div>
                    
                    {/* Longitude */}
                    <div>
                      <label className="block text-amber-900 mb-1" htmlFor="coordinates.longitude">
                        Längengrad*
                      </label>
                      <input
                        id="coordinates.longitude"
                        name="coordinates.longitude"
                        type="number"
                        step="0.000001"
                        className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                        value={festivalData.coordinates.longitude}
                        onChange={handleFestivalInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-amber-900 mb-1" htmlFor="description">
                      Beschreibung*
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="4"
                      className="w-full p-2 border border-amber-400 rounded bg-amber-50"
                      value={festivalData.description}
                      onChange={handleFestivalInputChange}
                      required
                    ></textarea>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={handleCancelForm}
                      className="py-2 px-4 border-2 border-amber-400 text-amber-900 rounded hover:bg-amber-200"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      className="flex items-center py-2 px-4 bg-amber-800 text-amber-100 rounded hover:bg-amber-900"
                    >
                      <Save size={18} className="mr-2" />
                      Speichern
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Festivals List */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-amber-100 border-2 border-amber-300 rounded-lg">
                <thead className="bg-amber-200 border-b-2 border-amber-300">
                  <tr>
                    <th className="py-3 px-4 text-left text-amber-900">Name</th>
                    <th className="py-3 px-4 text-left text-amber-900">Ort</th>
                    <th className="py-3 px-4 text-left text-amber-900">Region</th>
                    <th className="py-3 px-4 text-left text-amber-900">Datum</th>
                    <th className="py-3 px-4 text-center text-amber-900">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {festivals.length > 0 ? (
                    festivals.map((festival) => (
                      <tr key={festival._id} className="border-b border-amber-300 hover:bg-amber-50">
                        <td className="py-3 px-4 font-medium">{festival.name}</td>
                        <td className="py-3 px-4">{festival.location}</td>
                        <td className="py-3 px-4">
                          {festival.region === 'bayern' && 'Bayern'}
                          {festival.region === 'tirol' && 'Tirol'}
                          {festival.region === 'oesterreich' && 'Österreich'}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(festival.startDate).toLocaleDateString('de-DE')} bis {' '}
                          {new Date(festival.endDate).toLocaleDateString('de-DE')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditFestival(festival)}
                              className="p-1 text-amber-800 hover:text-amber-900"
                              title="Bearbeiten"
                            >
                              <Edit size={20} />
                            </button>
                            <button
                              onClick={() => handleDeleteFestival(festival._id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Löschen"
                            >
                              <Trash size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-amber-800">
                        Keine Festivals gefunden. Fügen Sie ein neues Festival hinzu.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Subscribers Tab */}
        {activeTab === 'subscribers' && (
          <div>
            <h2 className="text-2xl font-bold text-amber-900 mb-6" style={{fontFamily: 'Palatino, Georgia, serif'}}>
              Abonnenten-Übersicht
            </h2>
            
            {/* Subscriber Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-6 shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-amber-900">Gesamt</h3>
                  <Users size={24} className="text-amber-700" />
                </div>
                <p className="text-3xl font-bold text-amber-800">{subscribers.total}</p>
                <p className="text-amber-700 text-sm mt-2">Registrierte Benutzer</p>
              </div>
              
              <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-6 shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-amber-900">Bayern</h3>
                  <Bell size={24} className="text-amber-700" />
                </div>
                <p className="text-3xl font-bold text-amber-800">{subscribers.byRegion.bayern}</p>
                <p className="text-amber-700 text-sm mt-2">Abonnenten für Bayern</p>
              </div>
              
              <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-6 shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-amber-900">Tirol</h3>
                  <Bell size={24} className="text-amber-700" />
                </div>
                <p className="text-3xl font-bold text-amber-800">{subscribers.byRegion.tirol}</p>
                <p className="text-amber-700 text-sm mt-2">Abonnenten für Tirol</p>
              </div>
              
              <div className="bg-amber-100 border-2 border-amber-300 rounded-lg p-6 shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-amber-900">Österreich</h3>
                  <Bell size={24} className="text-amber-700" />
                </div>
                <p className="text-3xl font-bold text-amber-800">{subscribers.byRegion.oesterreich}</p>
                <p className="text-amber-700 text-sm mt-2">Abonnenten für Österreich</p>
              </div>
            </div>
            
            {/* Subscribers by Festival */}
            <div className="bg-amber-100 border-2 border-amber-300 rounded-lg shadow">
              <div className="bg-amber-200 border-b-2 border-amber-300 py-3 px-4">
                <h3 className="text-lg font-bold text-amber-900">Abonnenten nach Festival</h3>
              </div>
              <div className="p-4">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-amber-300">
                      <th className="py-2 px-4 text-left text-amber-900">Festival</th>
                      <th className="py-2 px-4 text-right text-amber-900">Abonnenten</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.byFestival.map((item) => (
                      <tr key={item.id} className="border-b border-amber-300 hover:bg-amber-50">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4 text-right font-bold">{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 mt-auto border-t-4 border-amber-700">
        <div className="container mx-auto px-4 py-4 text-center">
          <p>&copy; 2025 VolksfestFinder Admin. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;
