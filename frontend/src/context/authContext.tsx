import { ReactNode, createContext, useContext, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { checkAuth } from '../actions/auth';
interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
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
  const [key, setKey] = useState(0);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['auth', key],
    queryFn: checkAuth,
    retry: 10,
  });

  if (isLoading) return <div></div>;
  if (isError) return <div>Error checking authentication</div>;

  const isAuthenticated = !!data;
  const user = isAuthenticated ? data.user : null;
  const refreshAuth = async () => {
    setKey((prevKey) => prevKey + 1);
    queryClient.invalidateQueries({ queryKey: ['auth'] });
  };
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  return useContext(AuthContext);
};
