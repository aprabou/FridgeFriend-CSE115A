// src/contexts/useAuth.ts
//Defines a custom React hook, useAuth, that provides access to the AuthContext and ensures it is used within an AuthProvider
import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
};
