'use client';
import { useState, useEffect } from 'react';
import { DndContext, pointerWithin } from '@dnd-kit/core';
import { Layout, Save, Eye, ChevronLeft, FolderPlus, Trash2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BuilderRow from '@/components/BuildRow';
import FormPreview from '@/components/FormPreview';
import { useFormStore } from '@/store/useFormStore';

export default function Home() {
  const form = useFormStore((state) => state.form);
  const updateFormName = useFormStore((state) => state.updateFormName);
  const activeSectionId = useFormStore((state) => state.activeSectionId);
  const { addSection, removeSection, updateSectionTitle, setActiveSectionId, handleDragStart, handleDragOver, handleDragEnd } = useFormStore();

  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => { if (form.sections.length === 0) addSection(); }, [form.sections.length, addSection]);

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {!isPreview && <Sidebar />}
      <main className="flex-1 flex flex-col overflow-hidden">
        <nav className="h-20 bg-white border-b flex justify-between items-center px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {isPreview && <button onClick={() => setIsPreview(false)} className="p-2 hover:bg-slate-100 rounded-full"><ChevronLeft /></button>}
            <h1 className="font-normal text-2xl text-slate-800"><strong>WEP</strong> <span className="text-[16px]">With Every Patient</span></h1>
          </div>
          <div className="flex gap-4">
            <button onClick={addSection} className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"><FolderPlus size={18} /> Add Section</button>
            <button onClick={() => setIsPreview(!isPreview)} className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-100 bg-white shadow-sm">
              {isPreview ? <Layout size={18} className="text-indigo-600" /> : <Eye size={18} className="text-indigo-600" />}
              {isPreview ? 'Back to Design' : 'Live Preview'}
            </button>
            <button onClick={() => console.log(form)} className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg flex items-center gap-2 active:scale-95 cursor-pointer"><Save size={18} /> Save Template</button>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          {isPreview ? (
            <FormPreview formName={form.name} sections={form.sections} formData={formData} updateValue={(id, val) => setFormData({ ...formData, [id]: val })} />
          ) : (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* GLOBAL FORM NAME - Static outside DndContext */}
              <div className="bg-white rounded-[2.5rem] p-10 border-2 border-slate-100 shadow-sm">
                <label className="text-[10px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-2 block">Document Title</label>
                <input value={form.name} onChange={(e) => updateFormName(e.target.value)} className="text-3xl font-bold text-slate-800 outline-none w-full bg-transparent" placeholder="Enter Form Name..." />
              </div>

              <DndContext onDragStart={handleDragStart} collisionDetection={pointerWithin} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                {form.sections.map((section) => (
                  <div key={section.id} onClick={() => setActiveSectionId(section.id)} className={`relative transition-all duration-300 rounded-[2.5rem] p-10 border-2 ${activeSectionId === section.id ? 'border-indigo-500 bg-white shadow-2xl shadow-indigo-100' : 'border-slate-200 bg-white/60 opacity-80'}`}>
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${activeSectionId === section.id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-300'}`} />
                        <input className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 bg-transparent outline-none w-full" value={section.title} onChange={(e) => updateSectionTitle(section.id, e.target.value)} />
                      </div>
                      <button disabled={form?.sections?.length == 1} onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="text-slate-300 hover:text-red-500 cursor-pointer"><Trash2 size={18} /></button>
                    </div>
                    <div className="space-y-4 min-h-10">{section.rows.map((row) => <BuilderRow key={row.id} row={row} />)}</div>
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