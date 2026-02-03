export type FieldType = 'header' | 'instruction' | 'text' | 'date' | 'select' | 'radio' | 'checkbox_group';

export interface FormElement {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[]; // For select, radio, and checkboxes
  required?: boolean;
}