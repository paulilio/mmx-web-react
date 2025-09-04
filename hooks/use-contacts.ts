"use client"

import useSWR from "swr"
import { getJSON, postJSON, putJSON, deleteJSON } from "@/lib/api"
import type { Contact } from "@/lib/types"

export function useContacts() {
  return useSWR<Contact[]>("/contacts", getJSON)
}

export async function createContact(data: Omit<Contact, "id">) {
  return postJSON<Contact>("/contacts", data)
}

export async function updateContact(id: string, data: Partial<Contact>) {
  return putJSON<Contact>(`/contacts/${id}`, data)
}

export async function deleteContact(id: string) {
  return deleteJSON(`/contacts/${id}`)
}
