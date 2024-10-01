'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../components/Layout';

export default function AddNetworkDevice() {
  const [deviceData, setDeviceData] = useState({
    name: '',
    ipAddress: '',
    type: '',
    model: '',
    location: '',
    managementUrl: '',
    notes: ''
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeviceData(prev => ({ ...prev, [name]: value }));
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
          action: 'addNetworkDevice',
          data: deviceData,
        }),
      });
      const result = await response.json();
      console.log('Server response:', result);
      if (response.ok) {
        alert('Network device added successfully!');
        router.push('/view-network-devices');
      } else {
        throw new Error(result.message || 'Failed to add network device');
      }
    } catch (error: unknown) {
      console.error('Error adding network device:', error);
      alert(`Error adding network device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Layout>
      <div className="bg-white bg-opacity-80 rounded-lg shadow-xl p-8 backdrop-filter backdrop-blur-lg">
        <h1 className="text-2xl font-bold mb-4">Add Network Device</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.entries(deviceData).map(([key, value]) => (
            <div key={key}>
              <label htmlFor={key} className="block mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</label>
              {key === 'notes' ? (
                <textarea
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required={key !== 'notes'}
                />
              ) : (
                <input
                  type="text"
                  id={key}
                  name={key}
                  value={value}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required={key !== 'notes'}
                />
              )}
            </div>
          ))}
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Network Device
          </button>
        </form>
      </div>
    </Layout>
  );
}