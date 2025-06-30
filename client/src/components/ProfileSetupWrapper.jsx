// src/components/ProfileSetupWrapper.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ProfileSetup from './ProfileSetup';

export default function ProfileSetupWrapper() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileExists, setProfileExists] = useState(false);

 useEffect(() => {
  if (!currentUser) return;

  async function checkProfile() {
    try {
      const res = await fetch(`http://localhost:5000/api/user/profile?userId=${currentUser.uid}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setProfileExists(true);
        }
      } else if (res.status === 404) {
        setProfileExists(false);
      }
    } catch (err) {
      console.error("Error checking profile:", err);
      setProfileExists(false);
    } finally {
      setLoading(false);
    }
  }

  checkProfile();
}, [currentUser]);


  useEffect(() => {
    if (!loading && profileExists) {
      navigate('/dashboard');
    }
  }, [loading, profileExists, navigate]);

  if (loading) return <p>Loading...</p>;

  return <ProfileSetup userId={currentUser.uid} onComplete={() => navigate('/dashboard')} />;
}
