'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../contexts/DarkModeContext';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { darkMode } = useDarkMode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password === '2024') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/');
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className={`px-8 py-6 mt-4 text-left ${darkMode ? 'bg-gray-700 text-white' : 'bg-white'} shadow-lg`}>
        <h3 className="text-2xl font-bold text-center">Login to IT Audit</h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                className={`w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-black'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button type="submit" className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900">Login</button>
            </div>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
}