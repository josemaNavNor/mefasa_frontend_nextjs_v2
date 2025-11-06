export interface Filter {
  id: number;
  filter_name: string;
  description?: string;
  is_public: boolean;
  is_system_default: boolean;
  createdAt: string;
  updatedAt: string;
  filterCriteria?: FilterCriterion[];
  userFavFilters?: UserFavFilter[];
}

export interface FilterCriterion {
  id: number;
  filter_id: number;
  field_name: string;
  operator: string;
  value: string;
  logical_operator: string;
  created_at: string;
  filter?: Filter;
}

export interface UserFavFilter {
  id: number;
  user_id: number;
  filter_id: number;
  created_at: string;
  user?: any; // User interface from your user types
  filter?: Filter;
}

export interface CreateFilterDto {
  filter_name: string;
  description?: string;
  is_public: boolean;
  is_system_default: boolean;
  filterCriteria?: CreateFilterCriterionDto[];
}

export interface UpdateFilterDto {
  filter_name?: string;
  description?: string;
  is_public?: boolean;
  is_system_default?: boolean;
  filterCriteria?: CreateFilterCriterionDto[];
}

export interface CreateFilterCriterionDto {
  field_name: string;
  operator: string;
  value: string;
  logical_operator: string;
}

export interface CreateUserFavFilterDto {
  user_id: number;
  filter_id: number;
}

export interface UpdateUserFavFilterDto {
  user_id?: number;
  filter_id?: number;
}

// Enums para los operadores y campos disponibles
export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_EQUAL = 'greater_equal',
  LESS_EQUAL = 'less_equal',
  IN = 'in',
  NOT_IN = 'not_in',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null'
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

// Campos disponibles para filtrar (basado en la entidad Ticket)
export enum TicketFilterField {
  TITLE = 'title',
  DESCRIPTION = 'description',
  STATUS = 'status',
  PRIORITY = 'priority',
  TYPE_ID = 'type_id',
  FLOOR_ID = 'floor_id',
  ASSIGNED_TO = 'assigned_to',
  CREATED_BY = 'created_by',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at'
}

export interface FilterFormData {
  filter_name: string;
  description: string;
  is_public: boolean;
  criteria: FilterCriterionFormData[];
}

export interface FilterCriterionFormData {
  field_name: string;
  operator: string;
  value: string;
  logical_operator: string;
}