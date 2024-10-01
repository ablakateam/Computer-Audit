import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-500 to-teal-500 dark:from-blue-800 dark:to-teal-800 p-4 text-white text-center">
      <p>
        © 2024 IT Audit. Designed and Developed by{' '}
        <Link href="https://eboxsupport.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">
          Eboxlab
        </Link>
        . All rights reserved.
      </p>
      <Link href="/admin" className="text-white hover:text-blue-200 mt-2 inline-block">
        Admin Dashboard
      </Link>
    </footer>
  );
}