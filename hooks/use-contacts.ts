"use client"

import useSWR from "swr"
import { api } from "@/lib/api"
import type { Contact } from "@/lib/types"

export function useContacts() {
  const { data, error, mutate } = useSWR<Contact[]>("/contacts", api.get)

  const createContact = async (data: Omit<Contact, "id">) => {
    const result = await api.post<Contact>("/contacts", data)
    mutate()
    return result
  }

  const updateContact = async (id: string, data: Partial<Contact>) => {
    const result = await api.put<Contact>(`/contacts/${id}`, data)
    mutate()
    return result
  }

  const deleteContact = async (id: string) => {
    await api.delete(`/contacts/${id}`)
    mutate()
  }

  return {
    contacts: data || [],
    isLoading: !error && !data,
    error,
    createContact,
    updateContact,
    deleteContact,
    mutate,
  }
}
