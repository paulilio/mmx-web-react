import { randomUUID } from "crypto"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const incomingRequestId = request.headers.get("x-request-id")
  const requestId = incomingRequestId || randomUUID()

  return NextResponse.json(
    {
      data: null,
      error: {
        code: "PHASE1_MONITOR_PROBE",
        message: "Erro controlado para validacao do monitor na Phase 1",
      },
    },
    {
      status: 500,
      headers: {
        "x-request-id": requestId,
      },
    },
  )
}
