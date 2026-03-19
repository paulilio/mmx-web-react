"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Settings, Palette, HelpCircle, LogOut, Crown, ChevronUp } from "lucide-react"
import { AccountSettingsModal } from "./account-settings-modal"
import { PersonalizationModal } from "./personalization-modal"
import { UpgradeModal } from "./upgrade-modal"

export function UserProfileButton() {
  const { user, logout } = useAuth()
  const [showAccountSettings, setShowAccountSettings] = useState(false)
  const [showPersonalization, setShowPersonalization] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  if (!user) return null

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const getPlanBadgeVariant = (planType: string) => {
    switch (planType) {
      case "premium":
        return "default"
      case "pro":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case "premium":
        return "Premium"
      case "pro":
        return "Pro"
      default:
        return "Free"
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-auto p-3 justify-start gap-3 hover:bg-slate-100 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {getInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium text-slate-900 truncate">
                {user.firstName} {user.lastName}
              </span>
              <Badge variant={getPlanBadgeVariant(user.planType)} className="text-xs">
                {getPlanLabel(user.planType)}
              </Badge>
            </div>
            <ChevronUp className="h-4 w-4 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel className="pb-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {user.planType === "free" && (
            <>
              <DropdownMenuItem onClick={() => setShowUpgrade(true)}>
                <Crown className="mr-2 h-4 w-4" />
                <span>Upgrade plan</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={() => setShowPersonalization(true)}>
            <Palette className="mr-2 h-4 w-4" />
            <span>Personalization</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowAccountSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Account settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={logout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AccountSettingsModal open={showAccountSettings} onOpenChange={setShowAccountSettings} />
      <PersonalizationModal open={showPersonalization} onOpenChange={setShowPersonalization} />
      <UpgradeModal open={showUpgrade} onOpenChange={setShowUpgrade} />
    </>
  )
}
