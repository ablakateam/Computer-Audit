'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../components/Layout';
import NetworkDeviceDetails from '../NetworkDeviceDetails';

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

export default function NetworkDeviceDetailsPage() {
  const params = useParams();
  const [device, setDevice] = useState<NetworkDevice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNetworkDevice() {
      if (!params || !params.id) {
        setError('No network device ID provided');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getNetworkDevice', id: params.id }),
        });
        if (response.ok) {
          const data = await response.json();
          setDevice(data);
        } else {
          throw new Error('Failed to fetch network device details');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    fetchNetworkDevice();
  }, [params]);

  const handleCommentAdded = () => {
    // You can add any additional logic here if needed
    console.log('Comment added to network device');
  };

  if (isLoading) return <Layout><p>Loading...</p></Layout>;
  if (error) return <Layout><p>Error: {error}</p></Layout>;
  if (!device) return <Layout><p>Network device not found</p></Layout>;

  return (
    <Layout>
      <NetworkDeviceDetails 
        device={device} 
        onBack={() => window.history.back()}
        onCommentAdded={handleCommentAdded}
      />
    </Layout>
  );
}