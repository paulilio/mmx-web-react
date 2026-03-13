import { areaRepository, categoryGroupRepository, categoryRepository, contactRepository, transactionRepository, userRepository } from "@/lib/server/repositories"
import { TransactionService } from "./transaction-service"
import { CategoryService } from "./category-service"
import { ContactService } from "./contact-service"
import { BudgetService } from "./budget-service"
import { AreaService } from "./area-service"
import { AuthService } from "./auth-service"
import { CategoryGroupService } from "./category-group-service"
import { ReportService } from "./report-service"

export const transactionService = new TransactionService(transactionRepository)
export const categoryService = new CategoryService(categoryRepository)
export const contactService = new ContactService(contactRepository)
export const budgetService = new BudgetService()
export const areaService = new AreaService(areaRepository)
export const authService = new AuthService(userRepository)
export const categoryGroupService = new CategoryGroupService(categoryGroupRepository)
export const reportService = new ReportService(transactionRepository)

export { TransactionService, CategoryService, ContactService, BudgetService, AreaService, AuthService, CategoryGroupService, ReportService }
