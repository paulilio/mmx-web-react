import { describe, expect, it } from "vitest"
import { evaluateCorsRequest, resolveCorsOriginMatrix, resolveRuntimeEnvironment } from "./cors"

describe("resolveRuntimeEnvironment", () => {
  it("prioriza MMX_APP_ENV quando valor valido", () => {
    const environment = resolveRuntimeEnvironment({
      appEnv: "staging",
      nodeEnv: "development",
      vercelEnv: "production",
    })

    expect(environment).toBe("staging")
  })

  it("mapeia VERCEL_ENV preview para staging", () => {
    const environment = resolveRuntimeEnvironment({
      nodeEnv: "production",
      vercelEnv: "preview",
    })

    expect(environment).toBe("staging")
  })

  it("usa development por padrao", () => {
    const environment = resolveRuntimeEnvironment({
      nodeEnv: "development",
      vercelEnv: "development",
    })

    expect(environment).toBe("development")
  })
})

describe("resolveCorsOriginMatrix", () => {
  it("usa defaults de dev quando CORS_ORIGINS_DEV nao definido", () => {
    const matrix = resolveCorsOriginMatrix({
      development: "",
      staging: "",
      production: "",
    })

    expect(matrix.development).toContain("http://localhost:3000")
    expect(matrix.staging).toEqual([])
    expect(matrix.production).toEqual([])
  })

  it("normaliza e remove duplicidade de origens", () => {
    const matrix = resolveCorsOriginMatrix({
      development: "http://localhost:3000,http://localhost:3000, https://mmx.app/path",
    })

    expect(matrix.development).toEqual(["http://localhost:3000", "https://mmx.app"])
  })
})

describe("evaluateCorsRequest", () => {
  it("retorna 204 com headers de preflight quando origem permitida", () => {
    const result = evaluateCorsRequest({
      method: "OPTIONS",
      origin: "https://app.staging.mmx.com",
      requestHeaders: "content-type,authorization",
      environment: "staging",
      originMatrix: {
        development: ["http://localhost:3000"],
        staging: ["https://app.staging.mmx.com"],
        production: ["https://app.mmx.com"],
      },
    })

    expect(result.allowed).toBe(true)
    expect(result.status).toBe(204)
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("https://app.staging.mmx.com")
    expect(result.headers["Access-Control-Allow-Headers"]).toBe("content-type,authorization")
  })

  it("bloqueia origem fora da matriz do ambiente", () => {
    const result = evaluateCorsRequest({
      method: "POST",
      origin: "https://evil.example",
      environment: "production",
      originMatrix: {
        development: ["http://localhost:3000"],
        staging: ["https://app.staging.mmx.com"],
        production: ["https://app.mmx.com"],
      },
    })

    expect(result.allowed).toBe(false)
    expect(result.status).toBe(403)
    expect(result.headers.Vary).toBe("Origin")
  })

  it("nao bloqueia request sem origin", () => {
    const result = evaluateCorsRequest({
      method: "GET",
      origin: null,
      environment: "production",
      originMatrix: {
        development: ["http://localhost:3000"],
        staging: ["https://app.staging.mmx.com"],
        production: ["https://app.mmx.com"],
      },
    })

    expect(result.allowed).toBe(true)
    expect(result.status).toBe(200)
    expect(result.headers.Vary).toBe("Origin")
  })
})
