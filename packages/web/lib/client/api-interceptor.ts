import { useAuth } from "@/hooks/use-auth"

/**
 * Global HTTP interceptor for auto-refreshing tokens on 401
 * Handles: Automatic token refresh on expiration, Request retry after refresh
 */
export function createApiInterceptor() {
  let isRefreshing = false
  let failedQueue: Array<{
    resolve: (value: any) => void
    reject: (reason?: any) => void
  }> = []

  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })

    failedQueue = []
  }

  return {
    async onResponseError(status: number, originalRequest: any) {
      const originalUrl = originalRequest.url || ""

      // Skip refresh for auth endpoints
      if (originalUrl.includes("/auth/login") || originalUrl.includes("/auth/register")) {
        return null
      }

      // Only retry 401 errors (unauthorized)
      if (status === 401) {
        if (!isRefreshing) {
          isRefreshing = true

          try {
            // Call refresh endpoint
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include", // Include cookies
            })

            if (response.ok) {
              const data = (await response.json()) as {
                accessToken?: string
                refreshToken?: string
                expiresIn?: number
              }

              // Store new tokens in localStorage (if not using cookies only)
              if (data.accessToken) {
                if (typeof window !== "undefined") {
                  localStorage.setItem("auth_token", data.accessToken)
                  if (data.refreshToken) {
                    localStorage.setItem("auth_refresh_token", data.refreshToken)
                  }
                }
              }

              isRefreshing = false
              processQueue(null, data.accessToken)
              return data.accessToken
            } else {
              // Refresh failed, redirect to login
              isRefreshing = false
              processQueue(new Error("Token refresh failed"), null)

              if (typeof window !== "undefined") {
                localStorage.removeItem("auth_session")
                localStorage.removeItem("auth_user")
                localStorage.removeItem("auth_token")
                window.location.href = "/auth/login"
              }

              return null
            }
          } catch (error) {
            isRefreshing = false
            processQueue(error, null)

            if (typeof window !== "undefined") {
              window.location.href = "/auth/login"
            }

            return null
          }
        } else {
          // Queue request while refreshing
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
        }
      }

      return null
    },
  }
}

/**
 * Enhanced fetch wrapper with auto-retry on 401
 */
export async function fetchWithRefresh(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const interceptor = createApiInterceptor()
  let response = await fetch(url, { ...options, credentials: "include" })

  // If 401, try refreshing
  if (response.status === 401) {
    const newToken = await interceptor.onResponseError(401, { url })

    if (newToken) {
      // Retry original request with new token
      const retryOptions = {
        ...options,
        credentials: "include" as const,
        headers: {
          ...(options.headers as Record<string, string>),
          Authorization: `Bearer ${newToken}`,
        },
      }

      response = await fetch(url, retryOptions)
    } else {
      // Redirect to login handled in interceptor
      return response
    }
  }

  return response
}
