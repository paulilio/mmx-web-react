import { NextRequest } from "next/server"
import { contactService } from "../../../lib/server/services"
import { fail, ok } from "../../../lib/server/http/api-response"
import {
  mapContact,
  parseContactStatus,
  parseContactType,
  resolveUserId,
} from "../../../lib/server/http/contacts-mapper"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const userId = resolveUserId(request)

    if (!userId) {
      return fail(400, "USER_ID_REQUIRED", "Informe o userId na query ou no header x-user-id")
    }

    const page = Number(request.nextUrl.searchParams.get("page") ?? 1)
    const pageSize = Number(request.nextUrl.searchParams.get("pageSize") ?? 20)

    const result = await contactService.list(
      {
        userId,
        type: parseContactType(request.nextUrl.searchParams.get("type")),
        status: parseContactStatus(request.nextUrl.searchParams.get("status")),
        name: request.nextUrl.searchParams.get("name") ?? undefined,
      },
      {
        page: Number.isFinite(page) ? page : 1,
        pageSize: Number.isFinite(pageSize) ? pageSize : 20,
      },
    )

    return ok({
      ...result,
      data: result.data.map(mapContact),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao listar contatos"
    return fail(400, "CONTACT_LIST_ERROR", message)
  }
}

export async function POST(request: NextRequest) {
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

    if (!body.name || !body.type) {
      return fail(400, "INVALID_INPUT", "Campos obrigatorios: name, type")
    }

    const created = await contactService.create({
      userId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      identifier: body.identifier ?? body.document,
      type: body.type,
      status: body.status,
    })

    return ok(mapContact(created), 201)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar contato"
    return fail(400, "CONTACT_CREATE_ERROR", message)
  }
}
