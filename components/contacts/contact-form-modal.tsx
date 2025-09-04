"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contactSchema, type ContactFormData } from "@/lib/validations"
import { createContact, updateContact } from "@/hooks/use-contacts"
import type { Contact } from "@/lib/types"
import { mutate } from "swr"
import { Loader2 } from "lucide-react"

interface ContactFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact | null
}

export function ContactFormModal({ open, onOpenChange, contact }: ContactFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  useEffect(() => {
    if (open) {
      if (contact) {
        reset({
          name: contact.name,
          email: contact.email || "",
          phone: contact.phone || "",
          document: contact.document || "",
          type: contact.type,
        })
      } else {
        reset({
          name: "",
          email: "",
          phone: "",
          document: "",
          type: "customer",
        })
      }
    }
  }, [open, contact, reset])

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      if (contact) {
        await updateContact(contact.id, data)
      } else {
        await createContact(data)
      }

      // Revalidate contacts list
      mutate("/contacts")

      onOpenChange(false)
      reset()
    } catch (error) {
      console.error("Erro ao salvar contato:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent key={contact?.id || "new"} className="max-w-md">
        <DialogHeader>
          <DialogTitle>{contact ? "Editar Contato" : "Novo Contato"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name")} placeholder="Nome do contato" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={watch("type")}
              onValueChange={(value) => setValue("type", value as "customer" | "supplier", { shouldDirty: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Cliente</SelectItem>
                <SelectItem value="supplier">Fornecedor</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register("phone")} placeholder="(11) 99999-9999" />
          </div>

          <div>
            <Label htmlFor="document">Documento</Label>
            <Input id="document" {...register("document")} placeholder="CPF/CNPJ" />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {contact ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
