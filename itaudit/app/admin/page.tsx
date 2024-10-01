'use client';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface SiteContent {
  key: string;
  value: string;
}

interface AuthUser {
  id: number;
  username: string;
  role: string;
}

interface AuthUserUpdate extends AuthUser {
  password?: string;
}

export default function AdminDashboard() {
  const [content, setContent] = useState<SiteContent[]>([]);
  const [editedContent, setEditedContent] = useState<{[key: string]: string}>({});
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteContent();
    fetchAuthUsers();
  }, []);

  async function fetchSiteContent() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSiteContent' }),
      });
      if (response.ok) {
        const data = await response.json();
        setContent(data);
        setEditedContent(data.reduce((acc: {[key: string]: string}, item: SiteContent) => {
          acc[item.key] = item.value;
          return acc;
        }, {}));
      } else {
        throw new Error('Failed to fetch site content');
      }
    } catch (error: unknown) {
      setError(`Error fetching site content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchAuthUsers() {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getAuthUsers' }),
      });
      if (response.ok) {
        const data = await response.json();
        setAuthUsers(data);
      } else {
        throw new Error('Failed to fetch auth users');
      }
    } catch (error: unknown) {
      setError(`Error fetching auth users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleSave() {
    setSaveStatus('Saving...');
    try {
      const updatePromises = Object.entries(editedContent).map(([key, value]) => 
        fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateSiteContent', data: { key, value } }),
        })
      );

      const results = await Promise.all(updatePromises);
      if (results.every(res => res.ok)) {
        setSaveStatus('Saved successfully!');
        fetchSiteContent(); // Refresh content after save
      } else {
        throw new Error('Failed to update some site content');
      }
    } catch (error: unknown) {
      setError(`Error updating site content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSaveStatus('Save failed');
    }
  }

  function handleInputChange(key: string, value: string) {
    setEditedContent(prev => ({ ...prev, [key]: value }));
  }

  async function handleAddUser() {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addAuthUser', data: newUser }),
      });
      if (response.ok) {
        setNewUser({ username: '', password: '', role: 'user' });
        fetchAuthUsers();
      } else {
        throw new Error('Failed to add auth user');
      }
    } catch (error: unknown) {
      setError(`Error adding auth user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleUpdateUser(user: AuthUser) {
    const newPassword = prompt('Enter new password (leave empty to keep current password)');
    if (newPassword === null) return; // User cancelled the prompt

    const updatedUser: AuthUserUpdate = { ...user };
    if (newPassword) {
      updatedUser.password = newPassword;
    }

    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateAuthUser', data: updatedUser }),
      });
      if (response.ok) {
        fetchAuthUsers();
      } else {
        throw new Error('Failed to update auth user');
      }
    } catch (error: unknown) {
      setError(`Error updating auth user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async function handleDeleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteAuthUser', id }),
      });
      if (response.ok) {
        fetchAuthUsers();
      } else {
        throw new Error('Failed to delete auth user');
      }
    } catch (error: unknown) {
      setError(`Error deleting auth user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return (
    <Layout>
      <div className="bg-white bg-opacity-80 rounded-lg shadow-xl p-4 sm:p-8 backdrop-filter backdrop-blur-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Admin Dashboard</h1>
        
        {/* Site Content Section */}
        <h2 className="text-xl font-bold mb-2">Site Content</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="space-y-4 mb-8">
            {content.map((item) => (
              <div key={item.key} className="flex flex-col space-y-2">
                <label htmlFor={item.key} className="font-semibold">{item.key.replace(/_/g, ' ').toUpperCase()}</label>
                <input
                  type="text"
                  id={item.key}
                  value={editedContent[item.key] || ''}
                  onChange={(e) => handleInputChange(item.key, e.target.value)}
                  className="border rounded p-2"
                />
              </div>
            ))}
            <button
              onClick={handleSave}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
            {saveStatus && <p className="mt-2 text-green-600">{saveStatus}</p>}
          </div>
        )}

        {/* Auth Users Section */}
        <h2 className="text-xl font-bold mb-2">Authenticated Users</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="border rounded p-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="border rounded p-2"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              className="border rounded p-2"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleAddUser}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add User
          </button>
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Existing Users</h3>
          <ul className="space-y-2">
            {authUsers.map((user) => (
              <li key={user.id} className="flex items-center space-x-2">
                <span>{user.username} ({user.role})</span>
                <button
                  onClick={() => handleUpdateUser(user)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
}