"use client"

import useSWR from "swr"
import { api } from "@/lib/client/api"
import type { Contact } from "@/lib/shared/types"
import type { ContactFormData } from "@/lib/shared/validations"

export function useContacts() {
  const { data, error, mutate } = useSWR<Contact[]>("/contacts", api.get)

  const createContact = async (data: ContactFormData) => {
    const payload = {
      ...data,
      identifier: data.document,
    }
    const result = await api.post<Contact>("/contacts", payload)
    mutate()
    return result
  }

  const updateContact = async (id: string, data: Partial<ContactFormData>) => {
    const payload = {
      ...data,
      identifier: data.document,
    }
    const result = await api.put<Contact>(`/contacts/${id}`, payload)
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
