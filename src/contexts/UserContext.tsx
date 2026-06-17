"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

type User = {
  id: number;
  role: string;
  name: string;
  phone: string;
  therapist_id?: number;
  created_at?: string;
  updated_at?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }

      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const freshUser = await res.json();
          setUserState(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        } else if (res.status === 401) {
          setUserState(null);
          localStorage.removeItem("user");
        }
      } catch {
        // offline — keep cached user
      } finally {
        setIsLoading(false);
      }
    };

    initUser();
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      router.replace("/auth/login");
    } catch {
      toast.error("مشکلی پیش آمد");
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
