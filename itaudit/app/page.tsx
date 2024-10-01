'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from './components/Layout';
import Link from 'next/link';

interface ComputerWithComment {
  id: number;
  name: string;
  ipAddress: string;
  teamviewerId: string;
  latestComment: string;
  commentTimestamp: string;
}

interface NetworkDeviceWithComment {
  id: number;
  name: string;
  ipAddress: string;
  type: string;
  latestComment: string;
  commentTimestamp: string;
}

interface SiteContent {
  key: string;
  value: string;
}

export default function Home() {
  const router = useRouter();
  const [latestComputers, setLatestComputers] = useState<ComputerWithComment[]>([]);
  const [latestNetworkDevices, setLatestNetworkDevices] = useState<NetworkDeviceWithComment[]>([]);
  const [totalComputers, setTotalComputers] = useState<number>(0);
  const [totalNetworkDevices, setTotalNetworkDevices] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteContent, setSiteContent] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      fetchLatestData();
      fetchSiteContent();
    }
  }, [router]);

  async function fetchLatestData() {
    setIsLoading(true);
    setError(null);
    try {
      const [computersResponse, networkDevicesResponse, totalComputersResponse, totalNetworkDevicesResponse, totalUsersResponse] = await Promise.all([
        fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getLatestComputersWithComments' }),
        }),
        fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getLatestNetworkDevicesWithComments' }),
        }),
        fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getTotalComputers' }),
        }),
        fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getTotalNetworkDevices' }),
        }),
        fetch('/api/db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getTotalUsers' }),
        })
      ]);

      if (computersResponse.ok && networkDevicesResponse.ok && totalComputersResponse.ok && totalNetworkDevicesResponse.ok && totalUsersResponse.ok) {
        const computersData = await computersResponse.json();
        const networkDevicesData = await networkDevicesResponse.json();
        const totalComputersData = await totalComputersResponse.json();
        const totalNetworkDevicesData = await totalNetworkDevicesResponse.json();
        const totalUsersData = await totalUsersResponse.json();
        
        setLatestComputers(computersData);
        setLatestNetworkDevices(networkDevicesData);
        setTotalComputers(totalComputersData.total);
        setTotalNetworkDevices(totalNetworkDevicesData.total);
        setTotalUsers(totalUsersData.total);
      } else {
        throw new Error('Failed to fetch latest data');
      }
    } catch (error: unknown) {
      console.error('Error fetching latest data:', error);
      setError(`Error fetching latest data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchSiteContent() {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSiteContent' }),
      });
      if (response.ok) {
        const data: SiteContent[] = await response.json();
        const contentObject = data.reduce((acc, item) => ({...acc, [item.key]: item.value}), {});
        setSiteContent(contentObject);
      } else {
        throw new Error('Failed to fetch site content');
      }
    } catch (error: unknown) {
      console.error('Error fetching site content:', error);
    }
  }

  return (
    <Layout>
      <div className="bg-white dark:bg-gray-800 bg-opacity-80 rounded-lg shadow-xl p-4 sm:p-8 backdrop-filter backdrop-blur-lg">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-purple-600 dark:text-purple-400">{siteContent.welcome_message || 'Welcome to IT Audit'}</h1>
        <p className="text-base sm:text-lg text-gray-700 dark:text-gray-300 mb-6">
          Current IT Audit Started for {siteContent.audit_company || 'Medstuff'} on {siteContent.audit_start_date || '9/28/2024'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800">Total Computers</h2>
            <p className="text-3xl font-bold text-blue-600">{totalComputers}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800">Total Network Devices</h2>
            <p className="text-3xl font-bold text-green-600">{totalNetworkDevices}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-yellow-800">Total Users</h2>
            <p className="text-3xl font-bold text-yellow-600">{totalUsers}</p>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-600">Latest Computers with Comments</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : latestComputers.length === 0 ? (
          <p>No computers with recent comments found.</p>
        ) : (
          <div className="space-y-4 mb-8">
            {latestComputers.map((computer) => (
              <div key={computer.id} className="border p-4 rounded-lg">
                <Link href={`/view-computers/${computer.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                  {computer.name}
                </Link>
                <p>IP Address: {computer.ipAddress}</p>
                <p>Teamviewer ID: {computer.teamviewerId}</p>
                <div className="mt-2">
                  <p className="font-semibold">Latest Comment:</p>
                  <p>{computer.latestComment}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(computer.commentTimestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-purple-600">Latest Network Devices with Comments</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : latestNetworkDevices.length === 0 ? (
          <p>No network devices with recent comments found.</p>
        ) : (
          <div className="space-y-4 mb-8">
            {latestNetworkDevices.map((device) => (
              <div key={device.id} className="border p-4 rounded-lg">
                <Link href={`/view-network-devices/${device.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                  {device.name}
                </Link>
                <p>IP Address: {device.ipAddress}</p>
                <p>Type: {device.type}</p>
                <div className="mt-2">
                  <p className="font-semibold">Latest Comment:</p>
                  <p>{device.latestComment}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(device.commentTimestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          <Link href="/add-computer" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add Computer
          </Link>
          <Link href="/view-computers" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            View All Computers
          </Link>
          <Link href="/add-network-device" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
            Add Network Device
          </Link>
          <Link href="/view-network-devices" className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600">
            View All Network Devices
          </Link>
        </div>
      </div>
    </Layout>
  );
}