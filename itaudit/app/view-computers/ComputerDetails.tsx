import React, { useState, useEffect, useCallback } from 'react';

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

interface ComputerDetailsProps {
  computer: Computer;
  onBack: () => void;
  onCommentAdded: () => void;
}

export default function ComputerDetails({ computer, onBack, onCommentAdded }: ComputerDetailsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getComments', id: computer.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        throw new Error('Failed to fetch comments');
      }
    } catch (error: unknown) {
      setError(`Error fetching comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [computer.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addComment', id: computer.id, comment: newComment }),
      });
      if (response.ok) {
        setNewComment('');
        setNotification('Comment added successfully!');
        setTimeout(() => setNotification(null), 3000);
        fetchComments();
        onCommentAdded();
      } else {
        throw new Error('Failed to add comment');
      }
    } catch (error: unknown) {
      setError(`Error adding comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 bg-opacity-80 rounded-lg shadow-xl p-4 sm:p-8 backdrop-filter backdrop-blur-lg">
      <button 
        onClick={onBack}
        className="mb-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
      >
        Back
      </button>
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800 dark:text-white">{computer.name} Details</h1>
      {notification && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{notification}</span>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Hardware Information</h2>
          <p><strong>CPU:</strong> {computer.cpu}</p>
          <p><strong>RAM:</strong> {computer.ram}</p>
          <p><strong>Storage:</strong> {computer.storage}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Network Information</h2>
          <p><strong>IP Address:</strong> {computer.ipAddress}</p>
          <p><strong>Teamviewer ID:</strong> {computer.teamviewerId}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Software Information</h2>
          <p><strong>Antivirus:</strong> {computer.antivirus}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <p><strong>Users:</strong> {computer.users}</p>
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Printer</h2>
        <p>{computer.printer}</p>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Notes</h2>
        <p>{computer.notes}</p>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Comments</h2>
        {isLoading ? (
          <p>Loading comments...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div>
            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              <ul className="space-y-2">
                {comments.map((comment) => (
                  <li key={comment.id} className="border-b pb-2">
                    <p className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString()}</p>
                    <p>{comment.content}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Add a new comment..."
              />
              <button
                onClick={handleAddComment}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Comment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}