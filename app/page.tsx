'use client';
import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCorners, DragOverEvent, DragEndEvent } from '@dnd-kit/core';
import { Layout, Save, Eye, ChevronLeft, FolderPlus, Trash2 } from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import BuilderRow from '@/components/BuildRow';
import FormPreview from '@/components/FormPreview';
import { FormRow, FieldType, FormField, FormSection } from '@/types/form';

const MAX_FIELDS_PER_ROW = 2;

export default function Home() {
  const [sections, setSections] = useState<FormSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize section logic
  useEffect(() => {
    if (sections.length === 0) {
      const defaultId = `section_${Date.now()}`;
      setSections([{
        id: defaultId,
        title: "SECTION 1: SITE DETAILS",
        rows: []
      }]);
      setActiveSectionId(defaultId);
    }
  }, []);

  // --- ADD / REMOVE SECTION LOGIC ---
  const addSection = () => {
    const newId = `section_${Date.now()}`;
    const newSection: FormSection = {
      id: newId,
      title: `SECTION ${sections.length + 1}`,
      rows: []
    };
    setSections(prev => [...prev, newSection]);
    setActiveSectionId(newId);
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) {
      alert("You must have at least one section.");
      return;
    }
    setSections(prev => {
      const updated = prev.filter(s => s.id !== id);
      if (activeSectionId === id) setActiveSectionId(updated[0]?.id || null);
      return updated;
    });
  };

  // --- STABLE CALLBACKS FOR FIELDS ---
  const updateFieldOptions = useCallback((fieldId: string, options: string[]) => {
    setSections(prev => prev.map(s => ({
      ...s,
      rows: s.rows.map(r => ({
        ...r,
        fields: r.fields.map(f => f.id === fieldId ? { ...f, options } : f)
      }))
    })));
  }, []);

  const updateFieldLabel = useCallback((fieldId: string, label: string) => {
    setSections(prev => prev.map(s => ({
      ...s,
      rows: s.rows.map(r => ({
        ...r,
        fields: r.fields.map(f => f.id === fieldId ? { ...f, label } : f)
      }))
    })));
  }, []);

  const removeField = useCallback((fieldId: string) => {
    setSections(prev => prev.map(s => ({
      ...s,
      rows: s.rows.map(r => ({
        ...r,
        fields: r.fields.filter(f => f.id !== fieldId)
      })).filter(r => r.fields.length > 0)
    })));
  }, []);

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${crypto.randomUUID().split('-')[0]}`,
      type,
      label: `New ${type.replace('_', ' ')}`,
      options: ['YES', 'NO']
    };
    setSections(prev => {
      const targetId = activeSectionId || (prev.length > 0 ? prev[prev.length - 1].id : null);
      if (!targetId) return prev;
      return prev.map(sec => (sec.id === targetId ? {
        ...sec,
        rows: [...sec.rows, { id: `row_${Date.now()}`, fields: [newField] }]
      } : sec));
    });
  };

  // --- DRAG HANDLERS ---
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSections(prev => {
      let activeRow: FormRow | undefined;
      let overRow: FormRow | undefined;

      for (const sec of prev) {
        const aR = sec.rows.find(r => r.fields.some(f => f.id === active.id));
        const oR = sec.rows.find(r => r.id === over.id || r.fields.some(f => f.id === over.id));
        if (aR) activeRow = aR;
        if (oR) overRow = oR;
      }

      if (!activeRow || !overRow || activeRow.id === overRow.id) return prev;
      if (overRow.fields.length >= MAX_FIELDS_PER_ROW) return prev;

      const activeField = activeRow.fields.find(f => f.id === active.id)!;

      return prev.map(section => ({
        ...section,
        rows: section.rows.map(r => {
          if (r.id === activeRow?.id) return { ...r, fields: r.fields.filter(f => f.id !== active.id) };
          if (r.id === overRow?.id) return { ...r, fields: [...r.fields, activeField] };
          return r;
        }).filter(r => r.fields.length > 0)
      }));
    });
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    setSections(prev => prev.map(section => {
      const isOverSection = section.id === over.id;
      const activeRow = section.rows.find(r => r.fields.some(f => f.id === active.id));

      if (isOverSection && activeRow && activeRow.fields.length > 1) {
        const activeField = activeRow.fields.find(f => f.id === active.id)!;
        const filteredRows = section.rows.map(r =>
          r.id === activeRow.id ? { ...r, fields: r.fields.filter(f => f.id !== active.id) } : r
        );
        return {
          ...section,
          rows: [...filteredRows, { id: `row_${Date.now()}`, fields: [activeField] }]
        };
      }
      return section;
    }));
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {!isPreview && <Sidebar onAdd={addField} />}
      <main className="flex-1 flex flex-col overflow-hidden">
        <nav className="h-20 bg-white border-b flex justify-between items-center px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {isPreview && <button onClick={() => setIsPreview(false)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft /></button>}
            <h1 className="font-normal text-2xl text-slate-800"><strong>WEP</strong> <span className="text-[16px]">With Every Patient</span></h1>
          </div>
          <div className="flex gap-4">
            {/* RESTORED ADD SECTION BUTTON */}
            <button onClick={addSection} className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
              <FolderPlus size={18} /> Add Section
            </button>
            <button onClick={() => setIsPreview(!isPreview)} className="px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-100 bg-white shadow-sm">
              {isPreview ? 'Back to Design' : 'Live Preview'}
            </button>
            <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg flex items-center gap-2">
              <Save size={18} /> Save Template
            </button>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          {isPreview ? (
            <FormPreview sections={sections} formData={formData} updateValue={(id, val) => setFormData({ ...formData, [id]: val })} />
          ) : (
            <div className="max-w-5xl mx-auto space-y-4">
              <DndContext collisionDetection={closestCorners} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                {sections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`relative transition-all duration-300 rounded-[2.5rem] p-10 border-2 cursor-pointer ${
                      activeSectionId === section.id ? 'border-indigo-500 bg-white shadow-2xl shadow-indigo-100' : 'border-slate-200 bg-white/60 opacity-80'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${activeSectionId === section.id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-300'}`} />
                        <input
                          className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 bg-transparent outline-none w-full focus:text-indigo-600"
                          value={section.title}
                          onChange={(e) => setSections(prev => prev.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))}
                        />
                      </div>
                      {/* RESTORED REMOVE SECTION BUTTON */}
                      <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-4 min-h-10">
                      {section.rows.map((row) => (
                        <BuilderRow
                          key={row.id}
                          row={row}
                          onUpdateOptions={updateFieldOptions}
                          onUpdate={updateFieldLabel}
                          onRemove={removeField}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </DndContext>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}