import { NextRequest } from "next/server"
import { categoryService } from "../../../lib/server/services"
import { fail, ok } from "../../../lib/server/http/api-response"
import {
  mapCategory,
  parseCategoryStatus,
  parseCategoryType,
  resolveUserId,
} from "../../../lib/server/http/categories-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId na query ou no header x-user-id")
    }

    const page = Number(request.nextUrl.searchParams.get("page") ?? 1)
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? 20)

    const result = await categoryService.list(
      {
        userId,
        type: parseCategoryType(request.nextUrl.searchParams.get("type")),
        status: parseCategoryStatus(request.nextUrl.searchParams.get("status")),
        categoryGroupId: request.nextUrl.searchParams.get("categoryGroupId") ?? undefined,
        areaId: request.nextUrl.searchParams.get("areaId") ?? undefined,
      },
      {
        page: Number.isFinite(page) ? page : 1,
        pageSize: Number.isFinite(pageSize) ? pageSize : 20,
      },
    )

    return ok({
      ...result,
      data: result.data.map(mapCategory),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao listar categorias"
    return fail(400, "CATEGORY_LIST_ERROR", message)
  }
}

export async function POST(request: NextRequest) {
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
      return fail(400, "USER_ID_REQUIRED", "Informe o userId no body, query ou header x-user-id")
    }

    if (!body.name || !body.type) {
      return fail(400, "INVALID_INPUT", "Campos obrigatorios: name, type")
    }

    const created = await categoryService.create({
      userId,
      name: body.name,
      description: body.description,
      type: body.type,
      categoryGroupId: body.categoryGroupId,
      areaId: body.areaId,
      status: body.status,
    })

    return ok(mapCategory(created), 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar categoria"
    return fail(400, "CATEGORY_CREATE_ERROR", message)
  }
}
