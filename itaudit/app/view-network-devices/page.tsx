'use client';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

interface NetworkDevice {
  id: number;
  name: string;
  ipAddress: string;
  type: string;
  model: string;
  location: string;
  managementUrl: string;
  notes: string;
}

interface Comment {
  id: number;
  deviceId: number;
  content: string;
  timestamp: string;
}

export default function ViewNetworkDevices() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<{[key: number]: Comment[]}>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedDevice, setEditedDevice] = useState<NetworkDevice | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchNetworkDevices();
  }, []);

  async function fetchNetworkDevices() {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching network devices...');
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getNetworkDevices' }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setDevices(data);
      } else {
        throw new Error(data.message || 'Failed to fetch network devices');
      }
    } catch (error: unknown) {
      console.error('Error fetching network devices:', error);
      setError(`Error fetching network devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchComments(deviceId: number) {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getNetworkDeviceComments', id: deviceId }),
      });
      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({ ...prev, [deviceId]: data }));
        setSelectedDeviceId(deviceId);
        setIsModalOpen(true);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error: unknown) {
      setError(`Error fetching comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this network device?')) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteNetworkDevice', id }),
      });
      if (response.ok) {
        fetchNetworkDevices();
      } else {
        throw new Error('Failed to delete network device');
      }
    } catch (error: unknown) {
      setError(`Error deleting network device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (device: NetworkDevice) => {
    setEditingId(device.id);
    setEditedDevice({ ...device });
  };

  const handleSave = async () => {
    if (!editedDevice) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateNetworkDevice', data: editedDevice }),
      });
      if (response.ok) {
        setDevices(devices.map(d => d.id === editedDevice.id ? editedDevice : d));
        setEditingId(null);
        setEditedDevice(null);
      } else {
        throw new Error('Failed to update network device');
      }
    } catch (error: unknown) {
      setError(`Error updating network device: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof NetworkDevice) => {
    if (editedDevice) {
      setEditedDevice({ ...editedDevice, [field]: e.target.value });
    }
  };

  const handleDeleteComment = async (deviceId: number, commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteNetworkDeviceComment', id: commentId }),
      });
      if (response.ok) {
        // Update the comments state after successful deletion
        setComments(prevComments => ({
          ...prevComments,
          [deviceId]: prevComments[deviceId].filter(comment => comment.id !== commentId)
        }));
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error: unknown) {
      setError(`Error deleting comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddComment = async (deviceId: number, comment: string) => {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addNetworkDeviceComment', id: deviceId, comment }),
      });
      if (response.ok) {
        setNotification('Comment added successfully!');
        setTimeout(() => setNotification(null), 3000); // Clear notification after 3 seconds
        fetchComments(deviceId); // Refresh comments
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error: unknown) {
      setError(`Error adding comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Layout>
      <div className="bg-white bg-opacity-80 rounded-lg shadow-xl p-4 sm:p-8 backdrop-filter backdrop-blur-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">View Network Devices</h1>
        {notification && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{notification}</span>
          </div>
        )}
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : devices.length === 0 ? (
          <p>No network devices found. Please add a network device.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {devices.map((device) => (
                <div key={device.id} className="bg-gray-100 p-4 rounded-lg shadow">
                  {editingId === device.id ? (
                    <>
                      {Object.entries(device).map(([key]) => (
                        key !== 'id' && (
                          <div key={key} className="mb-2">
                            <label htmlFor={`${device.id}-${key}`} className="block text-sm font-medium text-gray-700">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </label>
                            {key === 'notes' ? (
                              <textarea
                                id={`${device.id}-${key}`}
                                value={editedDevice?.[key as keyof NetworkDevice] || ''}
                                onChange={(e) => handleInputChange(e, key as keyof NetworkDevice)}
                                className="w-full p-2 border rounded"
                                rows={3}
                              />
                            ) : (
                              <input
                                type="text"
                                id={`${device.id}-${key}`}
                                value={editedDevice?.[key as keyof NetworkDevice] || ''}
                                onChange={(e) => handleInputChange(e, key as keyof NetworkDevice)}
                                className="w-full p-2 border rounded"
                              />
                            )}
                          </div>
                        )
                      ))}
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-2">{device.name}</h2>
                      <p><strong>IP:</strong> {device.ipAddress}</p>
                      <p><strong>Type:</strong> {device.type}</p>
                      <p><strong>Model:</strong> {device.model}</p>
                      <p><strong>Location:</strong> {device.location}</p>
                    </>
                  )}
                  <div className="mt-4 space-y-2">
                    <Link 
                      href={`/view-network-devices/${device.id}`}
                      className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      View Details
                    </Link>
                    {editingId === device.id ? (
                      <button 
                        onClick={handleSave}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEdit(device)}
                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(device.id)} 
                      className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => fetchComments(device.id)} 
                      className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    >
                      View Comments
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {isModalOpen && selectedDeviceId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Comments for Network Device ID: {selectedDeviceId}</h2>
              {comments[selectedDeviceId]?.length > 0 ? (
                <ul className="space-y-4">
                  {comments[selectedDeviceId].map((comment) => (
                    <li key={comment.id} className="flex justify-between items-start border-b pb-2">
                      <div>
                        <p className="font-bold">{new Date(comment.timestamp).toLocaleString()}</p>
                        <p>{comment.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(selectedDeviceId, comment.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No comments for this network device.</p>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                const commentInput = e.currentTarget.elements.namedItem('comment') as HTMLTextAreaElement;
                handleAddComment(selectedDeviceId, commentInput.value);
                commentInput.value = '';
              }} className="mt-4">
                <textarea
                  name="comment"
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Add a new comment..."
                  required
                ></textarea>
                <button
                  type="submit"
                  className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Add Comment
                </button>
              </form>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}