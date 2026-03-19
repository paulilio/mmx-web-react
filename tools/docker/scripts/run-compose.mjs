import { existsSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { resolve } from "node:path"

const mode = process.argv[2]
const composeArgs = process.argv.slice(3)

const modeConfig = {
  dev: {
    tag: "docker-dev",
    composeFile: "docker/compose/docker-compose.dev.yml",
    requiredFiles: ["docker/env/app.env", "docker/env/postgres.env"],
    examples: {
      "docker/env/app.env": "cp docker/env/app.env.example docker/env/app.env",
      "docker/env/postgres.env": "cp docker/env/postgres.env.example docker/env/postgres.env",
    },
  },
  prod: {
    tag: "docker-prod",
    composeFile: "docker/compose/docker-compose.prod.yml",
    requiredFiles: ["docker/env/app.prod.env", "docker/env/postgres.env"],
    examples: {
      "docker/env/app.prod.env": "cp docker/env/app.prod.env.example docker/env/app.prod.env",
      "docker/env/postgres.env": "cp docker/env/postgres.env.example docker/env/postgres.env",
    },
  },
}

if (!mode || !(mode in modeConfig)) {
  console.error("Uso: node docker/scripts/run-compose.mjs <dev|prod> <docker compose args...>")
  process.exit(1)
}

if (composeArgs.length === 0) {
  console.error("Informe o comando do compose. Ex.: up --build -d")
  process.exit(1)
}

const config = modeConfig[mode]
const missingFiles = config.requiredFiles.filter((filePath) => !existsSync(resolve(process.cwd(), filePath)))

if (missingFiles.length > 0) {
  console.error(`[${config.tag}] Arquivos de ambiente obrigatorios ausentes:`)
  for (const filePath of missingFiles) {
    console.error(` - ${filePath}`)
  }

  console.error(`\n[${config.tag}] Crie os arquivos antes de subir o compose:`)
  for (const filePath of missingFiles) {
    console.error(config.examples[filePath])
  }

  process.exit(1)
}

const args = ["compose", "-f", config.composeFile, ...composeArgs]
const result = spawnSync("docker", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
})

if (typeof result.status === "number") {
  process.exit(result.status)
}

process.exit(1)
