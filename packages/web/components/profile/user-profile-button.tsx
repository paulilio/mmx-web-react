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

interface UserProfileButtonProps {
  collapsed?: boolean
}

export function UserProfileButton({ collapsed = false }: UserProfileButtonProps) {
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
          {collapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 p-0 mx-auto rounded-full hover:bg-accent"
              aria-label={`${user.firstName} ${user.lastName} — abrir menu de perfil`}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="w-full h-auto px-2 py-2 justify-start gap-2 hover:bg-accent transition-colors"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user.profilePhoto || "/placeholder.svg"} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                  {getInitials(user.firstName, user.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-xs font-medium text-foreground truncate w-full text-left">
                  {user.firstName} {user.lastName}
                </span>
                <Badge variant={getPlanBadgeVariant(user.planType)} className="text-[10px] px-1.5 py-0 mt-0.5">
                  {getPlanLabel(user.planType)}
                </Badge>
              </div>
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" sideOffset={8} className="w-64 z-50">
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

          <DropdownMenuItem onClick={logout} className="text-expense">
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
