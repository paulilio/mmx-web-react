"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sun, Moon, Monitor, Palette, Bell, Mail, Smartphone, MessageSquare, Layout, Sidebar } from "lucide-react"
import { toast } from "sonner"
import type { UserPreferences } from "@/types/auth"

interface PersonalizationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PersonalizationModal({ open, onOpenChange }: PersonalizationModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: "system",
    language: "pt-BR",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    layout: {
      sidebarCollapsed: false,
      compactMode: false,
    },
  })

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences)
    }
  }, [user])

  if (!user) return null

  const handleSavePreferences = async () => {
    setIsLoading(true)
    try {
      // Mock API call - in production, this would be a real API
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, preferences }
        }
        return u
      })

      localStorage.setItem("users", JSON.stringify(updatedUsers))
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          ...user,
          preferences,
        }),
      )

      // Apply theme immediately
      if (preferences.theme === "dark") {
        document.documentElement.classList.add("dark")
      } else if (preferences.theme === "light") {
        document.documentElement.classList.remove("dark")
      } else {
        // System theme
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        if (isDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }

      toast.success("Preferences saved successfully!")
    } catch (error) {
      toast.error("Failed to save preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Personalization
          </DialogTitle>
          <DialogDescription>
            Customize your experience with theme, layout, and notification preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme</CardTitle>
              <CardDescription>Choose your preferred color scheme</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={preferences.theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  setPreferences((prev) => ({ ...prev, theme: value }))
                }
                className="grid grid-cols-3 gap-4"
              >
                {themeOptions.map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                    <Label
                      htmlFor={option.value}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                    >
                      <option.icon className="mb-3 h-6 w-6" />
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Language</CardTitle>
              <CardDescription>Select your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={preferences.language}
                onValueChange={(value: "pt-BR" | "en-US") => setPreferences((prev) => ({ ...prev, language: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.notifications.email}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.notifications.push}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={preferences.notifications.sms}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Layout Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layout className="h-5 w-5" />
                Layout
              </CardTitle>
              <CardDescription>Customize the application layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sidebar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sidebar-collapsed">Collapsed Sidebar</Label>
                    <p className="text-sm text-muted-foreground">Start with sidebar collapsed</p>
                  </div>
                </div>
                <Switch
                  id="sidebar-collapsed"
                  checked={preferences.layout.sidebarCollapsed}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      layout: { ...prev.layout, sidebarCollapsed: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Layout className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use more compact spacing throughout the app</p>
                  </div>
                </div>
                <Switch
                  id="compact-mode"
                  checked={preferences.layout.compactMode}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      layout: { ...prev.layout, compactMode: checked },
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreferences} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
