import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_CADT_USER = {
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
  // Read clean JSON from localStorage; fallback to null so guest flow works as expected
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jorjek_auth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {
      localStorage.removeItem('jorjek_auth_user');
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Synchronize with persistent storage on state transitions
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('jorjek_auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('jorjek_auth_user');
      }
    } catch (err) {
      console.error('Failed to sync auth state to localStorage:', err);
    }
  }, [user]);

  // Compute initials and normalized handle from display name
  const computeUserMetadata = (userData = {}) => {
    const rawName = userData.displayName || userData.username || 'CADT Student';
    const words = rawName.trim().split(/\s+/).filter(Boolean);
    const initials = words.length > 1
      ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
      : (words[0] ? words[0].slice(0, 2).toUpperCase() : 'SV');

    const handle = userData.handle || rawName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'cadtuser';

    return {
      displayName: rawName,
      initials,
      handle,
    };
  };

  // Login handler
  const login = (userData = {}) => {
    const computedMeta = computeUserMetadata(userData);

    const authenticatedUser = {
      ...DEFAULT_CADT_USER,
      ...userData,
      ...computedMeta,
    };

    setUser(authenticatedUser);
    try {
      localStorage.setItem('jorjek_auth_user', JSON.stringify(authenticatedUser));
    } catch (err) {
      console.error('Storage write error:', err);
    }
    return authenticatedUser;
  };

  // Onboarding completion handler
  const completeSignup = (signupData = {}, selectedInterests = []) => {
    const computedMeta = computeUserMetadata(signupData);

    const newUser = {
      ...DEFAULT_CADT_USER,
      ...signupData,
      ...computedMeta,
      interests: selectedInterests.length > 0 ? selectedInterests : DEFAULT_CADT_USER.interests,
    };

    setUser(newUser);
    try {
      localStorage.setItem('jorjek_auth_user', JSON.stringify(newUser));
    } catch (err) {
      console.error('Storage write error:', err);
    }
    return newUser;
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('jorjek_auth_user');
    } catch (err) {
      console.error('Storage removal error:', err);
    }
  };

  // Profile patcher
  const updateUserProfile = (updatedFields = {}) => {
    setUser((prev) => {
      if (!prev) return null;
      const merged = { ...prev, ...updatedFields };
      if (updatedFields.displayName) {
        Object.assign(merged, computeUserMetadata(merged));
      }
      try {
        localStorage.setItem('jorjek_auth_user', JSON.stringify(merged));
      } catch (err) {
        console.error('Storage patch error:', err);
      }
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        setIsLoading,
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