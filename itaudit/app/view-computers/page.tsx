'use client';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

interface Computer {
  id: number;
  name: string;
  ipAddress: string;
  cpu: string;
  ram: string;
  storage: string;
  printer: string;
  users: string;
  teamviewerId: string;
  antivirus: string;
  notes: string;
}

interface Comment {
  id: number;
  computerId: number;
  content: string;
  timestamp: string;
}

export default function ViewComputers() {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<{[key: number]: Comment[]}>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComputerId, setSelectedComputerId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedComputer, setEditedComputer] = useState<Computer | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchComputers();
  }, []);

  async function fetchComputers() {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching computers...');
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getComputers' }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setComputers(data);
      } else {
        throw new Error(data.message || 'Failed to fetch computers');
      }
    } catch (error: unknown) {
      console.error('Error fetching computers:', error);
      setError(`Error fetching computers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchComments(computerId: number) {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getComments', id: computerId }),
      });
      if (response.ok) {
        const data = await response.json();
        setComments(prev => ({ ...prev, [computerId]: data }));
        setSelectedComputerId(computerId);
        setIsModalOpen(true);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error: unknown) {
      setError(`Error fetching comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this computer?')) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteComputer', id }),
      });
      if (response.ok) {
        fetchComputers();
      } else {
        throw new Error('Failed to delete computer');
      }
    } catch (error: unknown) {
      setError(`Error deleting computer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (computer: Computer) => {
    setEditingId(computer.id);
    setEditedComputer({ ...computer });
  };

  const handleSave = async () => {
    if (!editedComputer) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateComputer', data: editedComputer }),
      });
      if (response.ok) {
        setComputers(computers.map(c => c.id === editedComputer.id ? editedComputer : c));
        setEditingId(null);
        setEditedComputer(null);
      } else {
        throw new Error('Failed to update computer');
      }
    } catch (error: unknown) {
      setError(`Error updating computer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Computer) => {
    if (editedComputer) {
      setEditedComputer({ ...editedComputer, [field]: e.target.value });
    }
  };

  const handleDeleteComment = async (computerId: number, commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteComment', id: commentId }),
      });
      if (response.ok) {
        // Update the comments state after successful deletion
        setComments(prevComments => ({
          ...prevComments,
          [computerId]: prevComments[computerId].filter(comment => comment.id !== commentId)
        }));
      } else {
        throw new Error('Failed to delete comment');
      }
    } catch (error: unknown) {
      setError(`Error deleting comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAddComment = async (computerId: number, comment: string) => {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addComment', id: computerId, comment }),
      });
      if (response.ok) {
        setNotification('Comment added successfully!');
        setTimeout(() => setNotification(null), 3000); // Clear notification after 3 seconds
        fetchComments(computerId); // Refresh comments
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error: unknown) {
      setError(`Error adding comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 bg-opacity-80 rounded-lg shadow-xl p-4 sm:p-8 backdrop-filter backdrop-blur-lg">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 dark:text-white">View Computers</h1>
        {notification && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{notification}</span>
          </div>
        )}
        {isLoading ? (
          <p className="text-gray-800 dark:text-white">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : computers.length === 0 ? (
          <p className="text-gray-800 dark:text-white">No computers found. Please add a computer.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {computers.map((computer) => (
                <div key={computer.id} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                  {editingId === computer.id ? (
                    <>
                      {Object.entries(computer).map(([key]) => (
                        key !== 'id' && (
                          <div key={key} className="mb-2">
                            <label htmlFor={`${computer.id}-${key}`} className="block text-sm font-medium text-gray-700">
                              {key.charAt(0).toUpperCase() + key.slice(1)}:
                            </label>
                            {key === 'notes' ? (
                              <textarea
                                id={`${computer.id}-${key}`}
                                value={editedComputer?.[key as keyof Computer] || ''}
                                onChange={(e) => handleInputChange(e, key as keyof Computer)}
                                className="w-full p-2 border rounded"
                                rows={3}
                              />
                            ) : (
                              <input
                                type="text"
                                id={`${computer.id}-${key}`}
                                value={editedComputer?.[key as keyof Computer] || ''}
                                onChange={(e) => handleInputChange(e, key as keyof Computer)}
                                className="w-full p-2 border rounded"
                              />
                            )}
                          </div>
                        )
                      ))}
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-2">{computer.name}</h2>
                      <p><strong>IP:</strong> {computer.ipAddress}</p>
                      <p><strong>CPU:</strong> {computer.cpu}</p>
                      <p><strong>RAM:</strong> {computer.ram}</p>
                      <p><strong>Storage:</strong> {computer.storage}</p>
                      <p><strong>Teamviewer ID:</strong> {computer.teamviewerId}</p>
                    </>
                  )}
                  <div className="mt-4 space-y-2">
                    <Link 
                      href={`/view-computers/${computer.id}`}
                      className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      View Details
                    </Link>
                    {editingId === computer.id ? (
                      <button 
                        onClick={handleSave}
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEdit(computer)}
                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(computer.id)} 
                      className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => fetchComments(computer.id)} 
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
        {isModalOpen && selectedComputerId !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Comments for Computer ID: {selectedComputerId}</h2>
              {comments[selectedComputerId]?.length > 0 ? (
                <ul className="space-y-4">
                  {comments[selectedComputerId].map((comment) => (
                    <li key={comment.id} className="flex justify-between items-start border-b pb-2">
                      <div>
                        <p className="font-bold">{new Date(comment.timestamp).toLocaleString()}</p>
                        <p>{comment.content}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteComment(selectedComputerId, comment.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No comments for this computer.</p>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                const commentInput = e.currentTarget.elements.namedItem('comment') as HTMLTextAreaElement;
                handleAddComment(selectedComputerId, commentInput.value);
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