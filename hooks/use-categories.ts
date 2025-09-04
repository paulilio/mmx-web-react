"use client"

import useSWR from "swr"
import { getJSON, postJSON, putJSON, deleteJSON } from "@/lib/api"
import type { Category } from "@/lib/types"

export function useCategories() {
  return useSWR<Category[]>("/categories", getJSON)
}

export async function createCategory(data: Omit<Category, "id">) {
  return postJSON<Category>("/categories", data)
}

export async function updateCategory(id: string, data: Partial<Category>) {
  return putJSON<Category>(`/categories/${id}`, data)
}

export async function deleteCategory(id: string) {
  return deleteJSON(`/categories/${id}`)
}
