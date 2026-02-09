import { create } from 'zustand';
import { FormSection, FormField, FormRow, FieldType } from '@/types/form';
import { DragOverEvent, DragEndEvent } from '@dnd-kit/core';

interface FormState {
  sections: FormSection[];
  activeSectionId: string | null;
  MAX_FIELDS_PER_ROW: number;
  activeId: string | null;
  // Actions
  setSections: (sections: FormSection[]) => void;
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
  handleDragStart: (event: any) => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  sections: [],
  activeSectionId: null,
  MAX_FIELDS_PER_ROW: 2,
  activeId: null as string | null,

  setSections: (sections) => set({ sections }),
  setActiveSectionId: (id) => set({ activeSectionId: id }),

  handleDragStart: (event) => {
    set({ activeId: event.active.id });
  },

  addSection: () => {
    const { sections } = get();
    const newId = `section_${Date.now()}`;
    const newSection: FormSection = {
      id: newId,
      title: `SECTION ${sections.length + 1}`,
      rows: []
    };
    set({ sections: [...sections, newSection], activeSectionId: newId });
  },

  removeSection: (id) => {
    const { sections, activeSectionId } = get();
    if (sections.length <= 1) return alert("At least one section required.");
    const updated = sections.filter(s => s.id !== id);
    set({
      sections: updated,
      activeSectionId: activeSectionId === id ? (updated[0]?.id || null) : activeSectionId
    });
  },

  updateSectionTitle: (id, title) => set((state) => ({
    sections: state.sections.map(s => s.id === id ? { ...s, title } : s)
  })),

  addField: (type) => {
    const { sections, activeSectionId } = get();
    const newField: FormField = {
      id: `field_${crypto.randomUUID().split('-')[0]}`,
      type,
      label: `New ${type.replace('_', ' ')}`,
      options: ['YES', 'NO']
    };

    const targetId = activeSectionId || (sections.length > 0 ? sections[sections.length - 1].id : null);
    if (!targetId) return;

    set({
      sections: sections.map(sec => (sec.id === targetId ? {
        ...sec,
        rows: [...sec.rows, { id: `row_${Date.now()}`, fields: [newField] }]
      } : sec))
    });
  },

  updateFieldLabel: (fieldId, label) => set((state) => ({
    sections: state.sections.map(s => ({
      ...s,
      rows: s.rows.map(r => ({
        ...r,
        fields: r.fields.map(f => f.id === fieldId ? { ...f, label } : f)
      }))
    }))
  })),

  updateFieldOptions: (fieldId, options) => set((state) => ({
    sections: state.sections.map(s => ({
      ...s,
      rows: s.rows.map(r => ({
        ...r,
        fields: r.fields.map(f => f.id === fieldId ? { ...f, options } : f)
      }))
    }))
  })),

  removeField: (fieldId) => set((state) => ({
    sections: state.sections.map(s => ({
      ...s,
      rows: s.rows.map(r => ({
        ...r,
        fields: r.fields.filter(f => f.id !== fieldId)
      })).filter(r => r.fields.length > 0)
    }))
  })),

  // handleDragOver: (event) => {
  //   const { active, over } = event;
  //   const { sections, MAX_FIELDS_PER_ROW } = get();
  //   if (!over || active.id === over.id) return;

  //   let activeRow: FormRow | undefined;
  //   let overRow: FormRow | undefined;

  //   for (const sec of sections) {
  //     const aR = sec.rows.find(r => r.fields.some(f => f.id === active.id));
  //     const oR = sec.rows.find(r => r.id === over.id || r.fields.some(f => f.id === over.id));
  //     if (aR) activeRow = aR;
  //     if (oR) overRow = oR;
  //   }

  //   if (!activeRow || !overRow || activeRow.id === overRow.id) return;
  //   if (overRow.fields.length >= MAX_FIELDS_PER_ROW) return;

  //   const activeField = activeRow.fields.find(f => f.id === active.id)!;

  //   set({
  //     sections: sections.map(section => ({
  //       ...section,
  //       rows: section.rows.map(r => {
  //         if (r.id === activeRow?.id) return { ...r, fields: r.fields.filter(f => f.id !== active.id) };
  //         if (r.id === overRow?.id) return { ...r, fields: [...r.fields, activeField] };
  //         return r;
  //       }).filter(r => r.fields.length > 0)
  //     }))
  //   });
  // },

  handleDragOver: (event: DragOverEvent) => {
    const { active, over } = event;
    const { sections, MAX_FIELDS_PER_ROW } = get();

    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the source and target info
    let activeRowId: string | undefined;
    let overRowId: string | undefined;
    let activeField: FormField | undefined;

    for (const section of sections) {
      for (const row of section.rows) {
        if (row.fields.some(f => f.id === activeId)) {
          activeRowId = row.id;
          activeField = row.fields.find(f => f.id === activeId);
        }
        // If 'over' is the row itself OR a field inside that row
        if (row.id === overId || row.fields.some(f => f.id === overId)) {
          overRowId = row.id;
        }
      }
    }

    // --- CRITICAL GUARDS ---
    // 1. If we can't find the rows, exit.
    if (!activeRowId || !overRowId || !activeField) return;

    // 2. If the field is already in this row, STOP. (This kills the loop)
    if (activeRowId === overRowId) return;

    // 3. If target row is full, exit.
    const targetRow = sections.flatMap(s => s.rows).find(r => r.id === overRowId);
    if (targetRow && targetRow.fields.length >= MAX_FIELDS_PER_ROW) return;

    // --- SAFE TO UPDATE ---
    set((state) => ({
      sections: state.sections.map((section) => ({
        ...section,
        rows: section.rows
          .map((row) => {
            if (row.id === activeRowId) {
              return { ...row, fields: row.fields.filter((f) => f.id !== activeId) };
            }
            if (row.id === overRowId) {
              return { ...row, fields: [...row.fields, activeField!] };
            }
            return row;
          })
          .filter((row) => row.fields.length > 0), // Cleanup empty rows
      })),
    }));
  },
  handleDragEnd: (event) => {
    const { active, over } = event;
    const { sections } = get();

    // If dropped over nothing or same place, just clear active state
    if (!over) return;

    set({
      sections: sections.map(section => {
        const isOverSection = section.id === over.id;
        const activeRow = section.rows.find(r => r.fields.some(f => f.id === active.id));

        // 1. SPLIT LOGIC: Dragging a field out of a 2-column row onto section background
        if (isOverSection && activeRow && activeRow.fields.length > 1) {
          const activeField = activeRow.fields.find(f => f.id === active.id)!;

          const updatedRows = section.rows.map(r =>
            r.id === activeRow.id
              ? { ...r, fields: r.fields.filter(f => f.id !== active.id) }
              : r
          );

          return {
            ...section,
            rows: [
              ...updatedRows,
              { id: `row_${crypto.randomUUID()}`, fields: [activeField] } // Use UUID for unique IDs
            ]
          };
        }
        return section;
      }),

    });
    set({ activeId: null });
  },
}));