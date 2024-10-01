'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../components/Layout';
import ComputerDetails from '../ComputerDetails';

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

export default function ComputerDetailsPage() {
  const params = useParams();
  const [computer, setComputer] = useState<Computer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComputer() {
      if (!params || !params.id) {
        setError('No computer ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getComputer', id: params.id }),
        });
        if (response.ok) {
          const data = await response.json();
          setComputer(data);
        } else {
          throw new Error('Failed to fetch computer details');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchComputer();
  }, [params]);

  const handleCommentAdded = () => {
    // You can add any additional logic here if needed
    console.log('Comment added');
  };

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error}</p></Layout>;
  if (!computer) return <Layout><p>Computer not found</p></Layout>;

  return (
    <Layout>
      <ComputerDetails 
        computer={computer} 
        onBack={() => window.history.back()}
        onCommentAdded={handleCommentAdded}
      />
    </Layout>
  );
}