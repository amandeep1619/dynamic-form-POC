export type FieldType = 'header' | 'instruction' | 'text' | 'date' | 'select' | 'textarea' | 'number' | 'email' | 'radio';

export interface FormField {
  id: string;
  type: string;
  label: string;
  options?: string[];
}

export interface FormRow {
  id: string;
  fields: FormField[];
}

export interface FormSection {
  id: string;
  title: string;
  rows: FormRow[];
}
