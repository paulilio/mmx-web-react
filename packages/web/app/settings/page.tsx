"use client"

import { DialogDescription } from "@/components/ui/dialog"

import type React from "react"

import { useState, useRef } from "react"
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
import { useAuth } from "@/hooks/use-auth"
import { useSettingsMaintenance, type SeedTableKey } from "@/hooks/use-settings-maintenance"
import { api } from "@/lib/client/api"
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
  Sparkles,
  Target,
} from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [backupModalOpen, setBackupModalOpen] = useState(false)
  const [selectedTables, setSelectedTables] = useState<SeedTableKey[]>([])

  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([])

  const { exportData, importData, clearData, getDefaultSeed } = useSettingsMaintenance()

  const { areas } = useAreas()
  const { categoryGroups, updateCategoryGroup } = useCategoryGroups()
  const { user, hydrateFromSession } = useAuth()

  const [receivablesTargetInput, setReceivablesTargetInput] = useState<string>(
    user?.preferences?.targets?.receivables != null
      ? String(user.preferences.targets.receivables)
      : "",
  )
  const [payablesTargetInput, setPayablesTargetInput] = useState<string>(
    user?.preferences?.targets?.payables != null ? String(user.preferences.targets.payables) : "",
  )

  const saveTargetsButton = useActionButton({
    actionName: "Metas salvas",
    onAction: async () => {
      const receivables = Number(receivablesTargetInput.replace(/\./g, "").replace(",", "."))
      const payables = Number(payablesTargetInput.replace(/\./g, "").replace(",", "."))
      if (!Number.isFinite(receivables) || receivables < 0) {
        toast.error("Meta de recebimentos inválida")
        return
      }
      if (!Number.isFinite(payables) || payables < 0) {
        toast.error("Meta de despesas inválida")
        return
      }
      await api.patch<{ preferences: unknown }>("/auth/preferences", {
        targets: { receivables, payables },
      })
      await hydrateFromSession()
    },
    successMessage: "Metas atualizadas. Volte ao dashboard para ver os donuts atualizados.",
    errorMessage: "Erro ao salvar metas. Tente novamente.",
  })

  const exportBackupButton = useActionButton({
    actionName: "Backup exportado",
    onAction: async () => {
      if (selectedTables.length === 0) {
        toast.error("Selecione pelo menos uma tabela para exportar")
        return
      }

      try {
        const backupData = await exportData(selectedTables)

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

      await importData(data)

      await new Promise((resolve) => setTimeout(resolve, 500))

      setUploadModalOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
  })

  const clearDataButton = useActionButton({
    actionName: "Dados limpos",
    onAction: async () => {
      await clearData()
    },
    successMessage: "Seus dados foram limpos. Recarregue a página manualmente para ver as mudanças.",
  })

  const downloadModelButton = useActionButton({
    actionName: "Modelo JSON baixado",
    onAction: () => {
      const model = {
        mmx_areas: [
          {
            id: "string",
            name: "string",
            type: "INCOME | FIXED_EXPENSES | DAILY_EXPENSES | PERSONAL | TAXES_FEES",
            description: "string",
            color: "string",
            icon: "string",
            status: "ACTIVE | INACTIVE",
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
            status: "ACTIVE | INACTIVE",
            createdAt: "ISO 8601 date",
            updatedAt: "ISO 8601 date",
          },
        ],
        mmx_categories: [
          {
            id: "string",
            name: "string",
            description: "string",
            type: "INCOME | EXPENSE",
            categoryGroupId: "string",
            areaId: "string",
            status: "ACTIVE | INACTIVE",
            createdAt: "ISO 8601 date",
            updatedAt: "ISO 8601 date",
          },
        ],
        mmx_transactions: [
          {
            id: "string",
            description: "string",
            amount: "number",
            type: "INCOME | EXPENSE",
            categoryId: "string",
            categoryGroupId: "string",
            areaId: "string",
            contactId: "string | null",
            date: "ISO 8601 date",
            status: "PENDING | COMPLETED | CANCELLED",
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
            type: "CUSTOMER | SUPPLIER",
            status: "ACTIVE | INACTIVE",
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

  const downloadExampleButton = useActionButton({
    actionName: "Exemplo JSON baixado",
    onAction: async () => {
      const seed = await getDefaultSeed()
      const blob = new Blob([JSON.stringify(seed, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "mmx-exemplo.json"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    successMessage: "Exemplo JSON baixado com sucesso! Use o botão Carregar Seed para importar.",
    errorMessage: "Erro ao baixar exemplo. Tente novamente.",
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

  const selectedArea = areas?.find((a) => a.id === selectedAreaId)
  const availableGroups = categoryGroups?.filter((g) => g.status === "active") || []
  const groupsInArea = categoryGroups?.filter((g) => g.areaId === selectedAreaId) || []
  const groupsNotInArea = availableGroups.filter((g) => !g.areaId || g.areaId !== selectedAreaId)

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="h-8 w-8 text-primary" />
              Configurações
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie as configurações do sistema</p>
          </div>
        </div>

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Gerenciar Meus Dados
            </CardTitle>
            <p className="text-sm text-muted-foreground">Carregue, limpe ou exporte seus dados através de arquivos JSON</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">{selectedFile.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-warning/10 rounded-lg border border-warning/30">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                        <div className="text-sm text-warning">
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
                    className="h-20 flex-col gap-2 text-expense hover:text-expense hover:bg-expense/10 bg-transparent"
                  >
                    <Trash2 className="h-6 w-6" />
                    <span>Limpar Meus Dados</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-expense" />
                      Confirmar Limpeza de Dados
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover permanentemente todos os seus dados (áreas, grupos categoria,
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
                      className="bg-expense hover:bg-expense/90 focus:ring-expense"
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

              <Button
                variant="outline"
                className="h-20 flex-col gap-2 bg-transparent"
                {...downloadExampleButton.buttonProps}
              >
                <Sparkles className="h-6 w-6" />
                <span>{downloadExampleButton.getButtonText("Baixar Exemplo")}</span>
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
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
                        <p className="text-sm text-primary">
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

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas mensais
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Defina suas metas de recebimentos e limite de despesas. Aparecem nos donuts do dashboard.
            </p>
          </CardHeader>
          <CardContent className="px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="target-receivables">Meta de recebimentos (R$)</Label>
                <Input
                  id="target-receivables"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={100}
                  placeholder="200000"
                  value={receivablesTargetInput}
                  onChange={(e) => setReceivablesTargetInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Quanto você pretende receber. Padrão: R$ 200.000.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-payables">Limite de despesas (R$)</Label>
                <Input
                  id="target-payables"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step={100}
                  placeholder="80000"
                  value={payablesTargetInput}
                  onChange={(e) => setPayablesTargetInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Limite que você não quer ultrapassar. Padrão: R$ 80.000.</p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button {...saveTargetsButton.buttonProps} disabled={saveTargetsButton.isProcessing}>
                <Save className="h-4 w-4 mr-2" />
                {saveTargetsButton.getButtonText("Salvar metas")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="gap-3 py-4">
          <CardHeader className="px-4">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Associação Grupo Categoria ↔ Área
            </CardTitle>
            <p className="text-sm text-muted-foreground">
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
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: selectedArea.color }}
                      >
                        {selectedArea.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{selectedArea.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedArea.description || "Sem descrição"}</p>
                        <Badge className="mt-1 bg-primary/15 text-primary border-primary/30">
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
                        <Card key={group.id} className="bg-income/10 border-income/30">
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
                                className="h-6 w-6 p-0 text-expense hover:text-expense hover:bg-expense/10"
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
                              ? "bg-primary/10 border-primary/40 ring-2 ring-primary/30"
                              : "hover:bg-accent"
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
                      <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/30">
                        <span className="text-sm text-primary">
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
                  <div className="text-center py-8 text-muted-foreground">
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
