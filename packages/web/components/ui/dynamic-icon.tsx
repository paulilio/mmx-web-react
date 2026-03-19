import { getIconComponent } from "@/lib/shared/icon-mapping"
import { cn } from "@/lib/shared/utils"

interface DynamicIconProps {
  iconName: string
  className?: string
  size?: number
}

export function DynamicIcon({ iconName, className, size = 16 }: DynamicIconProps) {
  const IconComponent = getIconComponent(iconName)

  return <IconComponent className={cn("flex-shrink-0", className)} size={size} />
}

interface IconWithTextProps {
  iconName: string
  text: string
  iconClassName?: string
  textClassName?: string
  iconSize?: number
}

export function IconWithText({ iconName, text, iconClassName, textClassName, iconSize = 16 }: IconWithTextProps) {
  return (
    <div className="flex items-center gap-2">
      <DynamicIcon iconName={iconName} className={iconClassName} size={iconSize} />
      <span className={textClassName}>{text}</span>
    </div>
  )
}
