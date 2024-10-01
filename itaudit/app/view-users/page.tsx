'use client';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  workstationName: string;
}

export default function ViewUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching users...');
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getUsers' }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setUsers(data);
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      setError(`Error fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUser', id }),
      });
      if (response.ok) {
        fetchUsers();
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (error: unknown) {
      setError(`Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditedUser({ ...user });
  };

  const handleSave = async () => {
    if (!editedUser) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateUser', data: editedUser }),
      });
      if (response.ok) {
        setUsers(users.map(u => u.id === editedUser.id ? editedUser : u));
        setEditingId(null);
        setEditedUser(null);
      } else {
        throw new Error('Failed to update user');
      }
    } catch (error: unknown) {
      setError(`Error updating user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof User) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: e.target.value });
    }
  };

  return (
    <Layout>
      <div className="bg-white bg-opacity-80 rounded-lg shadow-xl p-4 sm:p-8 backdrop-filter backdrop-blur-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">View Users</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p>No users found. Please add a user.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {users.map((user) => (
                <div key={user.id} className="bg-gray-100 p-4 rounded-lg shadow">
                  {editingId === user.id ? (
                    <>
                      {Object.entries(user).map(([key]) => (
                        key !== 'id' && (
                          <div key={key} className="mb-2">
                            <label htmlFor={`${user.id}-${key}`} className="block text-sm font-medium text-gray-700">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </label>
                            <input
                              type="text"
                              id={`${user.id}-${key}`}
                              value={editedUser?.[key as keyof User] || ''}
                              onChange={(e) => handleInputChange(e, key as keyof User)}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        )
                      ))}
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                      <p><strong>Email:</strong> {user.email}</p>
                      <p><strong>Phone:</strong> {user.phone}</p>
                      <p><strong>Workstation:</strong> {user.workstationName}</p>
                    </>
                  )}
                  <div className="mt-4 space-y-2">
                    {editingId === user.id ? (
                      <button 
                        onClick={handleSave}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEdit(user)}
                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}