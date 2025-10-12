export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    sort: { sorted: boolean; empty: boolean; unsorted: boolean };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: { sorted: boolean; empty: boolean; unsorted: boolean };
  numberOfElements: number;
  empty: boolean;
}