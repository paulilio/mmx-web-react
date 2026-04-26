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

  // -------------------------------------------------------------------------
  // Gap coverage: cenários que faltavam de cobertura. Alguns podem revelar
  // bugs latentes na implementação atual; nesse caso, marcar com it.todo() e
  // ajustar generate-recurrence-dates.ts no próximo passo.
  // -------------------------------------------------------------------------

  describe("WEEKLY interval > 1", () => {
    it("a cada 2 semanas (segunda + quarta), 4 ocorrências", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 4), // segunda 04 maio 2026
        rule: {
          frequency: "WEEKLY",
          interval: 2,
          daysOfWeek: ["MONDAY", "WEDNESDAY"],
          count: 4,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-04", // seg semana A
        "2026-05-06", // qua semana A
        "2026-05-18", // pula semana B; seg semana C
        "2026-05-20", // qua semana C
      ])
    })

    it("start fora dos daysOfWeek: pula 1ª semana, primeira ocorrência é a próxima válida", () => {
      // Sábado start mas daysOfWeek=[MONDAY] — primeira ocorrência é a segunda da semana seguinte
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 2), // sábado 02 maio 2026
        rule: {
          frequency: "WEEKLY",
          interval: 1,
          daysOfWeek: ["MONDAY"],
          count: 3,
        },
      })
      expect(dates.map(iso)).toEqual(["2026-05-04", "2026-05-11", "2026-05-18"])
    })
  })

  describe("MONTHLY com dayOfMonth fixo", () => {
    it("dayOfMonth=5 com start em 2026-05-15 gera dia 5 dos meses seguintes", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 15),
        rule: {
          frequency: "MONTHLY",
          interval: 1,
          dayOfMonth: 5,
          count: 4,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-05",
        "2026-06-05",
        "2026-07-05",
        "2026-08-05",
      ])
    })

    it("dayOfMonth=31 faz clamp em fevereiro (28 ou 29)", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 0, 1),
        rule: {
          frequency: "MONTHLY",
          interval: 1,
          dayOfMonth: 31,
          count: 4,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-01-31",
        "2026-02-28", // clamp 28 (não-bissexto)
        "2026-03-31",
        "2026-04-30", // clamp 30
      ])
    })
  })

  describe("MONTHLY by-week (weekOfMonth + daysOfWeek)", () => {
    it("weekOfMonth=FIRST + daysOfWeek=[MONDAY] gera primeira segunda-feira de cada mês", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: {
          frequency: "MONTHLY",
          interval: 1,
          monthlyMode: "weekOfMonth",
          weekOfMonth: "FIRST",
          daysOfWeek: ["MONDAY"],
          count: 4,
        },
      })
      // Primeira segunda de mai/jun/jul/ago 2026
      expect(dates.map(iso)).toEqual([
        "2026-05-04", // 1ª seg de maio
        "2026-06-01", // 1ª seg de junho
        "2026-07-06", // 1ª seg de julho
        "2026-08-03", // 1ª seg de agosto
      ])
    })

    it("weekOfMonth=LAST + daysOfWeek=[FRIDAY] gera última sexta de cada mês", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: {
          frequency: "MONTHLY",
          interval: 1,
          monthlyMode: "weekOfMonth",
          weekOfMonth: "LAST",
          daysOfWeek: ["FRIDAY"],
          count: 3,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-29",
        "2026-06-26",
        "2026-07-31",
      ])
    })

    it("weekOfMonth=THIRD + daysOfWeek=[WEDNESDAY] (3ª quarta)", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: {
          frequency: "MONTHLY",
          interval: 1,
          monthlyMode: "weekOfMonth",
          weekOfMonth: "THIRD",
          daysOfWeek: ["WEDNESDAY"],
          count: 3,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-20",
        "2026-06-17",
        "2026-07-15",
      ])
    })
  })

  describe("YEARLY com monthOfYear", () => {
    it("monthOfYear=1 fixa janeiro mesmo se start é em outro mês", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 15), // start em maio
        rule: {
          frequency: "YEARLY",
          interval: 1,
          monthOfYear: 1, // janeiro
          count: 3,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-01-15",
        "2027-01-15",
        "2028-01-15",
      ])
    })

    it("monthOfYear=12 + dayOfMonth=25 gera Natal de cada ano", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 15),
        rule: {
          frequency: "YEARLY",
          interval: 1,
          monthOfYear: 12,
          dayOfMonth: 25,
          count: 3,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-12-25",
        "2027-12-25",
        "2028-12-25",
      ])
    })
  })

  describe("DAILY com daysOfWeek (dias úteis)", () => {
    it("daysOfWeek=[MON..FRI] em DAILY pula fim de semana", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1), // sexta 01 maio 2026
        rule: {
          frequency: "DAILY",
          interval: 1,
          daysOfWeek: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
          count: 6,
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-01", // sex
        // 02, 03 (sab, dom) pulados
        "2026-05-04", // seg
        "2026-05-05", // ter
        "2026-05-06", // qua
        "2026-05-07", // qui
        "2026-05-08", // sex
      ])
    })
  })

  describe("count + endDate combinados", () => {
    it("para no que vier primeiro: endDate antes do count", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: {
          frequency: "DAILY",
          interval: 1,
          count: 30,
          endDate: utc(2026, 4, 5),
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-01",
        "2026-05-02",
        "2026-05-03",
        "2026-05-04",
        "2026-05-05",
      ])
    })

    it("para no que vier primeiro: count antes do endDate", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: {
          frequency: "DAILY",
          interval: 1,
          count: 3,
          endDate: utc(2026, 11, 31),
        },
      })
      expect(dates.map(iso)).toEqual([
        "2026-05-01",
        "2026-05-02",
        "2026-05-03",
      ])
    })
  })

  describe("edge cases", () => {
    it("count=1 retorna apenas startDate", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1),
        rule: { frequency: "MONTHLY", interval: 1, count: 1 },
      })
      expect(dates.map(iso)).toEqual(["2026-05-01"])
    })

    it("startDate igual a endDate: gera 1 ocorrência", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 15),
        rule: {
          frequency: "DAILY",
          interval: 1,
          endDate: utc(2026, 4, 15),
        },
      })
      expect(dates.map(iso)).toEqual(["2026-05-15"])
    })

    it("DAILY sem count nem endDate respeita hard-cap (não loop infinito)", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 0, 1),
        rule: { frequency: "DAILY", interval: 1 },
      })
      expect(dates).toHaveLength(120)
    })

    it("WEEKLY com daysOfWeek vazio cai no comportamento default (dia da semana do start)", () => {
      const dates = generateRecurrenceDates({
        startDate: utc(2026, 4, 1), // sexta
        rule: {
          frequency: "WEEKLY",
          interval: 1,
          daysOfWeek: [],
          count: 3,
        },
      })
      expect(dates.map(iso)).toEqual(["2026-05-01", "2026-05-08", "2026-05-15"])
    })
  })
})
