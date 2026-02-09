import { create } from 'zustand';
import { FormSection, FormField, FieldType } from '@/types/form';
import { DragOverEvent, DragEndEvent, DragStartEvent } from '@dnd-kit/core';

interface FormState {
  form: {
    id: string;
    name: string;
    sections: FormSection[];
  };
  activeSectionId: string | null;
  MAX_FIELDS_PER_ROW: number;
  activeId: string | null;

  updateFormName: (name: string) => void;
  setActiveSectionId: (id: string | null) => void;
  addSection: () => void;
  removeSection: (id: string) => void;
  updateSectionTitle: (id: string, title: string) => void;
  addField: (type: FieldType) => void;
  removeField: (fieldId: string) => void;
  updateFieldLabel: (fieldId: string, label: string) => void;
  updateFieldOptions: (fieldId: string, options: string[]) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  handleDragStart: (event: DragStartEvent) => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  form: {
    id: `form_${Date.now()}`,
    name: 'Add your form Name here',
    sections: [],
  },
  activeSectionId: null,
  MAX_FIELDS_PER_ROW: 2,
  activeId: null,

  updateFormName: (name) => set((state) => ({
    form: { ...state.form, name }
  })),

  setActiveSectionId: (id) => set({ activeSectionId: id }),

  handleDragStart: (event) => set({ activeId: event.active.id as string }),

  addSection: () => {
    const { form } = get();
    const newId = `section_${Date.now()}`;
    const newSection: FormSection = {
      id: newId,
      title: `SECTION ${form.sections.length + 1}`,
      rows: []
    };
    set({ form: { ...form, sections: [...form.sections, newSection] }, activeSectionId: newId });
  },

  removeSection: (id) => {
    const { form, activeSectionId } = get();
    if (form.sections.length <= 1) return alert("At least one section required.");
    const updated = form.sections.filter(s => s.id !== id);
    set({ form: { ...form, sections: updated }, activeSectionId: activeSectionId === id ? (updated[0]?.id || null) : activeSectionId });
  },

  updateSectionTitle: (id, title) => set((state) => ({
    form: { ...state.form, sections: state.form.sections.map(s => s.id === id ? { ...s, title } : s) }
  })),

  addField: (type) => {
    const { form, activeSectionId } = get();
    const newField: FormField = {
      id: `field_${crypto.randomUUID().split('-')[0]}`,
      type,
      label: `New ${type.replace('_', ' ')}`,
      options: ['YES', 'NO']
    };
    const targetId = activeSectionId || (form.sections.length > 0 ? form.sections[form.sections.length - 1].id : null);
    if (!targetId) return;
    set({
      form: {
        ...form,
        sections: form.sections.map(sec => sec.id === targetId ? {
          ...sec,
          rows: [...sec.rows, { id: `row_${Date.now()}`, fields: [newField] }]
        } : sec)
      }
    });
  },

  updateFieldLabel: (fieldId, label) => set((state) => ({
    form: { ...state.form, sections: state.form.sections.map(s => ({
      ...s, rows: s.rows.map(r => ({ ...r, fields: r.fields.map(f => f.id === fieldId ? { ...f, label } : f) }))
    }))}
  })),

  updateFieldOptions: (fieldId, options) => set((state) => ({
    form: { ...state.form, sections: state.form.sections.map(s => ({
      ...s, rows: s.rows.map(r => ({ ...r, fields: r.fields.map(f => f.id === fieldId ? { ...f, options } : f) }))
    }))}
  })),

  removeField: (fieldId) => set((state) => ({
    form: { ...state.form, sections: state.form.sections.map(s => ({
      ...s, rows: s.rows.map(r => ({ ...r, fields: r.fields.filter(f => f.id !== fieldId) })).filter(r => r.fields.length > 0)
    }))}
  })),

  handleDragOver: (event) => {
    const { active, over } = event;
    const { form, MAX_FIELDS_PER_ROW } = get();
    if (!over || active.id === over.id) return;

    let activeRowId, overRowId, activeField;
    for (const section of form.sections) {
      for (const row of section.rows) {
        if (row.fields.some(f => f.id === active.id)) {
          activeRowId = row.id; activeField = row.fields.find(f => f.id === active.id);
        }
        if (row.id === over.id || row.fields.some(f => f.id === over.id)) overRowId = row.id;
      }
    }
    if (!activeRowId || !overRowId || !activeField || activeRowId === overRowId) return;
    const targetRow = form.sections.flatMap(s => s.rows).find(r => r.id === overRowId);
    if (targetRow && targetRow.fields.length >= MAX_FIELDS_PER_ROW) return;

    set((state) => ({
      form: { ...state.form, sections: state.form.sections.map(section => ({
        ...section, rows: section.rows.map(row => {
          if (row.id === activeRowId) return { ...row, fields: row.fields.filter(f => f.id !== active.id) };
          if (row.id === overRowId) return { ...row, fields: [...row.fields, activeField!] };
          return row;
        }).filter(r => r.fields.length > 0)
      }))}
    }));
  },

  handleDragEnd: (event) => {
    const { active, over } = event;
    const { form } = get();
    if (!over) return set({ activeId: null });
    set({
      form: { ...form, sections: form.sections.map(section => {
        const isOverSection = section.id === over.id;
        const activeRow = section.rows.find(r => r.fields.some(f => f.id === active.id));
        if (isOverSection && activeRow && activeRow.fields.length > 1) {
          const activeField = activeRow.fields.find(f => f.id === active.id)!;
          const updatedRows = section.rows.map(r => r.id === activeRow.id ? { ...r, fields: r.fields.filter(f => f.id !== active.id) } : r);
          return { ...section, rows: [...updatedRows, { id: `row_${crypto.randomUUID()}`, fields: [activeField] }] };
        }
        return section;
      })},
      activeId: null
    });
  },
}));