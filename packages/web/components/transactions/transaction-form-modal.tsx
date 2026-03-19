"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useCategories } from "@/hooks/use-categories"
import { useCategoryGroups } from "@/hooks/use-category-groups"
import { useAreas } from "@/hooks/use-areas"
import { transactionSchema, type TransactionFormData } from "@/lib/shared/validations"
import type { Transaction, DayOfWeek } from "@/lib/shared/types"
import { formatDateToPtBR, formatDateToISO } from "@/lib/shared/date-utils"
import { Users, ChevronRight, Repeat, Info, Trash2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useActionButton } from "@/hooks/use-action-button"
import { DatePicker } from "@/components/ui/date-picker"
import { IconWithText } from "@/components/ui/dynamic-icon"
import { Building, Calendar, ArrowUpDown, DollarSign, Tag, CheckCircle } from "lucide-react"
import { DynamicIcon } from "@/components/ui/dynamic-icon"
import { toast } from "sonner"

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: TransactionFormData) => Promise<void>
  onDeleteRecurrence?: (
    transaction: Transaction,
    applyMode: "thisAndFollowing" | "keepThisDeleteFollowing" | "allRecords",
  ) => Promise<void>
  transaction?: Transaction | null
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSubmit,
  onDeleteRecurrence,
  transaction,
}: TransactionFormModalProps) {
  const { categories } = useCategories()
  const { categoryGroups } = useCategoryGroups()
  const { areas } = useAreas()
  const [displayAmount, setDisplayAmount] = useState("")
  const [displayDate, setDisplayDate] = useState("")
  const [displayEndDate, setDisplayEndDate] = useState("")
  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [selectedCategoryGroupId, setSelectedCategoryGroupId] = useState<string>("")
  const [isRecurringEdit, setIsRecurringEdit] = useState(false)
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<TransactionFormData | null>(null)
  const [selectedApplyMode, setSelectedApplyMode] = useState<"single" | "future" | "all">("single")
  const [showDeleteRecurrenceModal, setShowDeleteRecurrenceModal] = useState(false)
  const [deleteRecurrenceMode, setDeleteRecurrenceMode] = useState<"thisEvent" | "followingEvents" | "allEvents">(
    "thisEvent",
  )
  const [isRecurrenceDetailsOpen, setIsRecurrenceDetailsOpen] = useState(false)
  const [endDateValidationMessage, setEndDateValidationMessage] = useState("")

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      categoryId: "",
      contactId: "",
      description: "",
      type: "expense",
      status: "pending",
      notes: "",
      recurrence: {
        enabled: false,
        frequency: "monthly",
        interval: 1,
        count: 2,
        endType: "count",
        daysOfWeek: [],
        dayOfMonth: 1,
        weekOfMonth: "first",
        monthOfYear: 1,
        monthlyType: "dayOfMonth",
      },
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    if (!numericValue) return ""
    return (Number.parseInt(numericValue, 10) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const parseCurrencyInput = (formattedValue: string): number => {
    const numericValue = formattedValue
      .replace(/[R$\s]/g, "")
      .replace(/\./g, "")
      .replace(",", ".")
    return Number.parseFloat(numericValue) || 0
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatCurrencyInput(inputValue)
    const numericValue = parseCurrencyInput(formatted)
    setDisplayAmount(formatted)
    setValue("amount", numericValue, { shouldDirty: true })
  }

  const handleDateChange = (dateString: string) => {
    setDisplayDate(dateString)

    // Convert pt-BR format to ISO for form
    if (dateString && dateString.includes("/")) {
      const isoDate = formatDateToISO(dateString)
      setValue("date", isoDate, { shouldDirty: true })
    }
  }

  const handleCalendarSelect = (isoDate: string) => {
    // Set form value directly with ISO date
    setValue("date", isoDate, { shouldDirty: true })

    // Format ISO date to pt-BR for display (avoid Date object conversion)
    const [year, month, day] = isoDate.split("-")
    const ptBRDate = `${day}/${month}/${year}`
    setDisplayDate(ptBRDate)
  }

  const handleEndDateChange = (formattedDate: string) => {
    setDisplayEndDate(formattedDate)
    if (formattedDate.length === 10) {
      const isoDate = formatDateToISO(formattedDate)
      if (isoDate) {
        validateEndDate(isoDate)
        setValue("recurrence.endDate", isoDate, { shouldDirty: true })
      }
    }
  }

  const handleEndDateCalendarSelect = (isoDate: string) => {
    validateEndDate(isoDate)
    setValue("recurrence.endDate", isoDate, { shouldDirty: true })
  }

  const validateEndDate = (endDate: string) => {
    const selectedDays = watch("recurrence.daysOfWeek") || []
    const frequency = watch("recurrence.frequency")
    const interval = watch("recurrence.interval") || 1
    const startDate = new Date(watch("date"))
    const endDateObj = new Date(endDate)

    if (frequency === "weekly" && selectedDays.length > 0) {
      const maxRecordsPerDay = 99
      const maxTotalRecords = selectedDays.length * maxRecordsPerDay

      // Calculate how many weeks between start and end date
      const timeDiff = endDateObj.getTime() - startDate.getTime()
      const weeksDiff = Math.ceil(timeDiff / (7 * 24 * 60 * 60 * 1000))
      const weeksWithInterval = Math.ceil(weeksDiff / interval)
      const estimatedRecords = weeksWithInterval * selectedDays.length

      if (estimatedRecords > maxTotalRecords) {
        // Calculate the maximum valid end date
        const maxWeeks = Math.floor(maxRecordsPerDay / selectedDays.length) * interval
        const maxEndDate = new Date(startDate)
        maxEndDate.setDate(maxEndDate.getDate() + maxWeeks * 7)

        const maxEndDateFormatted = formatDateToPtBR(maxEndDate)
        setEndDateValidationMessage(
          `A data mais avançada possível para criação de registros recorrentes é ${maxEndDateFormatted}, devido à regra do sistema.`,
        )

        // Auto-adjust to maximum valid date
        const maxEndDateISO = maxEndDate.toISOString().split("T")[0]
        setValue("recurrence.endDate", maxEndDateISO, { shouldDirty: true })
        setDisplayEndDate(maxEndDateFormatted)
      } else {
        setEndDateValidationMessage("")
      }
    } else {
      setEndDateValidationMessage("")
    }
  }

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        const isRecurring = Boolean(transaction.recurrence?.enabled || transaction.recurrence?.generatedFrom)
        setIsRecurringEdit(isRecurring)

        if (transaction.recurrence?.generatedFrom) {
          // No change needed here
        } else if (transaction.recurrence?.enabled) {
          // No change needed here
        }

        const formattedAmount = transaction.amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })
        setDisplayAmount(formattedAmount)
        setDisplayDate(formatDateToPtBR(transaction.date))

        if (transaction.recurrence?.endDate) {
          setDisplayEndDate(formatDateToPtBR(transaction.recurrence.endDate))
        } else {
          setDisplayEndDate("")
        }

        const category = categories.find((c) => c.id === transaction.categoryId)
        if (category) {
          const categoryGroup = categoryGroups?.find((g) => g.id === category.categoryGroupId)
          if (categoryGroup) {
            setSelectedAreaId(categoryGroup.areaId || "")
            setSelectedCategoryGroupId(categoryGroup.id)
          }
        }

        const recurrenceData: TransactionFormData["recurrence"] = isRecurring
          ? {
              enabled: true,
              frequency: transaction.recurrence?.frequency || "monthly",
              interval: transaction.recurrence?.interval || 1,
              count: transaction.recurrence?.count || 2,
              endType: transaction.recurrence?.endType || "count",
              daysOfWeek: transaction.recurrence?.daysOfWeek || [],
              dayOfMonth: transaction.recurrence?.dayOfMonth || 1,
              weekOfMonth: "first" as const,
              monthOfYear: 1,
              monthlyType: "dayOfMonth" as const,
              endDate: transaction.recurrence?.endDate,
              generatedFrom: transaction.recurrence?.generatedFrom,
            }
          : {
              enabled: false,
              frequency: "monthly" as const,
              interval: 1,
              count: 2,
              endType: "count" as const,
              daysOfWeek: [] as DayOfWeek[],
              dayOfMonth: 1,
              weekOfMonth: "first" as const,
              monthOfYear: 1,
              monthlyType: "dayOfMonth" as const,
            }

        setValue("recurrence", recurrenceData)

        reset({
          date: transaction.date,
          amount: transaction.amount,
          categoryId: transaction.categoryId,
          contactId: transaction.contactId || "",
          description: transaction.description || "",
          type: transaction.type,
          status: transaction.status || "pending",
          notes: transaction.notes || "",
          recurrence: recurrenceData,
        })
      } else {
        setIsRecurringEdit(false)
        setDisplayAmount("")
        setDisplayDate(formatDateToPtBR(new Date()))
        setDisplayEndDate("")
        setEndDateValidationMessage("")
        setSelectedAreaId("")
        setSelectedCategoryGroupId("")

        const defaultRecurrence = {
          enabled: false,
          frequency: "monthly" as const,
          interval: 1,
          count: 2,
          endType: "count" as const,
          daysOfWeek: [] as DayOfWeek[],
          dayOfMonth: 1,
          weekOfMonth: "first" as const,
          monthOfYear: 1,
          monthlyType: "dayOfMonth" as const,
        }

        setValue("recurrence", defaultRecurrence)

        reset({
          date: new Date().toISOString().split("T")[0],
          amount: 0,
          categoryId: "",
          contactId: "",
          description: "",
          type: "expense",
          status: "pending",
          notes: "",
          recurrence: defaultRecurrence,
        })
      }
    }
  }, [isOpen, transaction, reset, categories, categoryGroups, setValue])

  useEffect(() => {
    if (transaction) {
      // Reset form with transaction data
      reset({
        date: transaction.date,
        amount: transaction.amount,
        categoryId: transaction.categoryId || "",
        contactId: transaction.contactId || "",
        description: transaction.description || "",
        type: transaction.type,
        status: transaction.status,
        notes: transaction.notes || "",
        recurrence: {
          enabled: transaction.recurrence?.enabled || false,
          frequency: transaction.recurrence?.frequency || "monthly",
          interval: transaction.recurrence?.interval || 1,
          count: transaction.recurrence?.count || 2,
          endType: transaction.recurrence?.endType || "count",
          daysOfWeek: transaction.recurrence?.daysOfWeek || [],
          dayOfMonth: transaction.recurrence?.dayOfMonth || 1,
          weekOfMonth: "first",
          monthOfYear: 1,
          monthlyType: "dayOfMonth",
        },
      })

      setDisplayAmount(
        transaction.amount.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      )

      // Convert ISO date to pt-BR format for display
      if (transaction.date) {
        const [year, month, day] = transaction.date.split("-")
        const ptBRDate = `${day}/${month}/${year}`
        setDisplayDate(ptBRDate)
      }
    }
  }, [transaction, reset])

  const selectedCategoryId = watch("categoryId")
  const transactionType = watch("type")
  const recurrenceEnabled = watch("recurrence.enabled")
  const recurrenceFrequency = watch("recurrence.frequency")
  const recurrenceEndType = watch("recurrence.endType")
  const transactionDate = watch("date")

  const selectedCategoryGroupIdFromForm = watch("categoryGroupId")

  const effectiveCategoryGroupId = selectedCategoryGroupIdFromForm || selectedCategoryGroupId

  const availableAreas = useMemo(() => {
    if (!areas || !categories || !categoryGroups) return []

    const filteredAreas = areas
      .filter((area) => {
        const hasValidCategories = categories.some((category) => {
          const matchesType = category.type === transactionType
          const isActive = category.status === "active"
          const hasValidGroup = categoryGroups.some(
            (group) => group.id === category.categoryGroupId && group.areaId === area.id && group.status === "active",
          )
          return matchesType && isActive && hasValidGroup
        })
        return area.status === "active" && hasValidCategories
      })
      .map((area) => ({
        value: area.id,
        label: area.name,
        name: area.name,
        color: area.color,
        icon: area.icon,
      }))
      .sort((a, b) => a.name.localeCompare(b.name)) // Alphabetical order A-Z

    return filteredAreas
  }, [areas, categories, categoryGroups, transactionType])

  const availableCategoryGroups =
    categoryGroups?.filter((group) => {
      return group.status === "active" && (!selectedAreaId || group.areaId === selectedAreaId)
    }) || []

  const availableCategories =
    categories?.filter((category) => {
      const matchesType = category.type === transactionType
      const matchesGroup = !effectiveCategoryGroupId || category.categoryGroupId === effectiveCategoryGroupId
      const isActive = category.status === "active"
      return matchesType && matchesGroup && isActive
    }) || []

  const selectedArea = areas?.find((a) => a.id === selectedAreaId)
  const selectedCategoryGroup = categoryGroups?.find((g) => g.id === selectedCategoryGroupId)
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId)

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId)
    setSelectedCategoryGroupId("")
    setValue("categoryId", "", { shouldDirty: true })
  }

  const handleCategoryGroupChange = (groupId: string) => {
    setSelectedCategoryGroupId(groupId)
    setValue("categoryGroupId", groupId, { shouldDirty: true })
    setValue("categoryId", "", { shouldDirty: true })
  }

  const handleTypeChange = (type: "income" | "expense") => {
    setValue("type", type, { shouldDirty: true })

    // Clear all dependent fields when type changes
    const currentAreaId = selectedAreaId
    setSelectedAreaId("")
    setSelectedCategoryGroupId("")
    setValue("areaId", "", { shouldDirty: true })
    setValue("categoryGroupId", "", { shouldDirty: true })
    setValue("categoryId", "", { shouldDirty: true })

    if (currentAreaId) {
      void currentAreaId
    }
  }

  const submitButton = useActionButton({
    actionName: transaction ? "Transação atualizada" : "Transação criada",
    onAction: async () => {
      const data = form.getValues()

      const submissionData = transaction ? { ...data, id: transaction.id } : data

      if (transaction?.recurrence?.generatedFrom && submissionData.recurrence) {
        submissionData.recurrence.generatedFrom = transaction.recurrence.generatedFrom
      }

      if (isRecurringEdit && transaction) {
        setPendingFormData(submissionData)
        setShowRecurringModal(true)
        return
      }

      await onSubmit(submissionData)
      onClose()
      form.reset()
      setSelectedAreaId("")
      setSelectedCategoryGroupId("")
    },
  })

  const recurringEditButton = useActionButton({
    actionName: "Transação recorrente atualizada",
    onAction: async () => {
      if (!pendingFormData) return

      if (transaction?.recurrence?.generatedFrom && pendingFormData.recurrence) {
        pendingFormData.recurrence.generatedFrom = transaction.recurrence.generatedFrom
      }

      const dataWithApplyMode = {
        ...pendingFormData,
        applyMode: selectedApplyMode,
      }

      await onSubmit(dataWithApplyMode)
      setShowRecurringModal(false)
      setPendingFormData(null)
      onClose()
      form.reset()
      setSelectedAreaId("")
      setSelectedCategoryGroupId("")
    },
  })

  const handleFormSubmit = async () => {
    await submitButton.execute()
  }

  const dayOfWeekLabels: Record<DayOfWeek, string> = {
    monday: "S",
    tuesday: "T",
    wednesday: "Q",
    thursday: "Q",
    friday: "S",
    saturday: "S",
    sunday: "D",
  }


  const dayOfWeekOptions: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]

  const handleRecurrenceToggle = (enabled: boolean) => {
    setValue("recurrence.enabled", enabled)
  }

  const handleFrequencyChange = (frequency: "daily" | "weekly" | "monthly" | "yearly") => {
    setValue("recurrence.frequency", frequency, { shouldDirty: true, shouldValidate: true })
  }

  const handleDaysOfWeekChange = (day: DayOfWeek, checked: boolean) => {
    const currentDays = watch("recurrence.daysOfWeek") || []
    const newDays = checked ? [...currentDays, day] : currentDays.filter((d) => d !== day)
    setValue("recurrence.daysOfWeek", newDays)

    const endDate = watch("recurrence.endDate")
    if (endDate && watch("recurrence.endType") === "date") {
      setTimeout(() => validateEndDate(endDate), 100)
    }
  }

  const handleEndTypeChange = (type: "count" | "date") => {
    setValue("recurrence.endType", type)
    if (type === "count") {
      setValue("recurrence.endDate", undefined)
      setDisplayEndDate("")
      setEndDateValidationMessage("")
    } else {
      setValue("recurrence.count", undefined)
    }
  }

  const getMonthlyOptions = () => {
    if (!transactionDate) return []

    const date = new Date(transactionDate)
    const dayOfMonth = date.getDate()

    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
    const weekOfMonth = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7)

    const dayNames = [
      "domingo",
      "segunda-feira",
      "terça-feira",
      "quarta-feira",
      "quinta-feira",
      "sexta-feira",
      "sábado",
    ]
    const dayOfWeek = dayNames[date.getDay()]

    const ordinals = ["primeira", "segunda", "terceira", "quarta", "quinta"]
    const ordinal = ordinals[weekOfMonth - 1] || "última"

    return [
      {
        value: "dayOfMonth",
        label: `Mensal no dia ${dayOfMonth}`,
        dayOfMonth: dayOfMonth,
      },
      {
        value: "weekOfMonth",
        label: `Mensal no(a) ${ordinal} ${dayOfWeek}`,
        weekOfMonth: weekOfMonth,
        dayOfWeek: date.getDay(),
      },
    ]
  }

  const hasExistingRecurrence = transaction?.recurrence?.enabled || transaction?.recurrence?.generatedFrom

  const handleDeleteRecurrence = async () => {
    if (!transaction || !onDeleteRecurrence) return

    try {
      const modeMap = {
        thisEvent: "keepThisDeleteFollowing",
        followingEvents: "thisAndFollowing",
        allEvents: "allRecords",
      } as const
      await onDeleteRecurrence(transaction, modeMap[deleteRecurrenceMode])
      setShowDeleteRecurrenceModal(false)
      onClose()
    } catch {
      toast.error("Nao foi possivel excluir a recorrencia")
    }
  }

  const handleDeleteRecurrenceCancel = () => {
    setShowDeleteRecurrenceModal(false)
    setDeleteRecurrenceMode("thisEvent")
  }

  const handleRecurringEditCancel = () => {
    setShowRecurringModal(false)
  }

  // const [date, setDate] = useState<string>(new Date().toLocaleDateString("pt-BR"))
  const [status, setStatus] = useState<"pending" | "completed" | "cancelled">("pending")
  const handleCategoryChange = (categoryId: string) => {
    setValue("categoryId", categoryId, { shouldDirty: true })
  }

  useEffect(() => {
    if (isOpen && !transaction) {
    }
  }, [isOpen, transaction])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto" key={transaction?.id || "new"}>
          <DialogHeader>
            {transaction?.id && (
              <div className="absolute top-2 left-2 text-xs text-gray-400 font-mono bg-gray-50 px-1 py-0.5 rounded">
                ID: {transaction.id}
              </div>
            )}
            <DialogTitle>{transaction ? "Editar Transação" : "Nova Transação"}</DialogTitle>
            <DialogDescription>
              {transaction
                ? "Edite os dados da transação e clique em Atualizar para salvar as alterações."
                : "Preencha os dados da nova transação e clique em Criar para adicionar ao sistema."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Row 1: Data, Tipo, and Valor (25%, 25%, 50%) */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data
                </Label>
                <DatePicker
                  value={displayDate}
                  onChange={handleDateChange}
                  onCalendarSelect={handleCalendarSelect}
                  placeholder="dd/mm/aaaa"
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Tipo
                </Label>
                <Select
                  value={transactionType}
                  onValueChange={(value: "income" | "expense") => handleTypeChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor
                </Label>
                <Input type="text" value={displayAmount} onChange={handleAmountChange} placeholder="R$ 0,00" />
              </div>
            </div>

            {/* Row 2: Área and Grupo side by side (50% each) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Área
                </Label>
                <Select value={selectedAreaId} onValueChange={handleAreaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAreas.map((area) => (
                      <SelectItem key={area.value} value={area.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                          <IconWithText iconName={area.icon} text={area.name} iconSize={14} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Grupo Categoria
                </Label>
                <Select
                  value={selectedCategoryGroupId}
                  onValueChange={handleCategoryGroupChange}
                  disabled={!selectedAreaId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={selectedAreaId ? "Selecione um grupo categoria" : "Selecione uma área primeiro"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategoryGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.color }} />
                          <IconWithText iconName={group.icon} text={group.name} iconSize={14} />
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Categoria and Status da Transação side by side (50% each) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Categoria
                </Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={handleCategoryChange}
                  disabled={!effectiveCategoryGroupId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        effectiveCategoryGroupId ? "Selecione uma categoria" : "Selecione um grupo categoria primeiro"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="ml-[5%]">
                <Label className="mb-2 block text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Status da Transação
                </Label>
                <Select value={status} onValueChange={(value) => setStatus(value as "pending" | "completed" | "cancelled")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
                Descrição
              </Label>
              <Textarea
                id="description"
                placeholder="Descrição da transação (opcional)"
                {...register("description")}
                className="w-full"
                rows={3}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-slate-600" />
                  <Label className="text-sm font-medium text-slate-700">Recorrência</Label>
                </div>
                {hasExistingRecurrence && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteRecurrenceModal(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Excluir recorrência
                  </Button>
                )}
              </div>

              {hasExistingRecurrence ? (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <p className="text-sm text-amber-800 font-medium">
                      Para alterar a recorrência, exclua a atual e crie uma nova.
                    </p>
                  </div>

                  <Collapsible open={isRecurrenceDetailsOpen} onOpenChange={setIsRecurrenceDetailsOpen}>
                    <CollapsibleTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full justify-between p-3 h-auto bg-blue-50 border border-blue-200 hover:bg-blue-100"
                      >
                        <div className="flex items-start text-blue-700">
                          <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm font-medium text-left">
                            <div>Para alterar a recorrência, exclua a atual.</div>
                            <div className="text-xs font-normal mt-1">Clique aqui para mais detalhes.</div>
                          </div>
                        </div>
                        {isRecurrenceDetailsOpen ? (
                          <ChevronUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-blue-600" />
                        )}
                      </Button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <Card className="bg-blue-50 border-blue-200 border-t-0 rounded-t-none">
                        <CardContent className="p-3 space-y-1">
                          <div className="grid grid-cols-1 gap-1 text-sm">
                            <div className="flex justify-between py-1">
                              <span className="text-slate-600">Frequência:</span>
                              <span className="font-medium">
                                {recurrenceFrequency === "daily" && "Diário"}
                                {recurrenceFrequency === "weekly" && "Semanal"}
                                {recurrenceFrequency === "monthly" && "Mensal"}
                                {recurrenceFrequency === "yearly" && "Anual"}
                              </span>
                            </div>

                            <div className="flex justify-between py-1">
                              <span className="text-slate-600">Intervalo:</span>
                              <span className="font-medium">
                                A cada {watch("recurrence.interval") || 1}{" "}
                                {recurrenceFrequency === "daily"
                                  ? "dia(s)"
                                  : recurrenceFrequency === "weekly"
                                    ? "semana(s)"
                                    : recurrenceFrequency === "monthly"
                                      ? "mês(es)"
                                      : "ano(s)"}
                              </span>
                            </div>

                            <div className="flex justify-between py-1">
                              <span className="text-slate-600">Data de início:</span>
                              <span className="font-medium">
                                {watch("date") ? new Date(watch("date")).toLocaleDateString("pt-BR") : ""}
                              </span>
                            </div>

                            <div className="flex justify-between py-1">
                              <span className="text-slate-600">Término:</span>
                              <span className="font-medium">
                                {recurrenceEndType === "count"
                                  ? `Após ${watch("recurrence.count")} ocorrências`
                                  : `Em ${watch("recurrence.endDate")}`}
                              </span>
                            </div>

                            {recurrenceFrequency === "weekly" && watch("recurrence.daysOfWeek") && (
                              <div className="flex justify-between py-1">
                                <span className="text-slate-600">Dias da semana:</span>
                                <span className="font-medium">
                                  {(watch("recurrence.daysOfWeek") || [])
                                    .map((day: string) => {
                                      const dayNames: Record<string, string> = {
                                        sunday: "Dom",
                                        monday: "Seg",
                                        tuesday: "Ter",
                                        wednesday: "Qua",
                                        thursday: "Qui",
                                        friday: "Sex",
                                        saturday: "Sáb",
                                      }
                                      return dayNames[day] || day
                                    })
                                    .join(", ")}
                                </span>
                              </div>
                            )}

                            {(transaction?.parentId || transaction?.generatedFrom) && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">ID do registro pai:</span>
                                <span className="font-mono text-xs font-medium bg-slate-100 px-2 py-1 rounded">
                                  {transaction?.parentId || transaction?.generatedFrom}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="no-repeat"
                        name="recurrence"
                        checked={!recurrenceEnabled}
                        onChange={() => handleRecurrenceToggle(false)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="no-repeat" className="text-sm font-medium">
                        Não se repete
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="repeats"
                        name="recurrence"
                        checked={recurrenceEnabled}
                        onChange={() => handleRecurrenceToggle(true)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <Label htmlFor="repeats" className="text-sm font-medium">
                        Se repete...
                      </Label>
                    </div>
                  </div>

                  {recurrenceEnabled && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center text-blue-700 mb-3">
                          <Info className="h-4 w-4 mr-2" />
                          <span className="text-sm font-medium">Transação recorrente</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="interval" className="text-xs text-slate-600 mb-2 block">
                              Repetir a cada
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id="interval"
                                type="number"
                                min="1"
                                max="99"
                                value={watch("recurrence.interval") || 1}
                                onChange={(e) =>
                                  setValue(
                                    "recurrence.interval",
                                    Math.min(99, Math.max(1, Number.parseInt(e.target.value) || 1)),
                                  )
                                }
                                className="h-8 text-xs flex-1"
                              />
                              <Select value={recurrenceFrequency || "daily"} onValueChange={handleFrequencyChange}>
                                <SelectTrigger className="h-8 text-xs flex-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Dia(s)</SelectItem>
                                  <SelectItem value="weekly">Semana(s)</SelectItem>
                                  <SelectItem value="monthly">Mês(es)</SelectItem>
                                  <SelectItem value="yearly">Ano(s)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs text-slate-600 mb-2 block">Termina em</Label>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="end-date"
                                  name="endType"
                                  checked={recurrenceEndType === "date"}
                                  onChange={() => handleEndTypeChange("date")}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <Label htmlFor="end-date" className="text-xs font-medium">
                                  Em
                                </Label>
                                <DatePicker
                                  value={displayEndDate}
                                  onChange={handleEndDateChange}
                                  onCalendarSelect={handleEndDateCalendarSelect}
                                  placeholder="dd/mm/aaaa"
                                  disabled={recurrenceEndType !== "date"}
                                  className="h-6 text-xs flex-1"
                                />
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  id="end-count"
                                  name="endType"
                                  checked={recurrenceEndType === "count"}
                                  onChange={() => handleEndTypeChange("count")}
                                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <Label htmlFor="end-count" className="text-xs font-medium">
                                  Após
                                </Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max="99"
                                  value={watch("recurrence.count") || 2}
                                  onChange={(e) => {
                                    const value = Math.min(99, Math.max(1, Number.parseInt(e.target.value) || 2))
                                    setValue("recurrence.count", value)
                                  }}
                                  disabled={recurrenceEndType !== "count"}
                                  className="h-6 text-xs w-16"
                                />
                                <span className="text-xs text-slate-600">ocorrências</span>
                              </div>
                            </div>

                            {endDateValidationMessage && (
                              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                                <strong>{endDateValidationMessage}</strong>
                              </div>
                            )}
                          </div>
                        </div>

                        {recurrenceFrequency === "weekly" && (
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">Dias da semana</Label>
                            <div className="flex gap-1">
                              {dayOfWeekOptions.map((day) => (
                                <div key={day} className="flex flex-col items-center">
                                  <Label htmlFor={day} className="text-xs mb-1">
                                    {dayOfWeekLabels[day]}
                                  </Label>
                                  <Checkbox
                                    id={day}
                                    checked={(watch("recurrence.daysOfWeek") || []).includes(day)}
                                    onCheckedChange={(checked) => handleDaysOfWeekChange(day, !!checked)}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {recurrenceFrequency === "monthly" && (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-slate-700">Repetir no</Label>
                              <Select
                                value={watch("recurrence.monthlyType") || "dayOfMonth"}
                                onValueChange={(value) => {
                                  setValue("recurrence.monthlyType", value as "dayOfMonth" | "weekOfMonth")
                                  const options = getMonthlyOptions()
                                  const selectedOption = options.find((opt) => opt.value === value)
                                  if (selectedOption) {
                                    if (value === "dayOfMonth") {
                                      setValue("recurrence.dayOfMonth", selectedOption.dayOfMonth)
                                    } else {
                                      setValue(
                                        "recurrence.weekOfMonth",
                                        selectedOption.weekOfMonth === 1
                                          ? "first"
                                          : selectedOption.weekOfMonth === 2
                                            ? "second"
                                            : selectedOption.weekOfMonth === 3
                                              ? "third"
                                              : selectedOption.weekOfMonth === 4
                                                ? "fourth"
                                                : "last",
                                      )
                                      const dayMap: Record<number, DayOfWeek> = {
                                        0: "sunday",
                                        1: "monday",
                                        2: "tuesday",
                                        3: "wednesday",
                                        4: "thursday",
                                        5: "friday",
                                        6: "saturday",
                                      }
                                      setValue("recurrence.dayOfWeek", dayMap[selectedOption.dayOfWeek || 0])
                                    }
                                  }
                                }}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getMonthlyOptions().map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {recurrenceFrequency === "yearly" && (
                          <div className="space-y-2">
                            <div className="text-sm text-slate-600">
                              <Info className="h-4 w-4 inline mr-1" />
                              Repetirá anualmente em {formatDateToPtBR(transactionDate)} nos próximos anos
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>

            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="py-2 px-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-600">Hierarquia:</span>
                  {selectedArea ? (
                    <>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedArea.color }} />
                        <DynamicIcon iconName={selectedArea.icon} size={14} />
                        <span className="font-medium">{selectedArea.name}</span>
                      </div>
                      {selectedCategoryGroup && <ChevronRight className="h-3 w-3 text-slate-400" />}
                    </>
                  ) : (
                    <span className="text-slate-400 italic">Selecione uma área</span>
                  )}
                  {selectedCategoryGroup ? (
                    <>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: selectedCategoryGroup.color }}
                        />
                        <DynamicIcon iconName={selectedCategoryGroup.icon} size={14} />
                        <span className="font-medium">{selectedCategoryGroup.name}</span>
                      </div>
                      {selectedCategory && <ChevronRight className="h-3 w-3 text-slate-400" />}
                    </>
                  ) : selectedArea ? (
                    <span className="text-slate-400 italic">→ Selecione um grupo</span>
                  ) : null}
                  {selectedCategory ? (
                    <span className="font-medium">{selectedCategory.name}</span>
                  ) : selectedCategoryGroup ? (
                    <span className="text-slate-400 italic">→ Selecione uma categoria</span>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" {...submitButton.buttonProps}>
                {submitButton.getButtonText(transaction ? "Atualizar" : "Criar")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteRecurrenceModal} onOpenChange={handleDeleteRecurrenceCancel}>
        <DialogContent className="sm:max-w-md bg-white shadow-xl border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Trash2 className="h-5 w-5 text-red-600" />
              Excluir transações recorrentes
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Como você deseja excluir a recorrência desta transação?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="delete-this-event"
                  name="deleteMode"
                  value="thisEvent"
                  checked={deleteRecurrenceMode === "thisEvent"}
                  onChange={(e) =>
                    setDeleteRecurrenceMode(e.target.value as "thisEvent" | "followingEvents" | "allEvents")
                  }
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="delete-this-event" className="text-sm font-medium cursor-pointer block">
                    Este registro
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">Exclui apenas este registro. Os outros permanecem.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="delete-following-events"
                  name="deleteMode"
                  value="followingEvents"
                  checked={deleteRecurrenceMode === "followingEvents"}
                  onChange={(e) =>
                    setDeleteRecurrenceMode(e.target.value as "thisEvent" | "followingEvents" | "allEvents")
                  }
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="delete-following-events" className="text-sm font-medium cursor-pointer block">
                    Este registro e os seguintes
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">Exclui este registro e os posteriores.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  id="delete-all-events"
                  name="deleteMode"
                  value="allEvents"
                  checked={deleteRecurrenceMode === "allEvents"}
                  onChange={(e) =>
                    setDeleteRecurrenceMode(e.target.value as "thisEvent" | "followingEvents" | "allEvents")
                  }
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 mt-0.5"
                />
                <div className="flex-1">
                  <Label htmlFor="delete-all-events" className="text-sm font-medium cursor-pointer block">
                    Todos os registros
                  </Label>
                  <p className="text-xs text-gray-500 mt-1">
                    Exclui todos os registros: os anteriores, este e os posteriores.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDeleteRecurrenceCancel}
              className="flex-1 bg-transparent"
            >
              Cancelar
            </Button>
            <Button onClick={handleDeleteRecurrence} className="flex-1 bg-red-600 hover:bg-red-700">
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRecurringModal} onOpenChange={handleRecurringEditCancel}>
        <DialogContent className="sm:max-w-md bg-white shadow-xl border-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Repeat className="h-5 w-5 text-blue-600" />
              Editar transação recorrente
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Esta é uma transação recorrente. Como você deseja aplicar as alterações?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="apply-single-modal"
                    name="applyModeModal"
                    value="single"
                    checked={selectedApplyMode === "single"}
                    onChange={(e) => setSelectedApplyMode(e.target.value as "single" | "future" | "all")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="apply-single-modal" className="text-sm font-semibold cursor-pointer">
                    Este registro
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-7">Atualiza apenas este registro. Os outros permanecem.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="apply-future-modal"
                    name="applyModeModal"
                    value="future"
                    checked={selectedApplyMode === "future"}
                    onChange={(e) => setSelectedApplyMode(e.target.value as "single" | "future" | "all")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="apply-future-modal" className="text-sm font-semibold cursor-pointer">
                    Este registro e os seguintes
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-7">Altera este registro e os posteriores.</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="apply-all-modal"
                    name="applyModeModal"
                    value="all"
                    checked={selectedApplyMode === "all"}
                    onChange={(e) => setSelectedApplyMode(e.target.value as "single" | "future" | "all")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <Label htmlFor="apply-all-modal" className="text-sm font-semibold cursor-pointer">
                    Todos os registros
                  </Label>
                </div>
                <p className="text-xs text-gray-600 ml-7">
                  Altera todos os registros: os anteriores, este e os posteriores.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowRecurringModal(false)}>
              Cancelar
            </Button>
            <Button {...recurringEditButton.buttonProps} className="bg-blue-600 hover:bg-blue-700">
              {recurringEditButton.getButtonText("Confirmar")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
