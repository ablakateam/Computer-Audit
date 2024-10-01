'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useDarkMode } from '../contexts/DarkModeContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-800 dark:to-pink-900 p-4">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold">IT Audit</Link>
        <button
          className="lg:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        <div className={`${isMenuOpen ? 'block' : 'hidden'} lg:flex lg:items-center w-full lg:w-auto mt-4 lg:mt-0`}>
          <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
            <Link href="/" className="text-white hover:text-gray-200">Home</Link>
            <Link href="/add-computer" className="text-white hover:text-gray-200">Add Computer</Link>
            <Link href="/view-computers" className="text-white hover:text-gray-200">View Computers</Link>
            <Link href="/add-network-device" className="text-white hover:text-gray-200">Add Network Device</Link>
            <Link href="/view-network-devices" className="text-white hover:text-gray-200">View Network Devices</Link>
            <Link href="/add-user" className="text-white hover:text-gray-200">Add User</Link>
            <Link href="/view-users" className="text-white hover:text-gray-200">View Users</Link>
            <button onClick={toggleDarkMode} className="text-white hover:text-gray-200 focus:outline-none">
              {darkMode ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}