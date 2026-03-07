import { NextRequest } from "next/server"
import { transactionService } from "@/lib/server/services"
import type {
  DomainTransactionType,
} from "@/lib/domain/transactions/transaction-entity"
import { fail, ok } from "@/lib/server/http/api-response"
import {
  mapTransaction,
  parseTransactionStatus,
  parseTransactionType,
  resolveUserId,
} from "@/lib/server/http/transactions-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId na query ou no header x-user-id")
    }

    const page = Number(request.nextUrl.searchParams.get("page") ?? 1)
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? 20)

    const type = parseTransactionType(request.nextUrl.searchParams.get("type"))
    const status = parseTransactionStatus(request.nextUrl.searchParams.get("status"))

    const result = await transactionService.list(
      {
        userId,
        type,
        status,
        categoryId: request.nextUrl.searchParams.get("categoryId") ?? undefined,
        dateFrom: request.nextUrl.searchParams.get("dateFrom") ?? undefined,
        dateTo: request.nextUrl.searchParams.get("dateTo") ?? undefined,
      },
      {
        page: Number.isFinite(page) ? page : 1,
        pageSize: Number.isFinite(pageSize) ? pageSize : 20,
      },
    )

    return ok({
      ...result,
      data: result.data.map(mapTransaction),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao listar transacoes"
    return fail(400, "TRANSACTION_LIST_ERROR", message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string
      description?: string
      amount?: number
      type?: string
      categoryId?: string
      date?: string
      status?: string
      notes?: string | null
      contactId?: string | null
      areaId?: string | null
      categoryGroupId?: string | null
      currentBalance?: number
    }

    const userId = resolveUserId(request, body.userId)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId no body, query ou header x-user-id")
    }

    if (!body.date || !body.type || !body.categoryId) {
      return fail(400, "INVALID_INPUT", "Campos obrigatorios: date, type, categoryId")
    }

    const created = await transactionService.create(
      {
        userId,
        description: body.description ?? "",
        amount: Number(body.amount ?? 0),
        type: parseTransactionType(body.type) as DomainTransactionType,
        categoryId: body.categoryId,
        date: body.date,
        status: parseTransactionStatus(body.status),
        notes: body.notes,
        contactId: body.contactId,
        areaId: body.areaId,
        categoryGroupId: body.categoryGroupId,
      },
      body.currentBalance,
    )

    return ok(mapTransaction(created), 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar transacao"
    return fail(400, "TRANSACTION_CREATE_ERROR", message)
  }
}
