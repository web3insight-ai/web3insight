'use client';

import type { ResponseResult } from "@/types/http";
import type { DataValue } from "@/types";
import type { EventReport } from "../typing";

// Client-side event repository that uses API routes instead of server functions
// This avoids importing server-only code in client components

async function fetchList(params?: Record<string, DataValue>): Promise<ResponseResult<Record<string, unknown>[]>> {
  const searchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(`/api/events?${searchParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

async function fetchOne(id: number): Promise<ResponseResult<EventReport>> {
  const response = await fetch(`/api/events/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

async function fetchPublicEventDetail(id: number): Promise<ResponseResult<EventReport>> {
  const response = await fetch(`/api/events/public/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.json();
}

async function insertOne(data: Record<string, unknown>): Promise<ResponseResult<Record<string, unknown>>> {
  const response = await fetch('/api/event/contestants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

async function updateOne(data: Record<string, unknown>): Promise<ResponseResult<Record<string, unknown>>> {
  const response = await fetch(`/api/events/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export { fetchList, fetchOne, fetchPublicEventDetail, insertOne, updateOne };
