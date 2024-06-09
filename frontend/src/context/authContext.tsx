import { ReactNode, createContext, useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkAuth } from '../actions/auth';
interface User {
  id: string;
  username: string;
  email: string;
}

const AuthContext = createContext<{
  isAuthenticated: boolean | undefined;
  isLoading: boolean | undefined;
  user: User | null;
  refreshAuth: () => void;
}>({
  isAuthenticated: false,
  isLoading: false,
  user: null,
  refreshAuth: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [key, setKey] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', key],
    queryFn: checkAuth,
    retry: false,
  });

  if (isLoading) return <div></div>;
  if (isError) return <div>Error checking authentication</div>;

  const isAuthenticated = !!data;
  const user = isAuthenticated ? data.user : null;
  const refreshAuth = () => {
    setKey((prevKey) => !prevKey);
  };
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
