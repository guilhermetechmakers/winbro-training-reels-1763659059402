import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Reel, ReelVersion, ReprocessStatus, ReelPermission } from "@/types";
import { toast } from "sonner";

// Get reel by ID
export function useReel(id: string | undefined) {
  return useQuery({
    queryKey: ["reel", id],
    queryFn: () => api.get<Reel>(`/reels/${id}`),
    enabled: !!id,
  });
}

// Update reel metadata
export function useUpdateReel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Reel> }) =>
      api.put<Reel>(`/reels/${id}`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reel", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      toast.success("Reel updated successfully");
    },
    onError: () => {
      toast.error("Failed to update reel");
    },
  });
}

// Get reel versions
export function useReelVersions(reelId: string | undefined) {
  return useQuery({
    queryKey: ["reel", reelId, "versions"],
    queryFn: () => api.get<ReelVersion[]>(`/reels/${reelId}/versions`),
    enabled: !!reelId,
  });
}

// Rollback to version
export function useRollbackVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reelId, versionId }: { reelId: string; versionId: string }) =>
      api.post<Reel>(`/reels/${reelId}/rollback`, { version_id: versionId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reel", variables.reelId] });
      queryClient.invalidateQueries({ queryKey: ["reel", variables.reelId, "versions"] });
      toast.success("Rolled back to previous version");
    },
    onError: () => {
      toast.error("Failed to rollback version");
    },
  });
}

// Reprocess video
export function useReprocessReel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reelId: string) =>
      api.post<ReprocessStatus>(`/reels/${reelId}/reprocess`, {}),
    onSuccess: (_data, reelId) => {
      queryClient.invalidateQueries({ queryKey: ["reel", reelId] });
      queryClient.invalidateQueries({ queryKey: ["reel", reelId, "reprocess"] });
      toast.success("Video reprocessing started");
    },
    onError: () => {
      toast.error("Failed to start reprocessing");
    },
  });
}

// Get reprocess status
export function useReprocessStatus(reelId: string | undefined) {
  return useQuery({
    queryKey: ["reel", reelId, "reprocess"],
    queryFn: () => api.get<ReprocessStatus>(`/reels/${reelId}/reprocess/status`),
    enabled: !!reelId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "processing" || data?.status === "pending") {
        return 2000; // Poll every 2 seconds while processing
      }
      return false;
    },
  });
}

// Update transcript
export function useUpdateTranscript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reelId, transcript }: { reelId: string; transcript: { segments: any[] } }) =>
      api.put(`/reels/${reelId}/transcript`, transcript),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reel", variables.reelId] });
      toast.success("Transcript updated successfully");
    },
    onError: () => {
      toast.error("Failed to update transcript");
    },
  });
}

// Get reel permissions
export function useReelPermissions(reelId: string | undefined) {
  return useQuery({
    queryKey: ["reel", reelId, "permissions"],
    queryFn: () => api.get<ReelPermission[]>(`/reels/${reelId}/permissions`),
    enabled: !!reelId,
  });
}

// Update reel permissions
export function useUpdateReelPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reelId, permissions }: { reelId: string; permissions: Partial<ReelPermission> }) =>
      api.put<ReelPermission>(`/reels/${reelId}/permissions`, permissions),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reel", variables.reelId, "permissions"] });
      toast.success("Permissions updated successfully");
    },
    onError: () => {
      toast.error("Failed to update permissions");
    },
  });
}
