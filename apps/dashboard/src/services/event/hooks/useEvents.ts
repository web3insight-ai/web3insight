"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { DataValue } from "@/types";
import type { EventReport, EventInsight } from "../typing";
import {
  fetchList,
  fetchOne,
  fetchPublicEventDetail,
  insertOne,
  updateOne,
} from "../repository/client";

// Query Keys
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params?: Record<string, DataValue>) =>
    [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: number) => [...eventKeys.details(), id] as const,
  publicDetail: (id: number) => [...eventKeys.all, "public", id] as const,
};

// Hooks

/**
 * Fetch event list with optional filters
 */
export function useEventList(params?: Record<string, DataValue>) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const result = await fetchList(params);
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch events");
      }
      return result.data as EventInsight[];
    },
  });
}

/**
 * Fetch single event detail (admin)
 */
export function useEventDetail(id: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const result = await fetchOne(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch event");
      }
      return result.data as EventReport;
    },
    enabled: options?.enabled ?? id > 0,
  });
}

/**
 * Fetch public event detail
 */
export function usePublicEventDetail(
  id: number,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: eventKeys.publicDetail(id),
    queryFn: async () => {
      const result = await fetchPublicEventDetail(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch event");
      }
      return result.data as EventReport;
    },
    enabled: options?.enabled ?? id > 0,
  });
}

/**
 * Create new contestant
 */
export function useCreateContestant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await insertOne(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to create contestant");
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch event lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Update event
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const result = await updateOne(data);
      if (!result.success) {
        throw new Error(result.message || "Failed to update event");
      }
      return result.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific event detail
      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: eventKeys.detail(variables.id as number),
        });
      }
      // Invalidate event lists
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

/**
 * Prefetch event detail (for optimistic navigation)
 */
export function usePrefetchEventDetail() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: eventKeys.detail(id),
      queryFn: async () => {
        const result = await fetchOne(id);
        if (!result.success) {
          throw new Error(result.message || "Failed to fetch event");
        }
        return result.data as EventReport;
      },
    });
  };
}

