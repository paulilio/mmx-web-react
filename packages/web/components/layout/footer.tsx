"use client"

import { useState, useEffect } from "react"

interface AppConfig {
  app: {
    name: string
    version: string
    environment: "mock" | "dev" | "prod"
  }
  footer: {
    companyName: string
    showHelpLink: boolean
    helpUrl: string
    supportUrl: string
  }
}

export function Footer() {
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    // Load config from JSON file (mock data)
    const loadConfig = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll use the mock config
        const mockConfig: AppConfig = {
          app: {
            name: "White Castle",
            version: "1.0.0",
            environment: "mock",
          },
          footer: {
            companyName: "White Castle",
            showHelpLink: true,
            helpUrl: "/help",
            supportUrl: "/support",
          },
        }
        setConfig(mockConfig)
      } catch (error) {
        console.error("Failed to load app config:", error)
        // Fallback config
        setConfig({
          app: {
            name: "White Castle",
            version: "1.0.0",
            environment: "mock",
          },
          footer: {
            companyName: "White Castle",
            showHelpLink: true,
            helpUrl: "/help",
            supportUrl: "/support",
          },
        })
      }
    }

    loadConfig()

    // Update year dynamically
    const updateYear = () => {
      setCurrentYear(new Date().getFullYear())
    }

    // Update year every minute to ensure it's always current
    const interval = setInterval(updateYear, 60000)

    return () => clearInterval(interval)
  }, [])

  if (!config) {
    return null
  }

  const getEnvironmentBadge = () => {
    const envColors = {
      mock: "bg-warning/15 text-warning",
      dev: "bg-primary/15 text-primary",
      prod: "bg-income/15 text-income",
    }

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${envColors[config.app.environment]}`}
      >
        {config.app.environment.toUpperCase()}
      </span>
    )
  }

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Main footer text - center aligned */}
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>
                {config.footer.companyName} © {currentYear} - version v{config.app.version}
              </span>
              {getEnvironmentBadge()}
            </div>
          </div>

          {/* Help/Support links - right aligned */}
          {config.footer.showHelpLink && (
            <div className="flex items-center gap-2 text-sm">
              <a href={config.footer.helpUrl} className="text-muted-foreground hover:text-foreground transition-colors">
                Help
              </a>
              <span className="text-muted-foreground">|</span>
              <a
                href={config.footer.supportUrl}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Support
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
