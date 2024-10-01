import Link from 'next/link';

export default function LoggedOut() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 text-center bg-white shadow-lg rounded-lg">
        <h1 className="text-2xl font-bold mb-4">You have been logged out</h1>
        <p className="mb-4">Thank you for using IT Audit. You have been successfully logged out.</p>
        <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Log In Again
        </Link>
      </div>
    </div>
  );
}