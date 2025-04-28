import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { logout as logoutFn } from "@/lib/auth";

interface User {
  id: number;
  username: string;
  discordId?: string;
  discordUsername?: string;
  avatar?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  error: null,
  refetchUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    onSuccess: (data) => {
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    },
    onError: () => {
      setUser(null);
    },
  });
  
  const refetchUser = async () => {
    const result = await refetch();
    if (result.data?.user) {
      setUser(result.data.user);
    }
  };
  
  const logout = async () => {
    try {
      await logoutFn();
      setUser(null);
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };
  
  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && user?.role === "admin";
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        error: error as Error | null,
        refetchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
