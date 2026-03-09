import { NextRequest } from "next/server"
import { fail, ok } from "../../../../lib/server/http/api-response"
import {
  mapCategoryGroup,
  parseCategoryGroupStatus,
  resolveUserId,
} from "../../../../lib/server/http/category-groups-mapper"
import { CategoryGroupRepository } from "../../../../lib/server/repositories/category-group-repository"
import { CategoryGroupService } from "../../../../lib/server/services/category-group-service"

export const runtime = "nodejs"

const categoryGroupService = new CategoryGroupService(new CategoryGroupRepository())

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const record = await categoryGroupService.getById(context.params.id, userId)

    if (!record) {
      return fail(404, "CATEGORY_GROUP_NOT_FOUND", "Grupo de categoria nao encontrado")
    }

    return ok(mapCategoryGroup(record))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar grupo de categoria"
    return fail(400, "CATEGORY_GROUP_GET_ERROR", message)
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const body = (await request.json()) as {
      userId?: string
      name?: string
      description?: string | null
      color?: string
      icon?: string
      status?: string
      areaId?: string | null
      categoryIds?: string[]
    }

    const userId = resolveUserId(request, body.userId)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const updated = await categoryGroupService.update(context.params.id, userId, {
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon,
      status: body.status ? parseCategoryGroupStatus(body.status) : undefined,
      areaId: body.areaId,
      categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : undefined,
    })

    return ok(mapCategoryGroup(updated))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar grupo de categoria"
    const status = message.includes("nao encontrado") ? 404 : 400
    const code = status === 404 ? "CATEGORY_GROUP_NOT_FOUND" : "CATEGORY_GROUP_UPDATE_ERROR"
    return fail(status, code, message)
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const deleted = await categoryGroupService.remove(context.params.id, userId)
    return ok(mapCategoryGroup(deleted))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir grupo de categoria"
    const status = message.includes("nao encontrado") ? 404 : 400
    const code = status === 404 ? "CATEGORY_GROUP_NOT_FOUND" : "CATEGORY_GROUP_DELETE_ERROR"
    return fail(status, code, message)
  }
}
