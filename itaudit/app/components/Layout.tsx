import { useRouter } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import { useDarkMode } from '../contexts/DarkModeContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { darkMode } = useDarkMode();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    router.push('/login');
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 overflow-x-auto bg-white dark:bg-gray-800 text-black dark:text-white">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4"
        >
          Logout
        </button>
        {children}
      </main>
      <Footer />
    </div>
  );
}