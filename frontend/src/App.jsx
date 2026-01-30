import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

const API_URL = 'https://3bukmo18b0.execute-api.us-east-1.amazonaws.com';

function App() {
  const [view, setView] = useState('login');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/user`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setView('dashboard');
      }
    } catch (err) {
      // User not authenticated, stay on login
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    try {
      const res = await fetch(`${API_URL}/api/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          message: formData.get('message'),
          password: formData.get('password')
        })
      });
      const data = await res.json();
      if (data.userId) {
        toast.success(`Account created! Your ID: ${data.userId}`);
        setTimeout(() => setView('login'), 2000);
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          password: formData.get('password')
        })
      });
      const data = await res.json();
      if (res.ok) {
        setView('dashboard');
        fetchUser();
        toast.success('Logged in successfully!');
      } else {
        toast.error(data.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    const res = await fetch(`${API_URL}/api/user`, {
      credentials: 'include'
    });
    const data = await res.json();
    setUserData(data);
  };

  const updateMessage = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    try {
      const res = await fetch(`${API_URL}/api/user`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: formData.get('message') })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Message updated successfully!');
        setIsEditing(false);
        fetchUser();
      } else {
        toast.error(data.error || 'Update failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setView('login');
      setUserData(null);
      setIsEditing(false);
      toast.success('Logged out successfully!');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="container">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
          },
          success: {
            iconTheme: {
              primary: '#667eea',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      {loading ? (
        <div className="card">
          <h1>🌐 CORS</h1>
          <p style={{ textAlign: 'center', color: '#b0b0b0' }}>Loading...</p>
        </div>
      ) : (
        <div className="card">
          <h1>🌐 CORS</h1>
        
        {view === 'login' && (
          <>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input name="name" placeholder="Name" required disabled={loading} />
              <input name="password" type="password" placeholder="Password" required disabled={loading} />
              <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
            </form>
            <div className="btn-group">
              <button className="secondary" onClick={() => setView('create')} disabled={loading}>Create Account</button>
            </div>
          </>
        )}

        {view === 'create' && (
          <>
            <h2>Create Account</h2>
            <form onSubmit={handleCreate}>
              <input name="name" placeholder="Name" required disabled={loading} />
              <textarea name="message" placeholder="Message" rows="4" required disabled={loading} />
              <input name="password" type="password" placeholder="Password" required disabled={loading} />
              <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
            </form>
            <div className="btn-group">
              <button className="secondary" onClick={() => setView('login')} disabled={loading}>Back</button>
            </div>
          </>
        )}

        {view === 'dashboard' && userData && (
          <>
            <h2>Welcome, {userData.name}!</h2>
            <div className="user-info">
              <p><strong>Message:</strong></p>
              <div className="message-box">{userData.message}</div>
            </div>
            
            {!isEditing ? (
              <div className="btn-group">
                <button onClick={() => setIsEditing(true)} disabled={loading || isLoggingOut}>Edit Message</button>
              </div>
            ) : (
              <>
                <h3>Edit Message</h3>
                <form onSubmit={updateMessage}>
                  <textarea name="message" defaultValue={userData.message} rows="4" required disabled={loading} />
                  <button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update'}</button>
                  <button type="button" className="secondary" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</button>
                </form>
              </>
            )}
            
            <div className="btn-group">
              <button className="secondary logout-btn" onClick={handleLogout} disabled={loading || isLoggingOut}>{isLoggingOut ? 'Logging out...' : 'Logout'}</button>
            </div>
          </>
        )}
      </div>
      )}
    </div>
  );
}

export default App;
