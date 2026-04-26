"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Crown, Check, Star, Shield, Users, BarChart3, Headphones } from "lucide-react"
import { toast } from "sonner"

interface UpgradeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type StoredUserRecord = {
  id: string
  [key: string]: unknown
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "pro">("premium")

  if (!user) return null

  const plans = [
    {
      id: "premium" as const,
      name: "Premium",
      price: "R$ 29",
      period: "/mês",
      description: "Perfect for small businesses",
      icon: Star,
      popular: true,
      features: [
        "Up to 5 companies",
        "Advanced reports",
        "Priority support",
        "Custom categories",
        "Export to Excel/PDF",
        "Mobile app access",
      ],
    },
    {
      id: "pro" as const,
      name: "Pro",
      price: "R$ 59",
      period: "/mês",
      description: "For growing businesses",
      icon: Crown,
      popular: false,
      features: [
        "Unlimited companies",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "White-label options",
        "Dedicated support",
        "Advanced security",
        "Custom workflows",
      ],
    },
  ]

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      // Mock upgrade process - in production, this would integrate with payment processor
      const mockPaymentData = {
        planType: selectedPlan,
        amount: selectedPlan === "premium" ? 29 : 59,
        currency: "BRL",
        paymentMethod: user.creditCard ? "card" : "pending",
        subscriptionId: `sub_${Date.now()}`,
        startDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }

      // Update user plan
      const users = JSON.parse(localStorage.getItem("users") || "[]") as StoredUserRecord[]
      const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            planType: selectedPlan,
            subscription: mockPaymentData,
          }
        }
        return u
      })

      localStorage.setItem("users", JSON.stringify(updatedUsers))
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          ...user,
          planType: selectedPlan,
          subscription: mockPaymentData,
        }),
      )

      toast.success(`Successfully upgraded to ${selectedPlan} plan!`)
      onOpenChange(false)

      // Refresh page to reflect new plan
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch {
      toast.error("Failed to upgrade plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>Unlock more features and grow your business with our premium plans.</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                selectedPlan === plan.id ? "ring-2 ring-primary border-primary" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <plan.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex items-baseline justify-center gap-1 mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-income flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">What you get with premium plans:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="h-8 w-8 text-primary" />
                <span>Advanced Analytics</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <span>Enhanced Security</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                <span>Team Collaboration</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Headphones className="h-8 w-8 text-primary" />
                <span>Priority Support</span>
              </div>
            </div>
          </div>

          {!user.creditCard && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-warning">
                <Shield className="h-4 w-4" />
                <span className="font-medium">Payment Method Required</span>
              </div>
              <p className="text-sm text-warning mt-1">
                Please add a credit card in Account Settings before upgrading.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpgrade} disabled={isLoading || !user.creditCard} className="min-w-[120px]">
              {isLoading ? "Processing..." : `Upgrade to ${selectedPlan}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
