import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const DEFAULT_CADT_USER = {
  id: 'usr_cadt_01',
  displayName: 'Srun Vireak',
  handle: 'srunvireak',
  initials: 'SV',
  email: 'srun.vireak@student.cadt.edu.kh',
  role: 'STUDENT',
  department: 'Computer Science & Software Engineering',
  gender: 'Male',
  dateOfBirth: '2004-05-14',
  karma: 142,
  interests: ['#C++', '#SQL', '#Machine Learning'],
  isAvailableForMentoring: true,
};

export function AuthProvider({ children }) {
  // Load saved session or fallback to mock user (set to null if testing logged-out state)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jorjek_auth_user');
    return saved ? JSON.parse(saved) : DEFAULT_CADT_USER;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('jorjek_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jorjek_auth_user');
    }
  }, [user]);

  // Handle successful login or OTP completion
  const login = (userData) => {
    const initials = userData.displayName
      ? userData.displayName.split(' ').map((n) => n[0]).join('').toUpperCase()
      : 'U';

    const handle = userData.displayName
      ? userData.displayName.toLowerCase().replace(/\s+/g, '')
      : 'cadtuser';

    const authenticatedUser = {
      ...DEFAULT_CADT_USER,
      ...userData,
      initials,
      handle,
    };

    setUser(authenticatedUser);
    return authenticatedUser;
  };

  // Complete signup after OTP & tech interest selection
  const completeSignup = (signupData, selectedInterests = []) => {
    const newUser = login({
      ...signupData,
      interests: selectedInterests,
    });
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jorjek_auth_user');
  };

  // Update profile attributes (bio, mentoring status, etc.)
  const updateUserProfile = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        completeSignup,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};