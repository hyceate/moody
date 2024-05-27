import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkAuth } from '../actions/auth';

const AuthContext = createContext<{
  isAuthenticated: boolean | undefined;
  isLoading: boolean | undefined;
  setIsAuthenticated?: () => void;
}>({
  isAuthenticated: false,
  isLoading: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    data: isAuthenticated,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['auth'],
    queryFn: checkAuth,
    retry: false,
  });

  if (isLoading) return true;
  if (isError) return <div>Error checking authentication</div>;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
