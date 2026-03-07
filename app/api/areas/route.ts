import { NextRequest } from "next/server"
import { areaService } from "../../../lib/server/services"
import { fail, ok } from "../../../lib/server/http/api-response"
import { mapArea, parseAreaStatus, parseAreaType, resolveUserId } from "../../../lib/server/http/areas-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const page = Number(request.nextUrl.searchParams.get("page") ?? 1)
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? 20)

    const result = await areaService.list(
      {
        userId,
        type: parseAreaType(request.nextUrl.searchParams.get("type")),
        status: parseAreaStatus(request.nextUrl.searchParams.get("status")),
      },
      {
        page: Number.isFinite(page) ? page : 1,
        pageSize: Number.isFinite(pageSize) ? pageSize : 20,
      },
    )

    return ok({
      ...result,
      data: result.data.map(mapArea),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao listar areas"
    return fail(400, "AREA_LIST_ERROR", message)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string
      name?: string
      description?: string | null
      type?: string
      color?: string
      icon?: string
      status?: string
    }

    const userId = resolveUserId(request, body.userId)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    if (!body.name || !body.type || !body.color || !body.icon) {
      return fail(400, "INVALID_INPUT", "Campos obrigatorios: name, type, color, icon")
    }

    const created = await areaService.create({
      userId,
      name: body.name,
      description: body.description,
      type: body.type,
      color: body.color,
      icon: body.icon,
      status: body.status,
    })

    return ok(mapArea(created), 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar area"
    return fail(400, "AREA_CREATE_ERROR", message)
  }
}
