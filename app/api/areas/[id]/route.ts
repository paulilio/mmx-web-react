import { NextRequest } from "next/server"
import { areaService } from "../../../../lib/server/services"
import { fail, ok } from "../../../../lib/server/http/api-response"
import { mapArea, parseAreaStatus, parseAreaType, resolveUserId } from "../../../../lib/server/http/areas-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const record = await areaService.getById(context.params.id, userId)

    if (!record) {
      return fail(404, "AREA_NOT_FOUND", "Area nao encontrada")
    }

    return ok(mapArea(record))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar area"
    return fail(400, "AREA_GET_ERROR", message)
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
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

    const updated = await areaService.update(context.params.id, userId, {
      name: body.name,
      description: body.description,
      type: body.type ? parseAreaType(body.type) : undefined,
      color: body.color,
      icon: body.icon,
      status: body.status ? parseAreaStatus(body.status) : undefined,
    })

    return ok(mapArea(updated))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar area"
    const status = message.includes("nao encontrada") ? 404 : 400
    const code = status === 404 ? "AREA_NOT_FOUND" : "AREA_UPDATE_ERROR"
    return fail(status, code, message)
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(401, "AUTH_REQUIRED", "Autenticacao obrigatoria")
    }

    const deleted = await areaService.remove(context.params.id, userId)
    return ok(mapArea(deleted))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir area"
    const status = message.includes("nao encontrada") ? 404 : 400
    const code = status === 404 ? "AREA_NOT_FOUND" : "AREA_DELETE_ERROR"
    return fail(status, code, message)
  }
}
