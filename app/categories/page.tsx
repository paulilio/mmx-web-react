"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CategoryFormModal } from "@/components/categories/category-form-modal"
import { useCategories, deleteCategory } from "@/hooks/use-categories"
import type { Category } from "@/lib/types"
import { Plus, Edit, Trash2, Loader2, FolderOpen } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mutate } from "swr"

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showModal, setShowModal] = useState(false)

  const { data: categories, isLoading } = useCategories()

  const filteredCategories = categories?.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setShowModal(true)
  }

  const handleDelete = async (category: Category) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      try {
        await deleteCategory(category.id)
        mutate("/categories")
      } catch (error) {
        console.error("Erro ao excluir categoria:", error)
      }
    }
  }

  const handleNewCategory = () => {
    setSelectedCategory(null)
    setShowModal(true)
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Categorias</h1>
            <p className="text-slate-600 mt-1">Organize seus lançamentos por categoria</p>
          </div>
          <Button onClick={handleNewCategory} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buscar Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredCategories && filteredCategories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            category.type === "income"
                              ? "bg-blue-100 text-blue-800 border-blue-200"
                              : "bg-slate-100 text-slate-800 border-slate-200"
                          }
                        >
                          {category.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </TableCell>
                      <TableCell>{category.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(category)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(category)}
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
                <FolderOpen className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Nenhuma categoria encontrada</p>
                <p className="text-sm">Comece criando sua primeira categoria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        {filteredCategories && (
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span>Total: {filteredCategories.length} categorias</span>
            <span>Receitas: {filteredCategories.filter((c) => c.type === "income").length}</span>
            <span>Despesas: {filteredCategories.filter((c) => c.type === "expense").length}</span>
          </div>
        )}
      </div>

      {/* Modal */}
      <CategoryFormModal open={showModal} onOpenChange={setShowModal} category={selectedCategory} />
    </MainLayout>
  )
}
