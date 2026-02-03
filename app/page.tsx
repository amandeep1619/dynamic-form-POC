'use client';
import { useState } from 'react';
import { DndContext, closestCorners, DragOverEvent } from '@dnd-kit/core';
import { Layout, Save, Eye, ChevronLeft, PlusCircle } from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import BuilderRow from '@/components/BuildRow'; // Ensure the filename is correct (BuilderRow vs BuildRow)
import FormPreview from '@/components/FormPreview';
import { FormRow, FieldType, FormField } from '@/types/form';

const MAX_FIELDS_PER_ROW = 2;

export default function Home() {
  // Start with an empty array so the "Create your form" message shows up
  const [rows, setRows] = useState<FormRow[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${crypto.randomUUID().split('-')[0]}`,
      type,
      label: `New ${type.replace('_', ' ')}`,
      options: ['YES', 'NO']
    };
    // Add a new row containing the field
    setRows([...rows, { id: `row_${Date.now()}`, fields: [newField] }]);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    setRows((prev) => {
      const activeRow = prev.find((r) => r.fields.find((f) => f.id === activeId));
      const overRow = prev.find((r) => r.id === overId || r.fields.find((f) => f.id === overId));

      if (!activeRow || !overRow || activeRow === overRow) return prev;

      if (overRow.fields.length < MAX_FIELDS_PER_ROW) {
        const activeField = activeRow.fields.find((f) => f.id === activeId)!;
        return prev.map((r) => {
          if (r.id === activeRow.id) return { ...r, fields: r.fields.filter((f) => f.id !== activeId) };
          if (r.id === overRow.id) return { ...r, fields: [...r.fields, activeField] };
          return r;
        }).filter(r => r.fields.length > 0); // Remove rows that become empty
      }
      return prev;
    });
  };

  const updateOptions = (fId: string, options: string[]) => {
  setRows(rows.map(r => ({
    ...r,
    fields: r.fields.map(f => f.id === fId ? { ...f, options } : f)
  })));
};
const saveTemplate = () => {
  // We structure the payload to include metadata and the layout grid
  const templatePayload = {
    metadata: {
      templateName: "EBS-101 EAP Participant Eligibility Form",
      version: "0.2",
      author: "WepConnect Designer",
      lastModified: new Date().toISOString(),
    },
    // The 'layout' property preserves the row-column structure
    layout: rows.map((row, rowIndex) => ({
      rowId: row.id,
      order: rowIndex,
      columns: row.fields.map((field, colIndex) => ({
        columnOrder: colIndex,
        fieldId: field.id,
        type: field.type,
        label: field.label,
        options: field.options || [], // Captures the custom radio/select options
      })),
    })),
  };

  // 1. Log to console for your review
  console.log("DATABASE PAYLOAD:", JSON.stringify(templatePayload, null, 2));

  // 2. Logic for POC: Download as JSON file (optional)
  // const blob = new Blob([JSON.stringify(templatePayload, null, 2)], { type: 'application/json' });
  // const url = URL.createObjectURL(blob);
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = `template_${Date.now()}.json`;
  // link.click();

  alert("Template Schema generated and saved to console!");
};

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {!isPreview && <Sidebar onAdd={addField} />}
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <nav className="h-20 bg-white border-b flex justify-between items-center px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {isPreview && (
              <button onClick={() => setIsPreview(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft />
              </button>
            )}
            <h1 className="font-black text-xl tracking-tight text-slate-800 uppercase">Wep Connect</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-100 hover:border-indigo-500 transition-all bg-white"
            >
              {isPreview ? <Layout size={18} className="text-indigo-600"/> : <Eye size={18} className="text-indigo-600"/>}
              {isPreview ? 'Back to Design' : 'Live Preview'}
            </button>
            <button 
              onClick={saveTemplate}
              className="cursor-pointer bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Save size={18}/> Save Template
            </button>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          {isPreview ? (
            <FormPreview 
              rows={rows} 
              formData={formData} 
              updateValue={(id, val) => setFormData({...formData, [id]: val})} 
            />
          ) : (
            <div className="max-w-4xl mx-auto min-h-full">
              {rows.length > 0 ? (
                <div className="space-y-4">
                  <DndContext collisionDetection={closestCorners} onDragOver={handleDragOver}>
                    {rows.map((row) => (
                      <BuilderRow 
                        key={row.id} 
                        row={row} 
                        onUpdateOptions={updateOptions}
                        onUpdate={(fId, label) => setRows(rows.map(r => ({...r, fields: r.fields.map(f => f.id === fId ? {...f, label} : f)})))}
                        onRemove={(fId) => setRows(rows.map(r => ({...r, fields: r.fields.filter(f => f.id !== fId)})) .filter(r => r.fields.length > 0))}
                      />
                    ))}
                  </DndContext>
                  
                  {/* Visual Drop Zone Hint */}
                  <div className="py-8 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 font-medium text-sm">
                    Drop more fields here or drag items to create columns
                  </div>
                </div>
              ) : (
                /* EMPTY STATE / GETTING STARTED MESSAGE */
                <div className="flex flex-col items-center justify-center py-32 bg-white border-2 border-dashed border-slate-200 rounded-[3rem] shadow-sm">
                  <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                    <PlusCircle className="text-indigo-600 w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create your form</h2>
                  <p className="text-slate-500 font-medium mt-2">Select fields from the left sidebar to start building</p>
                  
                  <div className="mt-10 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100">Drag to reorder</span>
                    <span className="px-3 py-1 bg-slate-50 rounded-full border border-slate-100">Max 2 columns per row</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}