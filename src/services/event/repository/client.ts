"use client";

import type { ResponseResult, DataValue } from "@/types";
import type { EventInsight, EventReport, Contestant } from "../typing";

// Helper for API calls
async function apiCall<T>(
  url: string,
  options?: RequestInit,
): Promise<ResponseResult<T>> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  return res.json();
}

// Fetch list of events
export async function fetchList(
  params?: Record<string, DataValue>,
): Promise<ResponseResult<EventInsight[]>> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });
  }
  const queryString = searchParams.toString();
  const url = queryString ? `/api/events?${queryString}` : "/api/events";
  return apiCall(url);
}

// Fetch single event detail (admin)
export async function fetchOne(
  id: number,
): Promise<ResponseResult<EventReport>> {
  return apiCall(`/api/events/${id}`);
}

// Fetch public event detail
export async function fetchPublicEventDetail(
  id: number,
): Promise<ResponseResult<EventReport>> {
  return apiCall(`/api/events/public/${id}`);
}

// Extended response types for event mutations
interface InsertOneResponse extends ResponseResult<Contestant[]> {
  extra?: { eventId: number; fail: string[] };
}

interface UpdateOneResponse extends ResponseResult<Contestant[]> {
  extra?: { fail: string[] };
}

// Create new event with contestants
export async function insertOne(
  data: Record<string, unknown>,
): Promise<InsertOneResponse> {
  const res = await fetch("/api/event/contestants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

// Update existing event
export async function updateOne(
  data: Record<string, unknown>,
): Promise<UpdateOneResponse> {
  const { id, ...rest } = data;
  const res = await fetch(`/api/event/contestants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rest),
  });
  return res.json();
}
