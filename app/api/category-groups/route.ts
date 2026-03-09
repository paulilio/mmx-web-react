import { NextRequest } from "next/server"
import { fail, ok } from "../../../lib/server/http/api-response"
import {
  mapCategoryGroup,
  parseCategoryGroupStatus,
  resolveUserId,
} from "../../../lib/server/http/category-groups-mapper"
import { CategoryGroupRepository } from "../../../lib/server/repositories/category-group-repository"
import { CategoryGroupService } from "../../../lib/server/services/category-group-service"

export const runtime = "nodejs"

const categoryGroupService = new CategoryGroupService(new CategoryGroupRepository())

export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const page = Number(request.nextUrl.searchParams.get("page") ?? 1)
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? 20)

    const result = await categoryGroupService.list(
      {
        userId,
        status: parseCategoryGroupStatus(request.nextUrl.searchParams.get("status")),
        areaId: request.nextUrl.searchParams.get("areaId") ?? undefined,
        name: request.nextUrl.searchParams.get("name") ?? undefined,
      },
      {
        page: Number.isFinite(page) ? page : 1,
        pageSize: Number.isFinite(pageSize) ? pageSize : 20,
      },
    )

    return ok({
      ...result,
      data: result.data.map(mapCategoryGroup),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao listar grupos de categoria"
    return fail(400, "CATEGORY_GROUP_LIST_ERROR", message)
  }
}

export async function POST(request: NextRequest) {
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

    if (!body.name || !body.color || !body.icon) {
      return fail(400, "INVALID_INPUT", "Campos obrigatorios: name, color, icon")
    }

    const created = await categoryGroupService.create({
      userId,
      name: body.name,
      description: body.description,
      color: body.color,
      icon: body.icon,
      status: body.status ? parseCategoryGroupStatus(body.status) : undefined,
      areaId: body.areaId,
      categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : undefined,
    })

    return ok(mapCategoryGroup(created), 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar grupo de categoria"
    return fail(400, "CATEGORY_GROUP_CREATE_ERROR", message)
  }
}
