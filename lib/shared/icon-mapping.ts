import {
  Home,
  Car,
  ShoppingCart,
  Pill,
  GraduationCap,
  Gamepad2,
  Shirt,
  Plane,
  DollarSign,
  Smartphone,
  ShoppingBag,
  Zap,
  Hospital,
  Film,
  Book,
  Music,
  Dumbbell,
  Pizza,
  Coffee,
  Gift,
  HelpCircle,
  type LucideIcon,
} from "lucide-react"
import { logger } from "./logger"

const iconLogger = logger.scope("IconMapping")

export const ICON_MAPPING: Record<string, LucideIcon> = {
  // Emoji to icon name mapping
  "🏠": Home,
  "🚗": Car,
  "🛒": ShoppingCart,
  "💊": Pill,
  "🎓": GraduationCap,
  "🎮": Gamepad2,
  "👕": Shirt,
  "✈️": Plane,
  "💰": DollarSign,
  "📱": Smartphone,
  "🍔": ShoppingBag, // Using ShoppingBag for food
  "⚡": Zap,
  "🏥": Hospital,
  "🎬": Film,
  "📚": Book,
  "🎵": Music,
  "🏋️": Dumbbell,
  "🍕": Pizza,
  "☕": Coffee,
  "🎁": Gift,

  // String name mapping (for future use)
  home: Home,
  car: Car,
  "shopping-cart": ShoppingCart,
  pill: Pill,
  "graduation-cap": GraduationCap,
  gamepad: Gamepad2,
  shirt: Shirt,
  plane: Plane,
  "dollar-sign": DollarSign,
  smartphone: Smartphone,
  "shopping-bag": ShoppingBag,
  zap: Zap,
  hospital: Hospital,
  film: Film,
  book: Book,
  music: Music,
  dumbbell: Dumbbell,
  pizza: Pizza,
  coffee: Coffee,
  gift: Gift,
}

export const FALLBACK_ICON = HelpCircle

export function getIconComponent(iconName: string): LucideIcon {
  const IconComponent = ICON_MAPPING[iconName]

  if (IconComponent) {
    return IconComponent
  } else {
    iconLogger.warn("Icon not found, fallback used", { iconName })
    return FALLBACK_ICON
  }
}

export const PRESET_ICONS = [
  "home",
  "car",
  "shopping-cart",
  "pill",
  "graduation-cap",
  "gamepad",
  "shirt",
  "plane",
  "dollar-sign",
  "smartphone",
  "shopping-bag",
  "zap",
  "hospital",
  "film",
  "book",
  "music",
  "dumbbell",
  "pizza",
  "coffee",
  "gift",
]

export const ICON_DISPLAY_NAMES: Record<string, string> = {
  home: "Casa",
  car: "Carro",
  "shopping-cart": "Carrinho",
  pill: "Medicamento",
  "graduation-cap": "Educação",
  gamepad: "Jogos",
  shirt: "Roupas",
  plane: "Viagem",
  "dollar-sign": "Dinheiro",
  smartphone: "Celular",
  "shopping-bag": "Compras",
  zap: "Energia",
  hospital: "Saúde",
  film: "Cinema",
  book: "Livros",
  music: "Música",
  dumbbell: "Academia",
  pizza: "Pizza",
  coffee: "Café",
  gift: "Presente",
}
