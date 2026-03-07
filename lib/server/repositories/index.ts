import { prisma } from "@/lib/server/db/prisma"
import { UserRepository } from "./user-repository"
import { TransactionRepository } from "./transaction-repository"

export const userRepository = new UserRepository(prisma)
export const transactionRepository = new TransactionRepository(prisma)

export { UserRepository, TransactionRepository }
