import { describe, expect, it } from "vitest"
import { BadRequestException } from "@nestjs/common"
import {
  parseImportedStatus,
  parsePagination,
  parseReconcileBody,
  parseRegisterConnectionBody,
} from "./open-finance.dto"

describe("open-finance DTOs", () => {
  describe("parseRegisterConnectionBody", () => {
    it("aceita body válido", () => {
      const out = parseRegisterConnectionBody({
        providerLinkId: "uuid-1",
        institutionCode: "ofmockbank",
        institutionName: "Mock",
      })
      expect(out.providerLinkId).toBe("uuid-1")
    })

    it("rejeita body não-objeto", () => {
      expect(() => parseRegisterConnectionBody(null)).toThrow(BadRequestException)
      expect(() => parseRegisterConnectionBody("string")).toThrow(BadRequestException)
      expect(() => parseRegisterConnectionBody([])).toThrow(BadRequestException)
    })

    it("rejeita campos vazios ou ausentes", () => {
      expect(() => parseRegisterConnectionBody({})).toThrow(BadRequestException)
      try {
        parseRegisterConnectionBody({ providerLinkId: "", institutionCode: "x", institutionName: "y" })
        expect.fail("deveria lançar")
      } catch (err) {
        const response = (err as BadRequestException).getResponse() as { error: { message: string } }
        expect(response.error.message).toMatch(/providerLinkId/)
      }
    })
  })

  describe("parseReconcileBody", () => {
    it("match exige matchedTransactionId", () => {
      expect(() => parseReconcileBody({ action: { kind: "match" } })).toThrow(BadRequestException)
      const out = parseReconcileBody({ action: { kind: "match", matchedTransactionId: "tx-1" } })
      expect(out.action).toEqual({ kind: "match", matchedTransactionId: "tx-1" })
    })

    it("ignore e duplicate sem campos extras", () => {
      expect(parseReconcileBody({ action: { kind: "ignore" } }).action.kind).toBe("ignore")
      expect(parseReconcileBody({ action: { kind: "duplicate" } }).action.kind).toBe("duplicate")
    })

    it("kind inválido rejeita 400", () => {
      expect(() => parseReconcileBody({ action: { kind: "garbage" } })).toThrow(BadRequestException)
      expect(() => parseReconcileBody({})).toThrow(BadRequestException)
    })
  })

  describe("parseImportedStatus", () => {
    it("aceita case-insensitive", () => {
      expect(parseImportedStatus("pending")).toBe("PENDING")
      expect(parseImportedStatus("IMPORTED")).toBe("IMPORTED")
    })

    it("retorna undefined quando vazio", () => {
      expect(parseImportedStatus(undefined)).toBeUndefined()
      expect(parseImportedStatus("")).toBeUndefined()
    })

    it("rejeita valor inválido", () => {
      expect(() => parseImportedStatus("invalid")).toThrow(BadRequestException)
    })
  })

  describe("parsePagination", () => {
    it("default 1/50", () => {
      expect(parsePagination(undefined, undefined)).toEqual({ page: 1, pageSize: 50 })
    })

    it("rejeita pageSize > 200", () => {
      expect(() => parsePagination("1", "300")).toThrow(BadRequestException)
    })

    it("rejeita page < 1 ou NaN", () => {
      expect(() => parsePagination("0", "10")).toThrow(BadRequestException)
      expect(() => parsePagination("abc", "10")).toThrow(BadRequestException)
    })
  })
})
