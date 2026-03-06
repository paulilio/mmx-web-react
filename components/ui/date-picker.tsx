"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  onCalendarSelect?: (date: string) => void
}

export function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  disabled = false,
  className,
  id,
  onCalendarSelect,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (inputValue.length <= 10) {
      let formatted = inputValue.replace(/\D/g, "")

      // Add first slash after day (2 digits)
      if (formatted.length >= 2) {
        formatted = formatted.substring(0, 2) + "/" + formatted.substring(2)
      }

      // Add second slash after month (5 characters including first slash)
      if (formatted.length >= 5) {
        formatted = formatted.substring(0, 5) + "/" + formatted.substring(5, 9)
      }

      onChange(formatted)
    }
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const day = date.getDate().toString().padStart(2, "0")

      // Format for display (pt-BR format)
      const formattedDate = `${day}/${month}/${year}`
      onChange(formattedDate)
      setIsOpen(false)

      if (onCalendarSelect) {
        // Use same date values for ISO format
        const isoDate = `${year}-${month}-${day}`
        onCalendarSelect(isoDate)
      }
    }
  }

  const parseDisplayDate = (displayValue: string): Date | undefined => {
    if (displayValue.length === 10) {
      const [day, month, year] = displayValue.split("/")
      if (day && month && year) {
        const parsedDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T12:00:00.000Z`)
        return parsedDate
      }
    }
    return undefined
  }

  const selectedDate = parseDisplayDate(value)

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={cn("pr-10", className)}
        maxLength={10}
      />
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => {
              setIsOpen(!isOpen)
            }}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleCalendarSelect}
            initialFocus
            locale={{
              localize: {
                day: (n: number) => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][n],
                month: (n: number) =>
                  [
                    "Janeiro",
                    "Fevereiro",
                    "Março",
                    "Abril",
                    "Maio",
                    "Junho",
                    "Julho",
                    "Agosto",
                    "Setembro",
                    "Outubro",
                    "Novembro",
                    "Dezembro",
                  ][n],
              },
              formatLong: {
                date: () => "dd/MM/yyyy",
              },
              code: "pt-BR",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
