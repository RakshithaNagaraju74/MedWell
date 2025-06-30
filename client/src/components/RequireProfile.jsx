import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireProfile({ children }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    fetch(`http://localhost:5000/api/user/profile?userId=${currentUser.uid}`)
      .then(res => {
        if (res.status === 404) {
          navigate('/profile-setup');
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        navigate('/profile-setup');
      });
  }, [currentUser, navigate]);

  if (loading) return <div>Loading...</div>;
  return children;
}
