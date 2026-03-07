import { transactionRepository } from "@/lib/server/repositories"
import { TransactionService } from "./transaction-service"

export const transactionService = new TransactionService(transactionRepository)

export { TransactionService }
