import { NextRequest } from "next/server"
import { categoryService } from "../../../../lib/server/services"
import { fail, ok } from "../../../../lib/server/http/api-response"
import {
  mapCategory,
  parseCategoryStatus,
  parseCategoryType,
  resolveUserId,
} from "../../../../lib/server/http/categories-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const record = await categoryService.getById(context.params.id, userId)

    if (!record) {
      return fail(404, "CATEGORY_NOT_FOUND", "Categoria nao encontrada")
    }

    return ok(mapCategory(record))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar categoria"
    return fail(400, "CATEGORY_GET_ERROR", message)
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const body = (await request.json()) as {
      userId?: string
      name?: string
      description?: string | null
      type?: string
      categoryGroupId?: string | null
      areaId?: string | null
      status?: string
    }

    const userId = resolveUserId(request, body.userId)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const updated = await categoryService.update(context.params.id, userId, {
      name: body.name,
      description: body.description,
      type: body.type ? parseCategoryType(body.type) : undefined,
      categoryGroupId: body.categoryGroupId,
      areaId: body.areaId,
      status: body.status ? parseCategoryStatus(body.status) : undefined,
    })

    return ok(mapCategory(updated))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar categoria"
    const status = message.includes("nao encontrada") ? 404 : 400
    const code = status === 404 ? "CATEGORY_NOT_FOUND" : "CATEGORY_UPDATE_ERROR"
    return fail(status, code, message)
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const deleted = await categoryService.remove(context.params.id, userId)
    return ok(mapCategory(deleted))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir categoria"
    const status = message.includes("nao encontrada") ? 404 : 400
    const code = status === 404 ? "CATEGORY_NOT_FOUND" : "CATEGORY_DELETE_ERROR"
    return fail(status, code, message)
  }
}
