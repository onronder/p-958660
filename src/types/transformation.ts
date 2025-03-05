
import { SourceStatus } from "./source";

export type TransformationStatus = "Active" | "Inactive" | "Processing" | "Failed";

export interface Transformation {
  id: string;
  name: string;
  source_id: string;
  source_name: string;
  status: TransformationStatus;
  last_modified: string;
  expression?: string;
  skip_transformation?: boolean;
  user_id: string;
  created_at?: string;
  updated_at?: string;
  // Add the missing fields
  fields?: TransformationField[];
  derived_columns?: DerivedColumn[];
}

export interface TransformationField {
  id: string;
  name: string;
  category: string;
  selected: boolean;
  alias?: string;
}

export type FieldCategory = "Orders" | "Customers" | "Products" | "Inventory" | "Other";

export type FunctionCategory = "Arithmetic" | "Logical" | "Text" | "Date";

export interface TransformationFunction {
  name: string;
  category: FunctionCategory;
  description: string;
  syntax: string;
  example: string;
}

export interface DerivedColumn {
  name: string;
  expression: string;
  description?: string;
}
