import { useState, useEffect, createContext, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { z } from "zod";
import type { InsertUser } from "@shared/schema";

type AuthContextType = {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: async (credentials: Pick<InsertUser, "username" | "password">) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username or password");
        throw new Error("Login failed");
      }

      const data = await res.json();
      const validated = api.auth.login.responses[200].parse(data);
      login(validated.token);
      return validated;
    },
  });
}

export function useRegister() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Registration failed");
        }
        throw new Error("Registration failed");
      }

      const data = await res.json();
      const validated = api.auth.register.responses[201].parse(data);
      login(validated.token);
      return validated;
    },
  });
}
