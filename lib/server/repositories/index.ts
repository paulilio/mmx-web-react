import { prisma } from "@/lib/server/db/prisma"
import { UserRepository } from "./user-repository"
import { TransactionRepository } from "./transaction-repository"
import { CategoryRepository } from "./category-repository"
import { ContactRepository } from "./contact-repository"
import { BudgetRepository } from "./budget-repository"
import { BudgetAllocationRepository } from "./budget-allocation-repository"
import { AreaRepository } from "./area-repository"
import { CategoryGroupRepository } from "./category-group-repository"

export const userRepository = new UserRepository(prisma)
export const transactionRepository = new TransactionRepository(prisma)
export const categoryRepository = new CategoryRepository(prisma)
export const contactRepository = new ContactRepository(prisma)
export const budgetRepository = new BudgetRepository(prisma)
export const budgetAllocationRepository = new BudgetAllocationRepository(prisma)
export const areaRepository = new AreaRepository(prisma)
export const categoryGroupRepository = new CategoryGroupRepository(prisma)

export {
	UserRepository,
	TransactionRepository,
	CategoryRepository,
	ContactRepository,
	BudgetRepository,
	BudgetAllocationRepository,
	AreaRepository,
	CategoryGroupRepository,
}
