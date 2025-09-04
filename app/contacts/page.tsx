"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContactFormModal } from "@/components/contacts/contact-form-modal"
import { useContacts, deleteContact } from "@/hooks/use-contacts"
import type { Contact } from "@/lib/types"
import { Plus, Edit, Trash2, Loader2, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mutate } from "swr"

export default function ContactsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data: contacts, isLoading } = useContacts()

  const filteredContacts = contacts?.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact)
    setShowModal(true)
  }

  const handleDelete = async (contact: Contact) => {
    if (confirm(`Tem certeza que deseja excluir o contato "${contact.name}"?`)) {
      try {
        await deleteContact(contact.id)
        mutate("/contacts")
      } catch (error) {
        console.error("Erro ao excluir contato:", error)
      }
    }
  }

  const handleNewContact = () => {
    setSelectedContact(null)
    setShowModal(true)
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Contatos</h1>
            <p className="text-slate-600 mt-1">Gerencie seus clientes e fornecedores</p>
          </div>
          <Button onClick={handleNewContact} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Novo Contato
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buscar Contatos</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Contacts Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredContacts && filteredContacts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            contact.type === "customer"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }
                        >
                          {contact.type === "customer" ? "Cliente" : "Fornecedor"}
                        </Badge>
                      </TableCell>
                      <TableCell>{contact.email || "-"}</TableCell>
                      <TableCell>{contact.phone || "-"}</TableCell>
                      <TableCell>{contact.document || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(contact)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(contact)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Users className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Nenhum contato encontrado</p>
                <p className="text-sm">Comece criando seu primeiro contato</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {filteredContacts && (
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Total: {filteredContacts.length} contatos</span>
            <span>Clientes: {filteredContacts.filter((c) => c.type === "customer").length}</span>
            <span>Fornecedores: {filteredContacts.filter((c) => c.type === "supplier").length}</span>
          </div>
        )}
      </div>

      {/* Modal */}
      <ContactFormModal open={showModal} onOpenChange={setShowModal} contact={selectedContact} />
    </MainLayout>
  )
}
