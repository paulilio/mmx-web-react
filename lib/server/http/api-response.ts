import { NextResponse } from "next/server"

export interface ApiErrorBody {
  code: string
  message: string
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, error: null }, { status })
}

export function fail(status: number, code: string, message: string) {
  return NextResponse.json(
    {
      data: null,
      error: { code, message } as ApiErrorBody,
    },
    { status },
  )
}
