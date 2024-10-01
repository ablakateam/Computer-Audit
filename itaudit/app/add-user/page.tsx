'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';

export default function AddUser() {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    workstationName: ''
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addUser',
          data: userData,
        }),
      });
      if (response.ok) {
        alert('User added successfully!');
        router.push('/view-users');
      } else {
        throw new Error('Failed to add user');
      }
    } catch (error: unknown) {
      console.error('Error adding user:', error);
      alert(`Error adding user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Layout>
      <div className="bg-white bg-opacity-80 rounded-lg shadow-xl p-4 sm:p-8 backdrop-filter backdrop-blur-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">Add User</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(userData).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key} className="block mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</label>
              <input
                type="text"
                id={key}
                name={key}
                value={value}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          ))}
          <button type="submit" className="w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add User
          </button>
        </form>
      </div>
    </Layout>
  );
}