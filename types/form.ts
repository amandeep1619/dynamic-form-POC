export type FieldType = 'header' | 'instruction' | 'text' | 'date' | 'select' | 'radio';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  options?: string[];
}

export interface FormRow {
  id: string;
  fields: FormField[];
}