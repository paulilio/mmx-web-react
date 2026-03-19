export const prismaConfig = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  logQueries: process.env.NODE_ENV === "development",
}
