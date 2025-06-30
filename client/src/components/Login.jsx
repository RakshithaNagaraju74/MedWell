import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Save userId to localStorage
      localStorage.setItem("userId", user.uid);

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // ✅ Save userId to localStorage
      localStorage.setItem("userId", user.uid);

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 dark:text-white">Welcome Back</h2>
      <form onSubmit={handleLogin} className="space-y-5">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition">
          Login
        </button>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <FcGoogle size={24} /> Login with Google
        </button>
        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
      </form>
      <p className="mt-6 text-center text-gray-700 dark:text-gray-300">
        Don't have an account?{' '}
        <Link to="/register" className="text-green-600 hover:underline font-semibold">
          Register
        </Link>
      </p>
    </div>
  );
}
