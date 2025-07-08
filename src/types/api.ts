export type ListResponse<T> = {
  current: number;
  pageSize: number;
  total: number;
  records: T[];
};
