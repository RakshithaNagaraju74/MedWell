import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "firebase/auth";
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      const userId = userCredential.user.uid;
      localStorage.setItem("userId", userId);

      // Redirect user to Profile Setup page to enter their profile info
      navigate('/profile-setup');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);

      const userId = userCredential.user.uid;
      localStorage.setItem("userId", userId);

      // Redirect user to Profile Setup page
      navigate('/profile-setup');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md mt-10">
      <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 dark:text-white">Create an Account</h2>
      <form onSubmit={handleRegister} className="space-y-5">
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
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
          Register
        </button>
        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-full flex items-center justify-center gap-3 border py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
        >
          <FcGoogle size={24} /> Register with Google
        </button>
        {error && <p className="text-red-600 text-center mt-2">{error}</p>}
      </form>
      <p className="mt-6 text-center text-gray-700 dark:text-gray-300">
        Already have an account?{' '}
        <Link to="/login" className="text-green-600 hover:underline font-semibold">
          Login
        </Link>
      </p>
    </div>
  );
}
