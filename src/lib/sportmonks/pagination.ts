export interface PaginationMeta {
  count: number;
  per_page: number;
  current_page: number;
  next_page: string | null;
  has_more: boolean;
}

export function hasNextPage(pagination?: PaginationMeta): boolean {
  return pagination?.has_more ?? false;
}
