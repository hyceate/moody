import { ReactNode, createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkAuth } from '../actions/auth';
interface User {
  id: string;
  username: string;
}

const AuthContext = createContext<{
  isAuthenticated: boolean | undefined;
  isLoading: boolean | undefined;
  user: User | null; // Add username to the context
}>({
  isAuthenticated: false,
  isLoading: false,
  user: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth'],
    queryFn: checkAuth,
    retry: false,
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error checking authentication</div>;

  const isAuthenticated = !!data;
  const user = isAuthenticated ? data.user : null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
