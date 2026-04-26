"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { InputMask } from "@/components/ui/input-mask"
import { User, Phone, Camera, Lock, CreditCard, Plus, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import type { CreditCardInfo } from "@/types/auth"

interface AccountSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type StoredUserRecord = {
  id: string
  password?: string
  creditCard?: CreditCardInfo
  [key: string]: unknown
}

export function AccountSettingsModal({ open, onOpenChange }: AccountSettingsModalProps) {
  const { user, logoutAllDevices } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.email || "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [newCardForm, setNewCardForm] = useState({
    number: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    holderName: "",
  })

  const [showAddCard, setShowAddCard] = useState(false)

  if (!user) return null

  const getInitials = (firstName: string, lastName?: string) => {
    return `${firstName.charAt(0)}${(lastName ?? "").charAt(0)}`.toUpperCase()
  }

  const handleProfileUpdate = async () => {
    setIsLoading(true)
    try {
      // Mock API call - in production, this would be a real API
      const users = JSON.parse(localStorage.getItem("users") || "[]") as StoredUserRecord[]
      const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
          return {
            ...u,
            firstName: profileForm.firstName,
            lastName: profileForm.lastName,
            phone: profileForm.phone,
          }
        }
        return u
      })

      localStorage.setItem("users", JSON.stringify(updatedUsers))
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          ...user,
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          phone: profileForm.phone,
        }),
      )

      toast.success("Profile updated successfully!")
    } catch {
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match")
      return
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsLoading(true)
    try {
      // Mock password change - in production, verify current password and hash new one
      const users = JSON.parse(localStorage.getItem("users") || "[]") as StoredUserRecord[]
      const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
          return { ...u, password: passwordForm.newPassword } // In production, hash this
        }
        return u
      })

      localStorage.setItem("users", JSON.stringify(updatedUsers))
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast.success("Password changed successfully!")
    } catch {
      toast.error("Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCreditCard = async () => {
    if (!newCardForm.number || !newCardForm.expiryMonth || !newCardForm.expiryYear || !newCardForm.holderName) {
      toast.error("Please fill all required fields")
      return
    }

    setIsLoading(true)
    try {
      // Mock credit card storage - NEVER store real card numbers in production
      const maskedNumber = `**** **** **** ${newCardForm.number.slice(-4)}`
      const brand = newCardForm.number.startsWith("4")
        ? "visa"
        : newCardForm.number.startsWith("5")
          ? "mastercard"
          : "unknown"

      const newCard: CreditCardInfo = {
        id: `card_${Date.now()}`,
        maskedNumber,
        brand,
        expiryMonth: newCardForm.expiryMonth,
        expiryYear: newCardForm.expiryYear,
        holderName: newCardForm.holderName,
        isDefault: !user.creditCard, // First card becomes default
        createdAt: new Date().toISOString(),
      }

      // Store in user profile
      const users = JSON.parse(localStorage.getItem("users") || "[]") as StoredUserRecord[]
      const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
          return { ...u, creditCard: newCard }
        }
        return u
      })

      localStorage.setItem("users", JSON.stringify(updatedUsers))
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          ...user,
          creditCard: newCard,
        }),
      )

      setNewCardForm({ number: "", expiryMonth: "", expiryYear: "", cvv: "", holderName: "" })
      setShowAddCard(false)
      toast.success("Credit card added successfully!")
    } catch {
      toast.error("Failed to add credit card")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCreditCard = async () => {
    setIsLoading(true)
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]") as StoredUserRecord[]
      const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
          const { creditCard: _creditCard, ...userWithoutCard } = u
          return userWithoutCard
        }
        return u
      })

      localStorage.setItem("users", JSON.stringify(updatedUsers))
      const { creditCard: _creditCard, ...userWithoutCard } = user
      localStorage.setItem("auth_user", JSON.stringify(userWithoutCard))

      toast.success("Credit card removed successfully!")
    } catch {
      toast.error("Failed to remove credit card")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = () => {
    // Mock photo upload - in production, this would handle file upload
    toast.info("Photo upload will be implemented with file storage service")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>Manage your account information, security, and payment methods.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={user.profilePhoto || "/placeholder.svg"}
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" onClick={handlePhotoUpload}>
                      <Camera className="mr-2 h-4 w-4" />
                      Change Photo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <InputMask
                      id="phone"
                      mask="phone"
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profileForm.email} disabled className="bg-muted" />
                  <p className="text-sm text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
                </div>

                <Button onClick={handleProfileUpdate} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      className="pl-10 pr-10"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>

                <Button onClick={handlePasswordChange} disabled={isLoading}>
                  {isLoading ? "Changing..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Sessões ativas
                </CardTitle>
                <CardDescription>
                  Encerre todas as sessões ativas (este e demais dispositivos). Você precisará fazer login novamente.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    setIsLoading(true)
                    try {
                      const result = await logoutAllDevices()
                      toast.success(`${result.revokedCount} sessões encerradas.`)
                      onOpenChange(false)
                    } catch (error) {
                      toast.error((error as Error).message || "Erro ao encerrar sessões")
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  disabled={isLoading}
                >
                  Sair de todos os dispositivos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>Manage your credit cards and billing information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.creditCard ? (
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-foreground rounded flex items-center justify-center">
                        <span className="text-background text-xs font-bold">{user.creditCard.brand.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{user.creditCard.maskedNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {user.creditCard.expiryMonth}/{user.creditCard.expiryYear}
                        </p>
                      </div>
                      {user.creditCard.isDefault && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRemoveCreditCard} disabled={isLoading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No payment methods added</p>
                  </div>
                )}

                {showAddCard ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add Credit Card</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={newCardForm.number}
                          onChange={(e) =>
                            setNewCardForm((prev) => ({ ...prev, number: e.target.value.replace(/\s/g, "") }))
                          }
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryMonth">Month</Label>
                          <Input
                            id="expiryMonth"
                            placeholder="MM"
                            maxLength={2}
                            value={newCardForm.expiryMonth}
                            onChange={(e) => setNewCardForm((prev) => ({ ...prev, expiryMonth: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryYear">Year</Label>
                          <Input
                            id="expiryYear"
                            placeholder="YY"
                            maxLength={2}
                            value={newCardForm.expiryYear}
                            onChange={(e) => setNewCardForm((prev) => ({ ...prev, expiryYear: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            maxLength={4}
                            value={newCardForm.cvv}
                            onChange={(e) => setNewCardForm((prev) => ({ ...prev, cvv: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="holderName">Cardholder Name</Label>
                        <Input
                          id="holderName"
                          placeholder="John Doe"
                          value={newCardForm.holderName}
                          onChange={(e) => setNewCardForm((prev) => ({ ...prev, holderName: e.target.value }))}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handleAddCreditCard} disabled={isLoading}>
                          {isLoading ? "Adding..." : "Add Card"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddCard(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Button variant="outline" onClick={() => setShowAddCard(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Credit Card
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
