"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask?: "phone" | "cpf-cnpj"
  onValueChange?: (value: string) => void
}

const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  ({ className, type, mask, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value

      if (mask === "phone") {
        // Remove all non-digits
        const digitsOnly = value.replace(/\D/g, "")

        // Limit to 11 digits
        const limitedDigits = digitsOnly.slice(0, 11)

        // Format phone number
        if (limitedDigits.length <= 10) {
          value = limitedDigits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
        } else {
          value = limitedDigits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
        }

        // Update the input value
        e.target.value = value
      } else if (mask === "cpf-cnpj") {
        // Remove all non-digits
        const digitsOnly = value.replace(/\D/g, "")

        // Limit to 14 digits
        const limitedDigits = digitsOnly.slice(0, 14)

        // Format CPF or CNPJ
        if (limitedDigits.length <= 11) {
          // Format as CPF
          value = limitedDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
        } else {
          // Format as CNPJ
          value = limitedDigits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
        }

        // Update the input value
        e.target.value = value
      }

      // Call the original onChange if provided
      if (onChange) {
        onChange(e)
      }

      // Call onValueChange with the raw value (digits only for masks)
      if (onValueChange) {
        if (mask === "phone" || mask === "cpf-cnpj") {
          onValueChange(value.replace(/\D/g, ""))
        } else {
          onValueChange(value)
        }
      }
    }

    return <Input type={type} className={cn(className)} ref={ref} onChange={handleChange} {...props} />
  },
)
InputMask.displayName = "InputMask"

export { InputMask }
