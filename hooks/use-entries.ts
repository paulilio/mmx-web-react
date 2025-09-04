"use client"

import useSWR from "swr"
import { getJSON, postJSON, putJSON } from "@/lib/api"
import type { Entry, Contact, Category, Payment } from "@/lib/types"

interface EntriesParams {
  type?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
  search?: string
}

interface EntriesResponse {
  entries: Entry[]
  total: number
  page: number
  totalPages: number
}

export function useEntries(params: EntriesParams = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce(
      (acc, [key, value]) => {
        if (value !== undefined && value !== "") {
          acc[key] = String(value)
        }
        return acc
      },
      {} as Record<string, string>,
    ),
  ).toString()

  return useSWR<EntriesResponse>(`/entries${queryString ? `?${queryString}` : ""}`, getJSON)
}

export function useContacts() {
  return useSWR<Contact[]>("/contacts", getJSON)
}

export function useCategories() {
  return useSWR<Category[]>("/categories", getJSON)
}

export function useEntryPayments(entryId: string) {
  return useSWR<Payment[]>(entryId ? `/entries/${entryId}/payments` : null, getJSON)
}

export async function createEntry(data: Omit<Entry, "id" | "status">) {
  return postJSON<Entry>("/entries", data)
}

export async function updateEntry(id: string, data: Partial<Entry>) {
  return putJSON<Entry>(`/entries/${id}`, data)
}

export async function createPayment(
  entryId: string,
  data: {
    amount: number
    paidAt: string
    method: string
    note?: string
  },
) {
  return postJSON(`/entries/${entryId}/payments`, data)
}
