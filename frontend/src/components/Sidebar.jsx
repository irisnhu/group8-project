import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

const Sidebar = ({ onLogout }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log("Sidebar user from Redux:", user);

  const handleLogout = () => {
    dispatch(logout());
    if (onLogout) onLogout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  console.log("isAdmin:", isAdmin, "isModerator:", isModerator);

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      background: 'linear-gradient(135deg, #4a148c, #7b1fa2, #9c27b0, #ba68c8)',
      color: '#fff',
      padding: '20px',
      boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      fontFamily: "'Poppins', sans-serif",
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      zIndex: 1000,
    }}>
      <h2 style={{
        marginBottom: '30px',
        fontSize: '1.5rem',
        fontWeight: '600',
        textAlign: 'center',
        color: '#fff',
      }}>
        Menu
      </h2>

      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ marginBottom: '15px' }}>
            <button
              onClick={() => navigate('/profile')}
              style={{
                width: '100%',
                padding: '12px 15px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Profile
            </button>
          </li>

          {(isAdmin || isModerator) && (
            <li style={{ marginBottom: '15px' }}>
              <button
                onClick={() => navigate(isAdmin ? '/admin' : '/mod')}
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {isAdmin ? 'Admin Dashboard' : 'Moderator Panel'}
              </button>
            </li>
          )}

          <li>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '12px 15px',
                backgroundColor: 'rgba(211, 47, 47, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(211, 47, 47, 1)';
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(211, 47, 47, 0.8)';
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Responsive: ẩn trên mobile nếu cần */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            width: 200px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
