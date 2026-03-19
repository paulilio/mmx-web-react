"use client"

import { useEffect } from "react"

export default function MonitorProbePhase1Page() {
  useEffect(() => {
    console.error("PHASE1_PROBE_CONSOLE_ERROR")

    const requestId = `phase1-probe-${Date.now()}`
    void fetch("/api/monitor-probe/error", {
      headers: {
        "x-request-id": requestId,
      },
    }).catch((error) => {
      console.error("PHASE1_PROBE_FETCH_FAILED", error)
    })

    const timer = setTimeout(() => {
      throw new Error("PHASE1_PROBE_PAGE_ERROR")
    }, 100)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <main style={{ padding: "24px" }}>
      <h1>Monitor Probe Phase 1</h1>
      <p>Pagina de validacao controlada para monitoramento da Phase 1.</p>
    </main>
  )
}
