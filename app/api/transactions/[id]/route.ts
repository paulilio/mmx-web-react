import { NextRequest } from "next/server"
import { transactionService } from "@/lib/server/services"
import { fail, ok } from "@/lib/server/http/api-response"
import {
  mapTransaction,
  parseTransactionStatus,
  parseTransactionType,
  resolveUserId,
} from "@/lib/server/http/transactions-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId na query ou no header x-user-id")
    }

    const record = await transactionService.getById(context.params.id, userId)

    if (!record) {
      return fail(404, "TRANSACTION_NOT_FOUND", "Transacao nao encontrada")
    }

    return ok(mapTransaction(record))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar transacao"
    return fail(400, "TRANSACTION_GET_ERROR", message)
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
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

    const updated = await transactionService.update(
      context.params.id,
      userId,
      {
        description: body.description,
        amount: typeof body.amount === "number" ? body.amount : undefined,
        type: parseTransactionType(body.type),
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

    return ok(mapTransaction(updated))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar transacao"
    const status = message.includes("nao encontrada") ? 404 : 400
    const code = status === 404 ? "TRANSACTION_NOT_FOUND" : "TRANSACTION_UPDATE_ERROR"
    return fail(status, code, message)
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId na query ou no header x-user-id")
    }

    const deleted = await transactionService.remove(context.params.id, userId)
    return ok(mapTransaction(deleted))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir transacao"
    const status = message.includes("nao encontrada") ? 404 : 400
    const code = status === 404 ? "TRANSACTION_NOT_FOUND" : "TRANSACTION_DELETE_ERROR"
    return fail(status, code, message)
  }
}
