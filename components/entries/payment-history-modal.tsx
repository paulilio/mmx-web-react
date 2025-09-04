"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useEntryPayments } from "@/hooks/use-entries"
import type { Entry } from "@/lib/types"
import { Loader2, CreditCard } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PaymentHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: Entry | null
}

export function PaymentHistoryModal({ open, onOpenChange, entry }: PaymentHistoryModalProps) {
  const { data: payments, isLoading } = useEntryPayments(entry?.id || "")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const getMethodLabel = (method: string) => {
    const methods = {
      pix: "PIX",
      boleto: "Boleto",
      cartao: "Cartão",
      transf: "Transferência",
    }
    return methods[method as keyof typeof methods] || method
  }

  const totalPaid = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  const remainingAmount = (entry?.amount || 0) - totalPaid

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Histórico de Pagamentos</DialogTitle>
        </DialogHeader>

        {entry && (
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{entry.description}</p>
                <p className="text-sm text-slate-600">Valor total: {formatCurrency(entry.amount)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Pago: {formatCurrency(totalPaid)}</p>
                <p className="text-sm font-medium">Restante: {formatCurrency(remainingAmount)}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : payments && payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.paidAt)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      {getMethodLabel(payment.method)}
                    </Badge>
                  </TableCell>
                  <TableCell>{payment.note || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500">
            <CreditCard className="h-8 w-8 mb-2" />
            <p>Nenhum pagamento registrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
