import { NextRequest } from "next/server"
import { contactService } from "../../../../lib/server/services"
import { fail, ok } from "../../../../lib/server/http/api-response"
import {
  mapContact,
  parseContactStatus,
  parseContactType,
  resolveUserId,
} from "../../../../lib/server/http/contacts-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId na query ou no header x-user-id")
    }

    const record = await contactService.getById(context.params.id, userId)

    if (!record) {
      return fail(404, "CONTACT_NOT_FOUND", "Contato nao encontrado")
    }

    return ok(mapContact(record))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao buscar contato"
    return fail(400, "CONTACT_GET_ERROR", message)
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const body = (await request.json()) as {
      userId?: string
      name?: string
      email?: string | null
      phone?: string | null
      identifier?: string | null
      document?: string | null
      type?: string
      status?: string
    }

    const userId = resolveUserId(request, body.userId)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId no body, query ou header x-user-id")
    }

    const updated = await contactService.update(context.params.id, userId, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      identifier: body.identifier ?? body.document,
      type: body.type ? parseContactType(body.type) : undefined,
      status: body.status ? parseContactStatus(body.status) : undefined,
    })

    return ok(mapContact(updated))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar contato"
    const status = message.includes("nao encontrado") ? 404 : 400
    const code = status === 404 ? "CONTACT_NOT_FOUND" : "CONTACT_UPDATE_ERROR"
    return fail(status, code, message)
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId na query ou no header x-user-id")
    }

    const deleted = await contactService.remove(context.params.id, userId)
    return ok(mapContact(deleted))
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir contato"
    const status = message.includes("nao encontrado") ? 404 : 400
    const code = status === 404 ? "CONTACT_NOT_FOUND" : "CONTACT_DELETE_ERROR"
    return fail(status, code, message)
  }
}
