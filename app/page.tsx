'use client';
import { useState, useEffect } from 'react';
import { DndContext, closestCorners, DragOverEvent } from '@dnd-kit/core';
import { Layout, Save, Eye, ChevronLeft, FolderPlus, Trash2 } from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import BuilderRow from '@/components/BuildRow';
import FormPreview from '@/components/FormPreview';
import { FormRow, FieldType, FormField, FormSection } from '@/types/form';

const MAX_FIELDS_PER_ROW = 2;

export default function Home () {
  const [sections, setSections] = useState<FormSection[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // 1. AUTO-SECTION LOGIC: Ensure at least one section exists on load
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

  const addSection = () => {
    const newId = `section_${Date.now()}`;
    const newSection: FormSection = {
      id: newId,
      title: `SECTION ${sections.length + 1}`,
      rows: []
    };
    setSections([...sections, newSection]);
    setActiveSectionId(newId);
  };

  const removeSection = (id: string) => {
    if (sections.length <= 1) {
      alert("You must have at least one section.");
      return;
    }
    const updated = sections.filter(s => s.id !== id);
    setSections(updated);
    if (activeSectionId === id) setActiveSectionId(updated[0].id);
  };

  // 2. IMPROVED ADD FIELD: Always targets a section, creates one if missing
const addField = (type: FieldType) => {
  const newField: FormField = {
    id: `field_${crypto.randomUUID().split('-')[0]}`,
    type,
    label: `New ${type.replace('_', ' ')}`,
    options: ['YES', 'NO']
  };

  setSections(prev => {
    const targetId = activeSectionId || (prev.length > 0 ? prev[prev.length - 1].id : null);
    
    // If no section exists, create one with the field
    if (!targetId) {
      const newSecId = `section_${Date.now()}`;
      return [{
        id: newSecId,
        title: "SECTION 1",
        rows: [{ id: `row_${Date.now()}`, fields: [newField] }]
      }];
    }

    return prev.map(sec => {
      if (sec.id === targetId) {
        // ALWAYS create a new row as per your original functionality
        return {
          ...sec,
          rows: [...sec.rows, { id: `row_${Date.now()}`, fields: [newField] }]
        };
      }
      return sec;
    });
  });
};
const handleDragOver = (event: DragOverEvent) => {
  const { active, over } = event;
  if (!over) return;

  const activeId = active.id;
  const overId = over.id;

  setSections(prev => prev.map(section => {
    // Find where the field is coming from and where it's going
    const activeRow = section.rows.find(r => r.fields.find(f => f.id === activeId));
    // The "over" could be the row itself (droppable) or another field inside that row
    const overRow = section.rows.find(r => r.id === overId || r.fields.find(f => f.id === overId));

    if (!activeRow || !overRow || activeRow === overRow) return section;

    // Only allow move if target row has space
    if (overRow.fields.length < MAX_FIELDS_PER_ROW) {
      const activeField = activeRow.fields.find(f => f.id === activeId)!;
      
      const updatedRows = section.rows.map(r => {
        // 1. Remove from old row
        if (r.id === activeRow.id) {
          return { ...r, fields: r.fields.filter(f => f.id !== activeId) };
        }
        // 2. Add to new row
        if (r.id === overRow.id) {
          return { ...r, fields: [...r.fields, activeField] };
        }
        return r;
      }).filter(r => r.fields.length > 0); // Cleanup empty rows automatically

      return { ...section, rows: updatedRows };
    }
    
    return section;
  }));
};


  const saveTemplate = () => {
    // Check if we actually have data to save
    if (sections.length === 0) {
      alert("No sections to save!");
      return;
    }

    const templatePayload = {
      metadata: {
        templateName: "EBS-101 EAP Participant Eligibility Form",
        version: "0.3", // Incrementing version for the Section update
        author: "WepConnect Designer",
        exportedAt: new Date().toISOString(),
      },
      // Map through the sections to create the structured layout
      formStructure: sections.map((section, sIdx) => ({
        sectionId: section.id,
        sectionTitle: section.title,
        order: sIdx,
        rows: section.rows.map((row, rIdx) => ({
          rowId: row.id,
          order: rIdx,
          fields: row.fields.map((field, fIdx) => ({
            id: field.id,
            type: field.type,
            label: field.label,
            options: field.options || [],
            columnOrder: fIdx
          }))
        }))
      }))
    };

    // 1. Log to console for debugging
    console.log("EXPORTED PAYLOAD:", JSON.stringify(templatePayload, null, 2));

    // 2. Download as JSON file
    try {
      const jsonString = JSON.stringify(templatePayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `form_template_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Template saved and downloaded successfully!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to export template.");
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {!isPreview && <Sidebar onAdd={addField} />}

      <main className="flex-1 flex flex-col overflow-hidden">
        <nav className="h-20 bg-white border-b flex justify-between items-center px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {isPreview && <button onClick={() => setIsPreview(false)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft /></button>}
            <h1 className="font-black text-xl tracking-tight text-slate-800 uppercase italic">Wep Connect</h1>
          </div>
          <div className="flex gap-4">
            <button onClick={addSection} className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all">
              <FolderPlus size={18} /> Add Section
            </button>
            <button onClick={() => setIsPreview(!isPreview)} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-100 hover:border-indigo-500 transition-all bg-white shadow-sm">
              {isPreview ? <Layout size={18} className="text-indigo-600" /> : <Eye size={18} className="text-indigo-600" />}
              {isPreview ? 'Back to Design' : 'Live Preview'}
            </button>
            {/* <button className="cursor-pointer bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-95">
              <Save size={18}/> Save Template
            </button> */}
            <button
              onClick={saveTemplate} // Add the onClick here
              className="cursor-pointer bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Save size={18} /> Save Template
            </button>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          {isPreview ? (
            <FormPreview sections={sections} formData={formData} updateValue={(id, val) => setFormData({ ...formData, [id]: val })} />
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {sections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`relative transition-all duration-300 rounded-[2.5rem] p-10 border-2 cursor-pointer ${activeSectionId === section.id
                    ? 'border-indigo-500 bg-white shadow-2xl shadow-indigo-100'
                    : 'border-slate-200 bg-white/60 opacity-80 hover:opacity-100'
                    }`}
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${activeSectionId === section.id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-300'}`} />
                      <input
                        className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 bg-transparent outline-none w-full focus:text-indigo-600"
                        value={section.title}
                        onChange={(e) => {
                          setSections(sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s));
                        }}
                      />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-4 min-h-[40px]">
                    <DndContext collisionDetection={closestCorners} onDragOver={handleDragOver}>
                      {section.rows.map((row) => (
                        <BuilderRow
                          key={row.id}
                          row={row}
                          onUpdateOptions={(fId, opts) => {
                            setSections(sections.map(s => ({ ...s, rows: s.rows.map(r => ({ ...r, fields: r.fields.map(f => f.id === fId ? { ...f, options: opts } : f) })) })));
                          }}
                          onUpdate={(fId, label) => {
                            setSections(sections.map(s => ({ ...s, rows: s.rows.map(r => ({ ...r, fields: r.fields.map(f => f.id === fId ? { ...f, label } : f) })) })));
                          }}
                          onRemove={(fId) => {
                            setSections(sections.map(s => ({ ...s, rows: s.rows.map(r => ({ ...r, fields: r.fields.filter(f => f.id !== fId) })).filter(r => r.fields.length > 0) })));
                          }}
                        />
                      ))}
                    </DndContext>
                  </div>

                  {activeSectionId === section.id && (
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-indigo-600 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}