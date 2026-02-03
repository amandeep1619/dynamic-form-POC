'use client';
import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Eye, Layout, Save, ChevronLeft, Download } from 'lucide-react';

// Your Components
import Sidebar from '@/components/Sidebar';
import SortableField from '@/components/SortableField';
import FormPreview from '@/components/FormPreview';
import { FieldType, FormElement } from '@/types/form';

export default function Home() {
  const [elements, setElements] = useState<FormElement[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isPreview, setIsPreview] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor));

  // --- BUILDER LOGIC ---
  const addElement = (type: FieldType) => {
    const newElement: FormElement = {
      id: `field_${crypto.randomUUID().split('-')[0]}`, // Clean IDs for DB keys
      type,
      label: `New ${type.replace('_', ' ')} Label`,
      options: ['Option 1', 'Option 2'], // Default options for choice-based fields
    };
    setElements([...elements, newElement]);
  };

  const updateLabel = (id: string, newLabel: string) => {
    setElements(elements.map(el => el.id === id ? { ...el, label: newLabel } : el));
  };

  const updateOptions = (id: string, options: string[]) => {
    setElements(elements.map(el => el.id === id ? { ...el, options } : el));
  };

  const updateValue = (id: string, value: any) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // --- THE "SAVE" LOGIC ---
  const handleSave = () => {
    // 1. Prepare the JSON Payload
    const formTemplate = {
      templateName: "Clinical Drug Request Form v1", // You could make this editable
      createdAt: new Date().toISOString(),
      version: "1.0",
      // This 'schema' is what the "Renderer" uses to build the UI
      schema: elements, 
      // Optional: Save default values entered during design
      defaultValues: formData 
    };

    // 2. Log for POC purposes
    console.log("--- SAVING TO DATABASE ---");
    console.log(JSON.stringify(formTemplate, null, 2));
    
    // 3. Visual feedback
    alert("Form Schema generated! Check Console (F12) to see the JSON payload ready for DB.");
    
    // Here is where you would do:
    // await fetch('/api/save-form', { method: 'POST', body: JSON.stringify(formTemplate) });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setElements((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-slate-900">
      {!isPreview && <Sidebar onAdd={addElement} />}
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <nav className="h-20 bg-white border-b border-slate-200 px-8 flex justify-between items-center shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            {isPreview && (
              <button onClick={() => setIsPreview(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <ChevronLeft size={24} />
              </button>
            )}
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">W</div>
              WepConnect<span className="text-indigo-600 italic font-medium">Design</span>
            </h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-100 hover:border-indigo-500 transition-all bg-white"
            >
              {isPreview ? <Layout size={18} className="text-indigo-500"/> : <Eye size={18} className="text-indigo-500"/>}
              {isPreview ? 'Designer' : 'Live Preview'}
            </button>
            <button 
              onClick={handleSave}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
            >
              <Save size={18}/>
              Save Template
            </button>
          </div>
        </nav>

        {/* Canvas Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          {isPreview ? (
            <FormPreview elements={elements} formData={formData} updateValue={updateValue} />
          ) : (
            <div className="max-w-3xl mx-auto bg-white min-h-[85vh] rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-20 relative">
               <div className="absolute top-0 left-0 right-0 h-4 bg-indigo-600 rounded-t-[3rem]"></div>
              
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={elements} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {elements.map((el) => (
                      <SortableField 
                        key={el.id} 
                        element={el} 
                        onUpdateLabel={updateLabel}
                        onUpdateOptions={updateOptions}
                        onRemove={() => setElements(elements.filter(e => e.id !== el.id))} 
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {elements.length === 0 && (
                <div className="h-[50vh] flex flex-col items-center justify-center text-slate-300">
                  <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mb-6">
                    <Download size={40} className="text-slate-200" />
                  </div>
                  <p className="text-lg font-bold text-slate-500">Form is empty</p>
                  <p className="text-sm text-slate-400 mt-1">Select elements from the sidebar to begin</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}