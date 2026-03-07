import { areaRepository, categoryRepository, contactRepository, transactionRepository } from "@/lib/server/repositories"
import { TransactionService } from "./transaction-service"
import { CategoryService } from "./category-service"
import { ContactService } from "./contact-service"
import { BudgetService } from "./budget-service"
import { AreaService } from "./area-service"

export const transactionService = new TransactionService(transactionRepository)
export const categoryService = new CategoryService(categoryRepository)
export const contactService = new ContactService(contactRepository)
export const budgetService = new BudgetService()
export const areaService = new AreaService(areaRepository)

export { TransactionService, CategoryService, ContactService, BudgetService, AreaService }
