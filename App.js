import React, { useState, useEffect } from 'react';
import { Calendar, Search, MapPin, Filter, Star, Ticket, Info, Bell, Map, List } from 'lucide-react';

const FestivalFinder = () => {
  // State Management
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [subscribedRegions, setSubscribedRegions] = useState([]);
  const [subscribedFestivals, setSubscribedFestivals] = useState([]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  
  // Festival Data
  const [festivals] = useState([
    {
      id: 1,
      name: "Oktoberfest",
      location: "München, Bayern",
      region: "bayern",
      startDate: new Date("2025-09-21"),
      endDate: new Date("2025-10-06"),
      description: "Das weltberühmte Bierfest mit traditioneller Musik, Trachten und bayerischer Kultur.",
      image: "/api/placeholder/500/300",
      coordinates: { latitude: 48.1351, longitude: 11.5820 }
    },
    {
      id: 2,
      name: "Almabtrieb",
      location: "Mayrhofen, Tirol",
      region: "tirol",
      startDate: new Date("2025-09-26"),
      endDate: new Date("2025-09-26"),
      description: "Traditionelles Fest zur Rückkehr der Kühe von den Almen ins Tal mit festlich geschmückten Tieren.",
      image: "/api/placeholder/500/300",
      coordinates: { latitude: 47.1639, longitude: 11.8656 }
    },
    {
      id: 3,
      name: "Salzburger Festspiele",
      location: "Salzburg, Österreich",
      region: "oesterreich",
      startDate: new Date("2025-07-18"),
      endDate: new Date("2025-08-30"),
      description: "Eines der bedeutendsten Festivals für Oper, Theater und klassische Musik in Europa.",
      image: "/api/placeholder/500/300",
      coordinates: { latitude: 47.8095, longitude: 13.0550 }
    },
    {
      id: 4,
      name: "Nürnberger Christkindlesmarkt",
      location: "Nürnberg, Bayern",
      region: "bayern",
      startDate: new Date("2025-11-28"),
      endDate: new Date("2025-12-24"),
      description: "Einer der ältesten und bekanntesten Weihnachtsmärkte Deutschlands.",
      image: "/api/placeholder/500/300",
      coordinates: { latitude: 49.4521, longitude: 11.0767 }
    },
    {
      id: 5,
      name: "Wiener Opernball",
      location: "Wien, Österreich",
      region: "oesterreich",
      startDate: new Date("2025-02-20"),
      endDate: new Date("2025-02-20"),
      description: "Gesellschaftliches Großereignis der Wiener Ballsaison in der Wiener Staatsoper.",
      image: "/api/placeholder/500/300",
      coordinates: { latitude: 48.2035, longitude: 16.3694 }
    }
  ]);
  
  // Load user data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(user));
      fetchSubscriptions();
    }
  }, []);
  
  // Fetch user subscriptions (dummy implementation)
  const fetchSubscriptions = () => {
    // Dummy data for demonstration
    setSubscribedRegions(['bayern']);
    setSubscribedFestivals([1, 3]);
  };
  
  // Filter festivals based on selected criteria
  const filteredFestivals = festivals.filter(festival => {
    // Match region
    const matchesRegion = selectedRegion === 'all' || festival.region === selectedRegion;
    
    // Match search term
    const matchesSearch = searchTerm === '' || 
                          festival.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          festival.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          festival.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Match calendar selection
    let matchesCalendar = true;
    if (viewMode === 'calendar') {
      const festivalStartMonth = festival.startDate.getMonth();
      const festivalStartYear = festival.startDate.getFullYear();
      const festivalEndMonth = festival.endDate.getMonth();
      const festivalEndYear = festival.endDate.getFullYear();
      
      matchesCalendar = (
        (festivalStartMonth === selectedMonth && festivalStartYear === selectedYear) ||
        (festivalEndMonth === selectedMonth && festivalEndYear === selectedYear) ||
        (
          new Date(festivalStartYear, festivalStartMonth) <= new Date(selectedYear, selectedMonth) &&
          new Date(festivalEndYear, festivalEndMonth) >= new Date(selectedYear, selectedMonth)
        )
      );
    }
    
    return matchesRegion && matchesSearch && matchesCalendar;
  });
  
  // German month names
  const months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  
  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      // Dummy login for demonstration
      const dummyUser = { id: 1, username: 'testuser', email: loginData.email };
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('user', JSON.stringify(dummyUser));
      
      setIsAuthenticated(true);
      setCurrentUser(dummyUser);
      setShowLoginModal(false);
      fetchSubscriptions();
    } catch (error) {
      console.error('Login-Fehler:', error);
      setAuthError('Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.');
    }
  };
  
  // Handle registration
  const handleRegister = (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      // Dummy registration for demonstration
      const dummyUser = { 
        id: 1, 
        username: registerData.username, 
        email: registerData.email 
      };
      localStorage.setItem('token', 'dummy-token');
      localStorage.setItem('user', JSON.stringify(dummyUser));
      
      setIsAuthenticated(true);
      setCurrentUser(dummyUser);
      setShowRegisterModal(false);
      fetchSubscriptions();
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      setAuthError('Registrierung fehlgeschlagen. Möglicherweise existiert diese E-Mail-Adresse bereits.');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSubscribedRegions([]);
    setSubscribedFestivals([]);
  };
  
  // Toggle region subscription
  const toggleRegionSubscription = (region) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      const isSubscribed = subscribedRegions.includes(region);
      let updatedRegions;
      
      if (isSubscribed) {
        updatedRegions = subscribedRegions.filter(r => r !== region);
      } else {
        updatedRegions = [...subscribedRegions, region];
      }
      
      setSubscribedRegions(updatedRegions);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Regions-Abonnements:', error);
    }
  };
  
  // Toggle festival subscription
  const toggleFestivalSubscription = (festivalId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    try {
      const isSubscribed = subscribedFestivals.includes(festivalId);
      
      if (isSubscribed) {
        setSubscribedFestivals(subscribedFestivals.filter(id => id !== festivalId));
      } else {
        setSubscribedFestivals([...subscribedFestivals, festivalId]);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Festival-Abonnements:', error);
    }
  };
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Render login modal
  const renderLoginModal = () => {
    if (!showLoginModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-amber-50 rounded-lg shadow-xl p-6 max-w-md w-full border-2 border-amber-800">
          <h2 className="text-xl font-bold text-amber-900 mb-4" style={{fontFamily: 'Palatino, Georgia, serif'}}>
            Anmelden
          </h2>
          
          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-amber-900 mb-1" htmlFor="login-email">
                E-Mail
              </label>
              <input
                id="login-email"
                type="email"
                className="w-full p-2 border border-amber-400 rounded bg-amber-100"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-amber-900 mb-1" htmlFor="login-password">
                Passwort
              </label>
              <input
                id="login-password"
                type="password"
                className="w-full p-2 border border-amber-400 rounded bg-amber-100"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
              />
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                className="py-2 px-4 border-2 border-amber-400 text-amber-900 rounded hover:bg-amber-200"
                onClick={() => {
                  setShowLoginModal(false);
                  setAuthError('');
                }}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-amber-800 text-amber-100 rounded hover:bg-amber-900"
              >
                Anmelden
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-amber-800">
                Noch kein Konto?{' '}
                <button
                  type="button"
                  className="text-amber-900 font-medium hover:underline"
                  onClick={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                    setAuthError('');
                  }}
                >
                  Jetzt registrieren
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Render registration modal
  const renderRegisterModal = () => {
    if (!showRegisterModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-amber-50 rounded-lg shadow-xl p-6 max-w-md w-full border-2 border-amber-800">
          <h2 className="text-xl font-bold text-amber-900 mb-4" style={{fontFamily: 'Palatino, Georgia, serif'}}>
            Registrieren
          </h2>
          
          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-amber-900 mb-1" htmlFor="register-username">
                Benutzername
              </label>
              <input
                id="register-username"
                type="text"
                className="w-full p-2 border border-amber-400 rounded bg-amber-100"
                value={registerData.username}
                onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-amber-900 mb-1" htmlFor="register-email">
                E-Mail
              </label>
              <input
                id="register-email"
                type="email"
                className="w-full p-2 border border-amber-400 rounded bg-amber-100"
                value={registerData.email}
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-amber-900 mb-1" htmlFor="register-password">
                Passwort
              </label>
              <input
                id="register-password"
                type="password"
                className="w-full p-2 border border-amber-400 rounded bg-amber-100"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                required
              />
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                className="py-2 px-4 border-2 border-amber-400 text-amber-900 rounded hover:bg-amber-200"
                onClick={() => {
                  setShowRegisterModal(false);
                  setAuthError('');
                }}
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="py-2 px-4 bg-amber-800 text-amber-100 rounded hover:bg-amber-900"
              >
                Registrieren
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-amber-800">
                Bereits registriert?{' '}
                <button
                  type="button"
                  className="text-amber-900 font-medium hover:underline"
                  onClick={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                    setAuthError('');
                  }}
                >
                  Anmelden
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  // Render calendar view
  const renderCalendarView = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday as first day
    
    // Create days for calendar
    const days = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null); // Empty cells before first day of month
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Find festivals for each day
    const festivalsByDay = {};
    filteredFestivals.forEach(festival => {
      const start = new Date(festival.startDate);
      const end = new Date(festival.endDate);
      
      // Only if festival is in selected month/year
      if (
        (start.getMonth() === selectedMonth && start.getFullYear() === selectedYear) ||
        (end.getMonth() === selectedMonth && end.getFullYear() === selectedYear) ||
        (start <= new Date(selectedYear, selectedMonth, 1) && end >= new Date(selectedYear, selectedMonth + 1, 0))
      ) {
        // Determine start and end of festival in current month
        const startDay = start.getMonth() === selectedMonth && start.getFullYear() === selectedYear
          ? start.getDate()
          : 1;
          
        const endDay = end.getMonth() === selectedMonth && end.getFullYear() === selectedYear
          ? end.getDate()
          : daysInMonth;
          
        // Add festivals for each day in the range
        for (let day = startDay; day <= endDay; day++) {
          if (!festivalsByDay[day]) {
            festivalsByDay[day] = [];
          }
          festivalsByDay[day].push(festival);
        }
      }
    });
    
    return (
      <div className="mb-8">
        <div className="bg-amber-100 rounded-lg border-2 border-amber-300 shadow-md overflow-hidden">
          {/* Calendar Navigation */}
          <div className="bg-amber-200 p-4 border-b-2 border-amber-300 flex justify-between items-center">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(selectedYear - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="p-2 bg-amber-800 text-amber-100 rounded hover:bg-amber-900"
            >
              &lt;
            </button>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="p-2 bg-amber-50 border-2 border-amber-400 rounded"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="p-2 bg-amber-50 border-2 border-amber-400 rounded"
              >
                {Array.from({length: 5}, (_, i) => 2024 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(selectedYear + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="p-2 bg-amber-800 text-amber-100 rounded hover:bg-amber-900"
            >
              &gt;
            </button>
          </div>
          
          {/* Calendar */}
          <div className="p-4">
            {/* Weekdays */}
            <div className="grid grid-cols-7 mb-2 text-center font-bold text-amber-900">
              <div>Mo</div>
              <div>Di</div>
              <div>Mi</div>
              <div>Do</div>
              <div>Fr</div>
              <div>Sa</div>
              <div>So</div>
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 p-1 border ${
                    day 
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-amber-100 border-transparent'
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-right text-amber-900 font-bold">{day}</div>
                      {festivalsByDay[day] && (
                        <div className="mt-1">
                          {festivalsByDay[day].map(festival => (
                            <div
                              key={festival.id}
                              className="text-xs p-1 mb-1 rounded bg-amber-300 truncate"
                              title={festival.name}
                            >
                              {festival.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* List of festivals in selected month */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-amber-900 mb-4 border-b-2 border-amber-300 pb-2" style={{fontFamily: 'Palatino, Georgia, serif'}}>
            Festivals im {months[selectedMonth]} {selectedYear}:
          </h3>
          
          {filteredFestivals.length > 0 ? (
            <ul className="space-y-4">
              {filteredFestivals.map(festival => (
                <li key={festival.id} className="bg-amber-100 p-4 rounded border-2 border-amber-300">
                  <div className="flex justify-between">
                    <h4 className="text-lg font-bold text-amber-900">{festival.name}</h4>
                    <div>
                      <button
                        onClick={() => toggleFestivalSubscription(festival.id)}
                        className={`p-1 ${
                          subscribedFestivals.includes(festival.id)
                            ? 'text-amber-600'
                            : 'text-amber-400'
                        }`}
                        title={
                          subscribedFestivals.includes(festival.id)
                            ? 'Abonnement beenden'
                            : 'Festival abonnieren'
                        }
                      >
                        <Bell size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-800 mt-1">
                    <MapPin size={16} className="mr-1" />
                    <span>{festival.location}</span>
                  </div>
                  <div className="flex items-center text-amber-800 mt-1">
                    <Calendar size={16} className="mr-1" />
                    <span>
                      {formatDate(festival.startDate)}
                      {festival.startDate.toDateString() !== festival.endDate.toDateString() && (
                        <> bis {formatDate(festival.endDate)}</>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-amber-800">Keine Festivals in diesem Monat gefunden.</p>
          )}
        </div>
      </div>
    );
  };
  
  // Render map view
  const renderMapView = () => {
    return (
      <div className="mb-8">
        <div className="bg-amber-100 rounded-lg border-2 border-amber-300 shadow-md overflow-hidden relative">
          {/* Map placeholder */}
          <div className="h-96 bg-amber-50 flex items-center justify-center">
            <div className="text-center p-6">
              <Map size={48} className="mx-auto text-amber-800 mb-4" />
              <h3 className="text-xl font-bold text-amber-900 mb-2" style={{fontFamily: 'Palatino, Georgia, serif'}}>
                Karte der Festivals
              </h3>
              <p className="text-amber-800">
                In einer echten Anwendung würde hier eine interaktive Karte mit Markierungen für die Festivals angezeigt.
                <br />Die Karte könnte mit Google Maps, Leaflet oder einer anderen Kartenbibliothek implementiert werden.
              </p>
              
              {/* Coordinates for filtered festivals */}
              <div className="mt-4 text-left max-w-md mx-auto">
                <h4 className="font-bold text-amber-900 mb-2">Festival-Koordinaten:</h4>
                <ul className="space-y-2">
                  {filteredFestivals.map(festival => (
                    <li key={festival.id} className="flex justify-between">
                      <span>{festival.name}:</span>
                      <span>
                        {festival.coordinates.latitude.toFixed(4)}, {festival.coordinates.longitude.toFixed(4)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* List of festivals on the map */}
        <div className="mt-6">
          <h3 className="text-xl font-bold text-amber-900 mb-4 border-b-2 border-amber-300 pb-2" style={{fontFamily: 'Palatino, Georgia, serif'}}>
            Festivals in der Karte:
          </h3>
          
          {filteredFestivals.length > 0 ? (
            <ul className="space-y-4">
              {filteredFestivals.map(festival => (
                <li key={festival.id} className="bg-amber-100 p-4 rounded border-2 border-amber-300">
                  <div className="flex justify-between">
                    <h4 className="text-lg font-bold text-amber-900">{festival.name}</h4>
                    <div>
                      <button
                        onClick={() => toggleFestivalSubscription(festival.id)}
                        className={`p-1 ${
                          subscribedFestivals.includes(festival.id)
                            ? 'text-amber-600'
                            : 'text-amber-400'
                        }`}
                        title={
                          subscribedFestivals.includes(festival.id)
                            ? 'Abonnement beenden'
                            : 'Festival abonnieren'
                        }
                      >
                        <Bell size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-800 mt-1">
                    <MapPin size={16} className="mr-1" />
                    <span>{festival.location}</span>
                  </div>
                  <div className="flex items-center text-amber-800 mt-1">
                    <Calendar size={16} className="mr-1" />
                    <span>
                      {formatDate(festival.startDate)}
                      {festival.startDate.toDateString() !== festival.endDate.toDateString() && (
                        <> bis {formatDate(festival.endDate)}</>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-amber-800">Keine Festivals gefunden.</p>
          )}
        </div>
      </div>
    );
  };
  
  // Render list view
  const renderListView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredFestivals.map(festival => (
          <div key={festival.id} className="bg-amber-100 rounded overflow-hidden shadow-md border-2 border-amber-300 transition-transform hover:scale-105">
            <img src={festival.image} alt={festival.name} className="w-full h-48 object-cover border-b-2 border-amber-300" />
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-amber-900" style={{fontFamily: 'Palatino, Georgia, serif'}}>{festival.name}</h3>
                <button
                  onClick={() => toggleFestivalSubscription(festival.id)}
                  className={`p-1 ${
                    subscribedFestivals.includes(festival.id)
                      ? 'text-amber-600'
                      : 'text-amber-400'
                  }`}
                  title={
                    subscribedFestivals.includes(festival.id)
                      ? 'Abonnement beenden'
                      : 'Festival abonnieren'
                  }
                >
                  <Bell size={18} />
                </button>
              </div>
              <div className="flex items-center text-amber-800 mb-2">
                <MapPin size={16} className="mr-1" />
                <span>{festival.location}</span>
              </div>
              <div className="flex items-center text-amber-800 mb-4">
                <Calendar size={16} className="mr-1" />
                <span>
                  {formatDate(festival.startDate)}
                  {festival.startDate.toDateString() !== festival.endDate.toDateString() && (
                    <> bis {formatDate(festival.endDate)}</>
                  )}
                </span>
              </div>
              <p className="text-amber-900 mb-4">{festival.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-amber-300">
                <button className="flex items-center text-amber-900 hover:text-amber-700 font-medium">
                  <Info size={16} className="mr-1" />
                  <span>Mehr erfahren</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-amber-600 hover:text-amber-800">
                    <Star size={18} />
                  </button>
                  <button className="p-2 text-green-700 hover:text-green-900">
                    <Ticket size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Main rendering
  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-900 text-amber-100 shadow-md border-b-4 border-amber-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar size={28} />
              <h1 className="text-2xl font-bold" style={{fontFamily: 'Palatino, Georgia, serif'}}>VolksfestFinder</h1>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="hover:text-amber-300 font-medium">Startseite</a>
              <a href="#" className="hover:text-amber-300 font-medium">Festivals</a>
              <a href="#" className="hover:text-amber-300 font-medium">Regionen</a>
              <a href="#" className="hover:text-amber-300 font-medium">Über uns</a>
              <a href="#" className="hover:text-amber-300 font-medium">Kontakt</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-amber-200 hidden md:inline">
                    Hallo, {currentUser.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-amber-800 hover:bg-amber-700 text-amber-100 py-1 px-3 rounded border border-amber-700"
                  >
                    Abmelden
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-amber-100 hover:text-amber-300"
                  >
                    Anmelden
                  </button>
                  <span className="text-amber-500">|</span>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="text-amber-100 hover:text-amber-300"
                  >
                    Registrieren
                  </button>
                </div>
              )}
              
              <button className="md:hidden">
                <Filter size={24} />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <div className="bg-amber-800 text-amber-50 border-b-4 border-amber-900 relative overflow-hidden" 
           style={{
             backgroundImage: 'repeating-linear-gradient(45deg, rgba(215, 140, 30, 0.1), rgba(215, 140, 30, 0.1) 10px, transparent 10px, transparent 20px), repeating-linear-gradient(-45deg, rgba(215, 140, 30, 0.1), rgba(215, 140, 30, 0.1) 10px, transparent 10px, transparent 20px)',
             backgroundSize: '100px 100px'
           }}>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Palatino, Georgia, serif'}}>Entdecke die schönsten Volksfeste</h2>
          <p className="text-xl mb-8">Traditionelle Feste in Bayern, Tirol und Österreich</p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex bg-amber-100 rounded overflow-hidden shadow-lg border-2 border-amber-800">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Suche nach Festivalnamen, Orten oder Beschreibungen..." 
                className="w-full px-4 py-3 text-amber-900 focus:outline-none bg-amber-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-amber-800 hover:bg-amber-900 text-amber-100 px-6 flex items-center border-l-2 border-amber-900">
              <Search size={20} />
              <span className="ml-2 hidden sm:inline">Suchen</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Region Filter */}
      <div className="bg-amber-100 shadow border-b-2 border-amber-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="font-medium text-amber-900 flex items-center" style={{fontFamily: 'Palatino, Georgia, serif'}}>
              <MapPin size={18} className="mr-1" />
              Region filtern:
            </span>
            <button 
              className={`px-4 py-2 border-2 ${selectedRegion === 'all' ? 'bg-amber-800 text-amber-100 border-amber-900' : 'bg-amber-200 text-amber-900 border-amber-300 hover:bg-amber-300'}`}
              onClick={() => setSelectedRegion('all')}
              style={{borderRadius: '4px'}}
            >
              Alle Regionen
            </button>
            <button 
              className={`px-4 py-2 border-2 flex items-center ${selectedRegion === 'bayern' ? 'bg-amber-800 text-amber-100 border-amber-900' : 'bg-amber-200 text-amber-900 border-amber-300 hover:bg-amber-300'}`}
              onClick={() => setSelectedRegion('bayern')}
              style={{borderRadius: '4px'}}
            >
              Bayern
              {isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRegionSubscription('bayern');
                  }}
                  className={`ml-2 ${
                    subscribedRegions.includes('bayern')
                      ? 'text-amber-600'
                      : 'text-amber-400'
                  }`}
                  title={
                    subscribedRegions.includes('bayern')
                      ? 'Abonnement beenden'
                      : 'Region abonnieren'
                  }
                >
                  <Bell size={16} />
                </button>
              )}
            </button>
            <button 
              className={`px-4 py-2 border-2 flex items-center ${selectedRegion === 'tirol' ? 'bg-amber-800 text-amber-100 border-amber-900' : 'bg-amber-200 text-amber-900 border-amber-300 hover:bg-amber-300'}`}
              onClick={() => setSelectedRegion('tirol')}
              style={{borderRadius: '4px'}}
            >
              Tirol
              {isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRegionSubscription('tirol');
                  }}
                  className={`ml-2 ${
                    subscribedRegions.includes('tirol')
                      ? 'text-amber-600'
                      : 'text-amber-400'
                  }`}
                  title={
                    subscribedRegions.includes('tirol')
                      ? 'Abonnement beenden'
                      : 'Region abonnieren'
                  }
                >
                  <Bell size={16} />
                </button>
              )}
            </button>
            <button 
              className={`px-4 py-2 border-2 flex items-center ${selectedRegion === 'oesterreich' ? 'bg-amber-800 text-amber-100 border-amber-900' : 'bg-amber-200 text-amber-900 border-amber-300 hover:bg-amber-300'}`}
              onClick={() => setSelectedRegion('oesterreich')}
              style={{borderRadius: '4px'}}
            >
              Österreich
              {isAuthenticated && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRegionSubscription('oesterreich');
                  }}
                  className={`ml-2 ${
                    subscribedRegions.includes('oesterreich')
                      ? 'text-amber-600'
                      : 'text-amber-400'
                  }`}
                  title={
                    subscribedRegions.includes('oesterreich')
                      ? 'Abonnement beenden'
                      : 'Region abonnieren'
                  }
                >
                  <Bell size={16} />
                </button>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* View Toggle */}
      <div className="bg-amber-100 border-b-2 border-amber-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setViewMode('list')}
              className={`py-2 px-4 flex items-center ${
                viewMode === 'list'
                  ? 'bg-amber-800 text-amber-100 rounded border border-amber-900'
                  : 'text-amber-900 hover:bg-amber-200 rounded'
              }`}
            >
              <List size={18} className="mr-2" />
              <span>Liste</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`py-2 px-4 flex items-center ${
                viewMode === 'map'
                  ? 'bg-amber-800 text-amber-100 rounded border border-amber-900'
                  : 'text-amber-900 hover:bg-amber-200 rounded'
              }`}
            >
              <Map size={18} className="mr-2" />
              <span>Karte</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`py-2 px-4 flex items-center ${
                viewMode === 'calendar'
                  ? 'bg-amber-800 text-amber-100 rounded border border-amber-900'
                  : 'text-amber-900 hover:bg-amber-200 rounded'
              }`}
            >
              <Calendar size={18} className="mr-2" />
              <span>Kalender</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Festival Listings */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-6 border-b-2 border-amber-300 pb-2" style={{fontFamily: 'Palatino, Georgia, serif'}}>
          {filteredFestivals.length > 0 
            ? `${filteredFestivals.length} Festivals gefunden` 
            : "Keine Festivals gefunden"}
        </h2>
        
        {/* Different Views */}
        {viewMode === 'list' && renderListView()}
        {viewMode === 'map' && renderMapView()}
        {viewMode === 'calendar' && renderCalendarView()}
      </main>
      
      {/* Modals */}
      {renderLoginModal()}
      {renderRegisterModal()}
    </div>
  );
};

export default FestivalFinder;
