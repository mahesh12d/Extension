import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useAuth } from "./use-auth";
import type { InsertProfile } from "@shared/schema";

// Helper to add auth header
const getAuthHeaders = (token: string | null) => ({
  "Content-Type": "application/json",
  "Authorization": token ? `Bearer ${token}` : "",
});

export function useProfiles() {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: [api.profiles.list.path],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch(api.profiles.list.path, {
        headers: getAuthHeaders(token),
      });
      if (!res.ok) throw new Error("Failed to fetch profiles");
      return api.profiles.list.responses[200].parse(await res.json());
    },
    enabled: !!token,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (data: InsertProfile) => {
      const validated = api.profiles.create.input.parse(data);
      const res = await fetch(api.profiles.create.path, {
        method: api.profiles.create.method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message);
        }
        throw new Error("Failed to create profile");
      }
      return api.profiles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] }),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertProfile>) => {
      const validated = api.profiles.update.input.parse(updates);
      const url = buildUrl(api.profiles.update.path, { id });
      
      const res = await fetch(url, {
        method: api.profiles.update.method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(validated),
      });

      if (!res.ok) throw new Error("Failed to update profile");
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] }),
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.profiles.delete.path, { id });
      const res = await fetch(url, {
        method: api.profiles.delete.method,
        headers: getAuthHeaders(token),
      });

      if (!res.ok) throw new Error("Failed to delete profile");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.profiles.list.path] }),
  });
}
