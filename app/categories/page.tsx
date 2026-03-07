"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryFormModal } from "@/components/categories/category-form-modal"
import { CategoryGroupFormModal } from "@/components/categories/category-group-form-modal"
import { useCategories } from "@/hooks/use-categories"
import { useCategoryGroups } from "@/hooks/use-category-groups"
import type { Category, CategoryGroup } from "@/lib/shared/types"
import { Plus, Edit, Trash2, Loader2, FolderOpen, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { mutate } from "swr"
import { DynamicIcon } from "@/components/ui/dynamic-icon"

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<CategoryGroup | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showCategoryGroupModal, setShowCategoryGroupModal] = useState(false)
  const [activeTab, setActiveTab] = useState("categories")

  const {
    categories,
    isLoading: categoriesLoading,
    deleteCategory,
  } = useCategories(() => {
    console.log("[v0] Revalidating category groups from callback")
    mutateCategoryGroups()
  })
  const {
    categoryGroups,
    isLoading: categoryGroupsLoading,
    deleteCategoryGroup,
    mutate: mutateCategoryGroups,
  } = useCategoryGroups()

  const filteredCategories = categories?.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCategoryGroups = categoryGroups?.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setShowCategoryModal(true)
  }

  const handleDeleteCategory = async (category: Category) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      try {
        await deleteCategory(category.id)
        mutate("/categories")
      } catch (error) {
        console.error("Erro ao excluir categoria:", error)
      }
    }
  }

  const handleEditCategoryGroup = (group: CategoryGroup) => {
    setSelectedCategoryGroup(group)
    setShowCategoryGroupModal(true)
  }

  const handleDeleteCategoryGroup = async (group: CategoryGroup) => {
    if (confirm(`Tem certeza que deseja excluir o grupo "${group.name}"?`)) {
      try {
        await deleteCategoryGroup(group.id)
      } catch (error) {
        console.error("Erro ao excluir grupo categoria:", error)
      }
    }
  }

  const handleNewCategory = () => {
    setSelectedCategory(null)
    setShowCategoryModal(true)
  }

  const handleNewCategoryGroup = () => {
    setSelectedCategoryGroup(null)
    setShowCategoryGroupModal(true)
  }

  const getCategoryGroupName = (categoryGroupId?: string) => {
    if (!categoryGroupId) return "-"
    const group = categoryGroups?.find((g) => g.id === categoryGroupId)
    return group?.name || "-"
  }

  const getCategoriesCount = (groupId: string) => {
    return categories?.filter((cat) => cat.categoryGroupId === groupId).length || 0
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Categorias & Grupos</h1>
            <p className="text-slate-600 mt-1">Organize suas transações por categoria e grupos categoria</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="category-groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grupos Categoria
            </TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Categorias</h2>
                <p className="text-slate-600 text-sm">Gerencie suas categorias de receitas e despesas</p>
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
                {categoriesLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : filteredCategories && filteredCategories.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Grupo Categoria</TableHead>
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
                          <TableCell>{getCategoryGroupName(category.categoryGroupId)}</TableCell>
                          <TableCell>{category.description || "-"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditCategory(category)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCategory(category)}
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

            {/* Categories Summary */}
            {filteredCategories && (
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>Total: {filteredCategories.length} categorias</span>
                <span>Receitas: {filteredCategories.filter((c) => c.type === "income").length}</span>
                <span>Despesas: {filteredCategories.filter((c) => c.type === "expense").length}</span>
              </div>
            )}
          </TabsContent>

          <TabsContent value="category-groups" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Grupos Categoria</h2>
                <p className="text-slate-600 text-sm">
                  Organize suas categorias em grupos para melhor controle orçamentário
                </p>
              </div>
              <Button onClick={handleNewCategoryGroup} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Grupo
              </Button>
            </div>

            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Buscar Grupos</CardTitle>
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

            {/* Category Groups Cards */}
            {categoryGroupsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredCategoryGroups && filteredCategoryGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategoryGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: group.color }}
                          >
                            <DynamicIcon iconName={group.icon} size={20} className="text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                            <Badge
                              className={
                                group.status === "active"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : "bg-gray-100 text-gray-800 border-gray-200"
                              }
                            >
                              {group.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCategoryGroup(group)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteCategoryGroup(group)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm mb-3">{group.description || "Sem descrição"}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Categorias:</span>
                        <span className="font-medium">{getCategoriesCount(group.id)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Users className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Nenhum grupo encontrado</p>
                <p className="text-sm">Comece criando seu primeiro grupo categoria</p>
              </div>
            )}

            {/* Category Groups Summary */}
            {filteredCategoryGroups && (
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <span>Total: {filteredCategoryGroups.length} grupos</span>
                <span>Ativos: {filteredCategoryGroups.filter((g) => g.status === "active").length}</span>
                <span>Inativos: {filteredCategoryGroups.filter((g) => g.status === "inactive").length}</span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CategoryFormModal open={showCategoryModal} onOpenChange={setShowCategoryModal} category={selectedCategory} />
      <CategoryGroupFormModal
        open={showCategoryGroupModal}
        onOpenChange={setShowCategoryGroupModal}
        categoryGroup={selectedCategoryGroup}
      />
    </MainLayout>
  )
}
