// Defensive trim() — Vercel API às vezes armazena valores com `\n` no final,
// o que faz comparação direta `=== "true"` retornar false silenciosamente.
export const USE_API = process.env.NEXT_PUBLIC_USE_API?.trim() === "true"
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE?.trim() || "http://127.0.0.1:8000")
