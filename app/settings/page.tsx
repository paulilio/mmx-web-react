"use client"

import { DialogDescription } from "@/components/ui/dialog"

import type React from "react"

import { useState, useRef } from "react"
import { mutate } from "swr"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAreas } from "@/hooks/use-areas"
import { useCategoryGroups } from "@/hooks/use-category-groups"
import { useActionButton } from "@/hooks/use-action-button"
import { bulkLoadData, clearAllData } from "@/lib/server/storage"
import {
  Settings,
  Link2,
  Unlink,
  Save,
  Building2,
  Users,
  Upload,
  Trash2,
  Download,
  FileText,
  AlertCircle,
  Database,
} from "lucide-react"
import { toast } from "sonner"

type SeedTableKey = "mmx_areas" | "mmx_category_groups" | "mmx_categories" | "mmx_transactions" | "mmx_contacts"

type SeedData = Record<SeedTableKey, unknown[]>

const parseStorageArray = (key: SeedTableKey): unknown[] => {
  const raw = localStorage.getItem(key)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export default function SettingsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [backupModalOpen, setBackupModalOpen] = useState(false)
  const [selectedTables, setSelectedTables] = useState<SeedTableKey[]>([])

  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])

  const { areas } = useAreas()
  const { categoryGroups, updateCategoryGroup } = useCategoryGroups()

  const exportBackupButton = useActionButton({
    actionName: "Backup exportado",
    onAction: async () => {
      if (selectedTables.length === 0) {
        toast.error("Selecione pelo menos uma tabela para exportar")
        return
      }

      try {
        const backupData: Partial<SeedData> = {}

        for (const table of selectedTables) {
          let data: unknown[] = []

          switch (table) {
            case "mmx_areas":
              data = parseStorageArray("mmx_areas")
              break
            case "mmx_category_groups":
              data = parseStorageArray("mmx_category_groups")
              break
            case "mmx_categories":
              data = parseStorageArray("mmx_categories")
              break
            case "mmx_transactions":
              data = parseStorageArray("mmx_transactions")
              break
            case "mmx_contacts":
              data = parseStorageArray("mmx_contacts")
              break
          }

          backupData[table] = data
        }

        // Generate filename with timestamp
        const now = new Date()
        const timestamp = now.toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-")
        const filename = `mmx-backup-${timestamp}.json`

        // Create and download file
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setBackupModalOpen(false)
        setSelectedTables([])
      } catch (error) {
        throw error
      }
    },
    successMessage: "Backup exportado com sucesso! O arquivo foi baixado.",
    errorMessage: "Erro ao exportar backup. Tente novamente.",
  })

  const handleTableToggle = (table: SeedTableKey) => {
    setSelectedTables((prev) => (prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]))
  }

  const availableTables: Array<{ id: SeedTableKey; label: string }> = [
    { id: "mmx_areas", label: "Áreas" },
    { id: "mmx_category_groups", label: "Grupos de Categoria" },
    { id: "mmx_categories", label: "Categorias" },
    { id: "mmx_transactions", label: "Transações" },
    { id: "mmx_contacts", label: "Contatos" },
  ]

  const uploadSeedButton = useActionButton({
    actionName: "Seed carregado",
    onAction: async () => {
      if (!selectedFile) {
        toast.error("Selecione um arquivo JSON primeiro")
        return
      }

      const text = await selectedFile.text()
      const data: unknown = JSON.parse(text)

      if (!validateSeedJSON(data)) {
        toast.error(
          "JSON inválido. Verifique se contém todas as chaves obrigatórias: mmx_areas, mmx_category_groups, mmx_categories, mmx_transactions, mmx_contacts",
        )
        return
      }

      bulkLoadData(data)

      await Promise.all([
        mutate("/areas"),
        mutate("/category-groups"),
        mutate("/categories"),
        mutate("/transactions"),
        mutate("/contacts"),
        mutate("/reports/summary"),
        mutate("/reports/aging"),
        mutate("/reports/cashflow"),
      ])

      await new Promise((resolve) => setTimeout(resolve, 500))

      setUploadModalOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
  })

  const clearDataButton = useActionButton({
    actionName: "Dados mock limpos",
    onAction: () => {
      clearAllData()
    },
    successMessage: "Dados mock limpos com sucesso. Recarregue a página manualmente para ver as mudanças.",
  })

  const downloadModelButton = useActionButton({
    actionName: "Modelo JSON baixado",
    onAction: () => {
      const model = {
        mmx_areas: [
          {
            id: "string",
            name: "string",
            type: "income | fixed_expenses | daily_expenses | personal | taxes_fees",
            description: "string",
            color: "string",
            icon: "string",
            status: "active | inactive",
            createdAt: "ISO 8601 date",
            updatedAt: "ISO 8601 date",
          },
        ],
        mmx_category_groups: [
          {
            id: "string",
            name: "string",
            description: "string",
            areaId: "string",
            color: "string",
            icon: "string",
            status: "active | inactive",
            createdAt: "ISO 8601 date",
            updatedAt: "ISO 8601 date",
          },
        ],
        mmx_categories: [
          {
            id: "string",
            name: "string",
            description: "string",
            type: "income | expense",
            categoryGroupId: "string",
            areaId: "string",
            status: "active | inactive",
            createdAt: "ISO 8601 date",
            updatedAt: "ISO 8601 date",
          },
        ],
        mmx_transactions: [
          {
            id: "string",
            description: "string",
            amount: "number",
            type: "income | expense",
            categoryId: "string",
            contactId: "string | null",
            date: "ISO 8601 date",
            status: "completed | pending | cancelled",
            notes: "string | null",
            createdAt: "ISO 8601 date",
            updatedAt: "ISO 8601 date",
          },
        ],
        mmx_contacts: [
          {
            id: "string",
            name: "string",
            email: "string | null",
            phone: "string | null",
            identifier: "string | null",
            type: "customer | supplier",
            status: "active | inactive",
            createdAt: "ISO 8601 date",
            updatedAt: "ISO 8601 date",
          },
        ],
      }

      const blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "mmx-model.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  })

  const associateGroupsButton = useActionButton({
    actionName: "Grupos associados à área",
    onAction: async () => {
      if (!selectedAreaId || selectedGroupIds.length === 0) {
        toast.error("Selecione uma área e pelo menos um grupo categoria")
        return
      }

      for (const groupId of selectedGroupIds) {
        await updateCategoryGroup(groupId, { areaId: selectedAreaId })
      }

      setSelectedGroupIds([])
    },
    successMessage: `Grupos associados à área com sucesso! Os dados foram atualizados.`,
  })

  const disassociateButton = useActionButton({
    actionName: "Grupo desassociado da área",
    onAction: async (groupId: string) => {
      await updateCategoryGroup(groupId, { areaId: undefined })
    },
  })

  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId)
    setSelectedGroupIds([])
  }

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroupIds((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const handleDisassociate = async (groupId: string) => {
    await disassociateButton.execute(groupId)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/json") {
      setSelectedFile(file)
    } else {
      toast.error("Por favor, selecione um arquivo JSON válido")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const validateSeedJSON = (data: unknown): data is SeedData => {
    if (!data || typeof data !== "object") {
      return false
    }

    const requiredKeys: SeedTableKey[] = [
      "mmx_areas",
      "mmx_category_groups",
      "mmx_categories",
      "mmx_transactions",
      "mmx_contacts",
    ]

    const parsedData = data as Partial<Record<SeedTableKey, unknown>>
    const isValidStructure = requiredKeys.every((key) => Array.isArray(parsedData[key]))

    if (!isValidStructure) return false

    return true
  }

  const selectedArea = areas?.find((a) => a.id === selectedAreaId)
  const availableGroups = categoryGroups?.filter((g) => g.status === "active") || []
  const groupsInArea = categoryGroups?.filter((g) => g.areaId === selectedAreaId) || []
  const groupsNotInArea = availableGroups.filter((g) => !g.areaId || g.areaId !== selectedAreaId)

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Settings className="h-8 w-8 text-blue-600" />
              Configurações
            </h1>
            <p className="text-slate-600 mt-1">Gerencie as configurações do sistema</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gerenciar Dados Mock
            </CardTitle>
            <p className="text-sm text-slate-600">Gerencie os dados de teste do sistema através de arquivos JSON</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Upload className="h-6 w-6" />
                    <span>Carregar Seed</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload de Seed JSON</DialogTitle>
                    <DialogDescription>
                      Carregue um arquivo JSON com dados de seed para popular o sistema com informações de teste.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seed-file">Selecionar arquivo JSON</Label>
                      <Input id="seed-file" type="file" accept=".json" ref={fileInputRef} onChange={handleFileSelect} />
                    </div>

                    {selectedFile && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Atenção:</p>
                          <p>Este processo irá sobrescrever todos os dados existentes.</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button
                        {...uploadSeedButton.buttonProps}
                        disabled={!selectedFile || uploadSeedButton.isProcessing}
                      >
                        {uploadSeedButton.getButtonText("Carregar Seed")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="h-6 w-6" />
                    <span>Limpar Dados Mock</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Confirmar Limpeza de Dados
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover permanentemente todos os dados mock do sistema (áreas, grupos categoria,
                      categorias, transações e contatos).
                      <br />
                      <br />
                      <strong>Esta ação não pode ser desfeita.</strong> Tem certeza que deseja continuar?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      {...clearDataButton.buttonProps}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                      {clearDataButton.getButtonText("Sim, Limpar Dados")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                {...downloadModelButton.buttonProps}
              >
                <Download className="h-6 w-6" />
                <span>{downloadModelButton.getButtonText("Baixar Modelo JSON")}</span>
              </Button>

              <Dialog open={backupModalOpen} onOpenChange={setBackupModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                    <Database className="h-6 w-6" />
                    <span>Exportar Dados (Backup)</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Exportar Dados (Backup)</DialogTitle>
                    <DialogDescription>
                      Selecione as tabelas que deseja incluir no backup. O arquivo será baixado em formato JSON.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Selecionar Tabelas:</Label>
                      <div className="space-y-2">
                        {availableTables.map((table) => (
                          <div key={table.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={table.id}
                              checked={selectedTables.includes(table.id)}
                              onCheckedChange={() => handleTableToggle(table.id)}
                            />
                            <Label htmlFor={table.id} className="text-sm font-normal cursor-pointer">
                              {table.label} ({table.id})
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedTables.length > 0 && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>{selectedTables.length}</strong> tabela(s) selecionada(s) para exportação
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBackupModalOpen(false)
                          setSelectedTables([])
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        {...exportBackupButton.buttonProps}
                        disabled={selectedTables.length === 0 || exportBackupButton.isProcessing}
                      >
                        {exportBackupButton.getButtonText("Exportar")}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Associação Grupo Categoria ↔ Área
            </CardTitle>
            <p className="text-sm text-slate-600">
              Vincule grupos categoria às suas respectivas áreas para organizar melhor a hierarquia orçamentária
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Selecionar Área
                </Label>
                <Select value={selectedAreaId} onValueChange={handleAreaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas?.map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                          <span>{area.icon}</span>
                          <span>{area.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedArea && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: selectedArea.color }}
                      >
                        {selectedArea.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{selectedArea.name}</h3>
                        <p className="text-sm text-slate-600">{selectedArea.description || "Sem descrição"}</p>
                        <Badge className="mt-1 bg-blue-100 text-blue-800 border-blue-200">
                          {groupsInArea.length} grupo(s) associado(s)
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {selectedAreaId && (
              <>
                {groupsInArea.length > 0 && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Grupos Categoria Associados
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupsInArea.map((group) => (
                        <Card key={group.id} className="bg-green-50 border-green-200">
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-6 h-6 rounded flex items-center justify-center text-white text-sm"
                                  style={{ backgroundColor: group.color }}
                                >
                                  {group.icon}
                                </div>
                                <span className="font-medium text-sm">{group.name}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDisassociate(group.id)}
                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Unlink className="h-3 w-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {groupsNotInArea.length > 0 && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Grupos Categoria Disponíveis
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {groupsNotInArea.map((group) => (
                        <Card
                          key={group.id}
                          className={`cursor-pointer transition-all ${
                            selectedGroupIds.includes(group.id)
                              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-200"
                              : "hover:bg-slate-50"
                          }`}
                          onClick={() => handleGroupToggle(group.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center text-white text-sm"
                                style={{ backgroundColor: group.color }}
                              >
                                {group.icon}
                              </div>
                              <span className="font-medium text-sm">{group.name}</span>
                              {group.areaId && (
                                <Badge variant="outline" className="text-xs">
                                  Já associado
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {selectedGroupIds.length > 0 && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm text-blue-800">
                          {selectedGroupIds.length} grupo(s) selecionado(s) para associar
                        </span>
                        <Button {...associateGroupsButton.buttonProps} size="sm">
                          <Save className="mr-2 h-4 w-4" />
                          {associateGroupsButton.getButtonText("Associar à Área")}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {groupsNotInArea.length === 0 && groupsInArea.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum grupo categoria disponível</p>
                    <p className="text-sm">Crie grupos categoria primeiro na página de Categorias</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
