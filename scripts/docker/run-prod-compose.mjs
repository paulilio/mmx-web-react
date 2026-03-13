import { existsSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { resolve } from "node:path"

const requiredFiles = [
  "docker/env/app.prod.env",
  "docker/env/postgres.env",
]

const missingFiles = requiredFiles.filter((filePath) => !existsSync(resolve(process.cwd(), filePath)))

if (missingFiles.length > 0) {
  console.error("[docker-prod] Arquivos de ambiente obrigatorios ausentes:")
  for (const filePath of missingFiles) {
    console.error(` - ${filePath}`)
  }

  console.error("\n[docker-prod] Crie os arquivos antes de subir o compose:")
  if (missingFiles.includes("docker/env/app.prod.env")) {
    console.error("cp docker/env/app.prod.env.example docker/env/app.prod.env")
  }
  if (missingFiles.includes("docker/env/postgres.env")) {
    console.error("cp docker/env/postgres.env.example docker/env/postgres.env")
  }

  process.exit(1)
}

const composeArgs = process.argv.slice(2)
const args = ["compose", "-f", "docker/compose/docker-compose.prod.yml", ...composeArgs]

const result = spawnSync("docker", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
})

if (typeof result.status === "number") {
  process.exit(result.status)
}

process.exit(1)
