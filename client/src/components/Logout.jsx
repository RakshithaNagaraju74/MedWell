import React from 'react';
import { auth } from '../firebase';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

export default function Logout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      // ✅ Clear localStorage
      localStorage.removeItem("userId");

      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Logout
    </button>
  );
}
