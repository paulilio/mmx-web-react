"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EntryStatusBadge } from "@/components/entries/entry-status-badge"
import { EntryFormModal } from "@/components/entries/entry-form-modal"
import { PaymentModal } from "@/components/entries/payment-modal"
import { PaymentHistoryModal } from "@/components/entries/payment-history-modal"
import { useEntries, useContacts, useCategories } from "@/hooks/use-entries"
import type { Entry } from "@/lib/types"
import { Plus, Edit, CreditCard, Loader2, History } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function EntriesPage() {
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    date_from: "",
    date_to: "",
    search: "",
    page: 1,
  })

  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false)

  const { data: entriesData, isLoading } = useEntries(filters)
  const { data: contacts } = useContacts()
  const { data: categories } = useCategories()

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handleEdit = (entry: Entry) => {
    setSelectedEntry(entry)
    setShowEntryModal(true)
  }

  const handlePayment = (entry: Entry) => {
    setSelectedEntry(entry)
    setShowPaymentModal(true)
  }

  const handlePaymentHistory = (entry: Entry) => {
    setSelectedEntry(entry)
    setShowPaymentHistoryModal(true)
  }

  const handleNewEntry = () => {
    setSelectedEntry(null)
    setShowEntryModal(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getContactName = (contactId: string) => {
    return contacts?.find((c) => c.id === contactId)?.name || "N/A"
  }

  const getCategoryName = (categoryId: string) => {
    return categories?.find((c) => c.id === categoryId)?.name || "N/A"
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lançamentos</h1>
            <p className="text-slate-600 mt-1">Gerencie suas contas a pagar e receber</p>
          </div>
          <Button onClick={handleNewEntry} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Lançamento
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Buscar..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <Select value={filters.type} onValueChange={(value) => handleFilterChange("type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="receivable">A Receber</SelectItem>
                    <SelectItem value="payable">A Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Em Aberto</SelectItem>
                    <SelectItem value="partial">Parcial</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange("date_from", e.target.value)}
                  placeholder="Data inicial"
                />
              </div>

              <div>
                <Input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange("date_to", e.target.value)}
                  placeholder="Data final"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entries Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entriesData?.entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Badge
                          className={
                            entry.type === "receivable"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }
                        >
                          {entry.type === "receivable" ? "Receber" : "Pagar"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{entry.description}</TableCell>
                      <TableCell>{getContactName(entry.contactId)}</TableCell>
                      <TableCell>{getCategoryName(entry.categoryId)}</TableCell>
                      <TableCell>{formatDate(entry.dueDate)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(entry.amount)}</TableCell>
                      <TableCell>
                        <EntryStatusBadge status={entry.status} dueDate={entry.dueDate} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {entry.status !== "paid" && entry.status !== "canceled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePayment(entry)}
                              className="h-8 w-8 p-0"
                              title="Registrar pagamento"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                          {(entry.status === "partial" || entry.status === "paid") && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaymentHistory(entry)}
                              className="h-8 w-8 p-0"
                              title="Ver histórico de pagamentos"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(entry)}
                            className="h-8 w-8 p-0"
                            title="Editar lançamento"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {entriesData && entriesData.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              disabled={filters.page <= 1}
              onClick={() => handleFilterChange("page", String(filters.page - 1))}
            >
              Anterior
            </Button>
            <span className="text-sm text-slate-600">
              Página {filters.page} de {entriesData.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={filters.page >= entriesData.totalPages}
              onClick={() => handleFilterChange("page", String(filters.page + 1))}
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Summary */}
        {entriesData && (
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Total: {entriesData.total} lançamentos</span>
            <span>A Receber: {entriesData.entries.filter((e) => e.type === "receivable").length}</span>
            <span>A Pagar: {entriesData.entries.filter((e) => e.type === "payable").length}</span>
          </div>
        )}
      </div>

      {/* Modals */}
      <EntryFormModal open={showEntryModal} onOpenChange={setShowEntryModal} entry={selectedEntry} />

      <PaymentModal open={showPaymentModal} onOpenChange={setShowPaymentModal} entry={selectedEntry} />

      <PaymentHistoryModal
        open={showPaymentHistoryModal}
        onOpenChange={setShowPaymentHistoryModal}
        entry={selectedEntry}
      />
    </MainLayout>
  )
}
