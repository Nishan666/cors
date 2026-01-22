import { useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [view, setView] = useState('login');
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch(`${API_URL}/api/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        secretText: formData.get('secret')
      })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (data.userId) setMessage(`User created! ID: ${data.userId}`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: formData.get('userId'),
        secretText: formData.get('secret')
      })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    if (res.ok) setView('dashboard');
  };

  const fetchUser = async () => {
    const res = await fetch(`${API_URL}/api/user`, {
      credentials: 'include'
    });
    const data = await res.json();
    setUserData(data);
  };

  const updateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const res = await fetch(`${API_URL}/api/user`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: formData.get('name') })
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    fetchUser();
  };

  const handleLogout = async () => {
    await fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    setView('login');
    setUserData(null);
    setMessage('Logged out');
  };

  return (
    <div className="app">
      <h1>CORS Demo</h1>
      {message && <p className="message">{message}</p>}

      {view === 'login' && (
        <div>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input name="userId" placeholder="User ID" required />
            <input name="secret" type="password" placeholder="Secret" required />
            <button type="submit">Login</button>
          </form>
          <button onClick={() => setView('create')}>Create Account</button>
        </div>
      )}

      {view === 'create' && (
        <div>
          <h2>Create User</h2>
          <form onSubmit={handleCreate}>
            <input name="name" placeholder="Name" required />
            <input name="secret" type="password" placeholder="Secret" required />
            <button type="submit">Create</button>
          </form>
          <button onClick={() => setView('login')}>Back to Login</button>
        </div>
      )}

      {view === 'dashboard' && (
        <div>
          <h2>Dashboard</h2>
          <button onClick={fetchUser}>Get User Data</button>
          {userData && <pre>{JSON.stringify(userData, null, 2)}</pre>}
          <h3>Update Name</h3>
          <form onSubmit={updateUser}>
            <input name="name" placeholder="New Name" required />
            <button type="submit">Update</button>
          </form>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default App;
