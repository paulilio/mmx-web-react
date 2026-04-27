import useSWR from "swr"
import { api } from "@/lib/client/api"
import type { Account, AccountBalance, AccountFormData } from "@/lib/shared/types"

export function useAccounts() {
  const { data: accounts = [], error, isLoading, mutate } = useSWR<Account[]>("/accounts", api.get)

  const createAccount = async (data: AccountFormData) => {
    const created = await api.post<Account>("/accounts", data)
    await mutate()
    return created
  }

  const updateAccount = async (id: string, data: Partial<AccountFormData>) => {
    const updated = await api.put<Account>(`/accounts/${id}`, data)
    await mutate()
    return updated
  }

  const archiveAccount = async (id: string) => {
    await api.delete(`/accounts/${id}`)
    await mutate()
  }

  return {
    accounts,
    isLoading,
    loading: isLoading,
    error,
    createAccount,
    updateAccount,
    archiveAccount,
    mutate,
  }
}

export function useAccountBalance(accountId: string | undefined | null) {
  const key = accountId ? `/accounts/${accountId}/balance` : null
  const { data, error, isLoading, mutate } = useSWR<AccountBalance>(key, api.get)
  return { balance: data, error, isLoading, mutate }
}
