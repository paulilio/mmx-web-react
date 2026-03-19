export type SeedTableKey =
  | "mmx_areas"
  | "mmx_category_groups"
  | "mmx_categories"
  | "mmx_transactions"
  | "mmx_contacts"

export type SeedData = Record<SeedTableKey, unknown[]>

export type ImportResult = {
  imported: Record<SeedTableKey, number>
}

export type ClearResult = {
  cleared: Record<SeedTableKey, number>
}
