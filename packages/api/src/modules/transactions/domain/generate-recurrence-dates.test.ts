import { describe, expect, it } from "vitest"
import { generateRecurrenceDates } from "./generate-recurrence-dates"

function utc(year: number, monthZeroBased: number, day: number): Date {
  return new Date(Date.UTC(year, monthZeroBased, day))
}

function iso(date: Date): string {
  return date.toISOString().split("T")[0] ?? ""
}

describe("generateRecurrenceDates", () => {
  describe("DAILY", () => {
    it("gera N ocorrências com interval 1", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1), // 1 mai 2026
        rule: { frequency: "DAILY", interval: 1, count: 5 },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-01",
        "2026-05-02",
        "2026-05-03",
        "2026-05-04",
        "2026-05-05",
      ])
    })

    it("respeita interval > 1", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: { frequency: "DAILY", interval: 3, count: 4 },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-01",
        "2026-05-04",
        "2026-05-07",
        "2026-05-10",
      ])
    })

    it("para em endDate antes de count", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: { frequency: "DAILY", interval: 1, count: 100, endDate: utc(2026, 4, 3) },
      })
      expect(dates.map(iso)).toEqual(["2026-05-01", "2026-05-02", "2026-05-03"])
    })
  })

  describe("MONTHLY", () => {
    it("gera 12 ocorrências mensais", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 0, 15),
        rule: { frequency: "MONTHLY", interval: 1, count: 12 },
      })
      expect(dates).toHaveLength(12)
      expect(iso(dates[0]!)).toBe("2026-01-15")
      expect(iso(dates[11]!)).toBe("2026-12-15")
    })

    it("clamp em fim-de-mês: 31 jan + 1 mês = 28 fev (não-bissexto)", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 0, 31),
        rule: { frequency: "MONTHLY", interval: 1, count: 4 },
      })
      expect(dates.map(iso)).toEqual([
        "2026-01-31",
        "2026-02-28", // clamp
        "2026-03-31",
        "2026-04-30", // clamp
      ])
    })

    it("clamp em fim-de-mês: 31 jan + 1 mês em ano bissexto = 29 fev", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2024, 0, 31),
        rule: { frequency: "MONTHLY", interval: 1, count: 2 },
      })
      expect(dates.map(iso)).toEqual(["2024-01-31", "2024-02-29"])
    })

    it("interval 3 = trimestral", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 0, 1),
        rule: { frequency: "MONTHLY", interval: 3, count: 4 },
      })
      expect(dates.map(iso)).toEqual([
        "2026-01-01",
        "2026-04-01",
        "2026-07-01",
        "2026-10-01",
      ])
    })
  })

  describe("WEEKLY", () => {
    it("sem daysOfWeek usa o dia da semana do start (sexta)", () => {
      // 2026-05-01 é sexta-feira
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: { frequency: "WEEKLY", interval: 1, count: 4 },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-01",
        "2026-05-08",
        "2026-05-15",
        "2026-05-22",
      ])
    })

    it("daysOfWeek múltiplos (segunda + quarta), interval 1", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 4), // 2026-05-04 é segunda
        rule: {
          frequency: "WEEKLY",
          interval: 1,
          daysOfWeek: ["MONDAY", "WEDNESDAY"],
          count: 6,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-04",
        "2026-05-06",
        "2026-05-11",
        "2026-05-13",
        "2026-05-18",
        "2026-05-20",
      ])
    })
  })

  describe("YEARLY", () => {
    it("ano a ano respeitando 29 fev", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2024, 1, 29), // 29 fev 2024 (bissexto)
        rule: { frequency: "YEARLY", interval: 1, count: 4 },
      })
      expect(dates.map(iso)).toEqual([
        "2024-02-29",
        "2025-02-28", // clamp
        "2026-02-28",
        "2027-02-28",
      ])
    })
  })

  describe("limites", () => {
    it("hard-cap de 120 ocorrências", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 0, 1),
        rule: { frequency: "DAILY", interval: 1, count: 500 },
      })
      expect(dates).toHaveLength(120)
    })

    it("rejeita interval < 1", () => {
      expect(() =>
        generateRecurrenceDates({
          startDate: utc(2026, 0, 1),
          rule: { frequency: "DAILY", interval: 0, count: 3 },
        }),
      ).toThrow("interval")
    })

    it("rejeita count < 1", () => {
      expect(() =>
        generateRecurrenceDates({
          startDate: utc(2026, 0, 1),
          rule: { frequency: "DAILY", interval: 1, count: 0 },
        }),
      ).toThrow("count")
    })
  })

  describe("não-drift por timezone", () => {
    it("DST shift não move datas (sempre UTC midnight)", () => {
      // Brasil tinha DST que terminava em fevereiro (até 2019).
      // Garantir que mensal entre out/nov/dez/jan não desloca dias.
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 9, 15), // 15 out
        rule: { frequency: "MONTHLY", interval: 1, count: 5 },
      })
      expect(dates.map(iso)).toEqual([
        "2026-10-15",
        "2026-11-15",
        "2026-12-15",
        "2027-01-15",
        "2027-02-15",
      ])
    })
  })
})
