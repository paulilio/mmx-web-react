import { categoryRepository, contactRepository, transactionRepository } from "@/lib/server/repositories"
import { TransactionService } from "./transaction-service"
import { CategoryService } from "./category-service"
import { ContactService } from "./contact-service"
import { BudgetService } from "./budget-service"

export const transactionService = new TransactionService(transactionRepository)
export const categoryService = new CategoryService(categoryRepository)
export const contactService = new ContactService(contactRepository)
export const budgetService = new BudgetService()

export { TransactionService, CategoryService, ContactService, BudgetService }
