export interface RangedFilter {
  key: string;
  from: any;
  to: any;
}

export interface SearchFilterItem {
  field: string;
  value: string;
}

export type SearchFilters = Record<string, any> | SearchFilterItem[];

export interface FilteringQuery {
  page?: number;
  rows?: number;
  orderKey?: string;
  orderRule?: string;
  filters?: Record<string, any | any[]>;
  searchFilters?: SearchFilters;
  rangedFilters?: RangedFilter[];
  q?: string; // cross-table search
}
