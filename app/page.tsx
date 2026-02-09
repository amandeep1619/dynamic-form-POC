'use client';
import { useState, useEffect } from 'react';
import { DndContext, closestCorners, pointerWithin } from '@dnd-kit/core';
import { Layout, Save, Eye, ChevronLeft, FolderPlus, Trash2 } from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import BuilderRow from '@/components/BuildRow';
import FormPreview from '@/components/FormPreview';
import { useFormStore } from '@/store/useFormStore';

export default function Home () {
  // Zustand Store Selectors
  const handleDragStart = useFormStore((state) => state.handleDragStart);
  const sections = useFormStore((state) => state.sections);
  const activeSectionId = useFormStore((state) => state.activeSectionId);
  const addSection = useFormStore((state) => state.addSection);
  const removeSection = useFormStore((state) => state.removeSection);
  const updateSectionTitle = useFormStore((state) => state.updateSectionTitle);
  const setActiveSectionId = useFormStore((state) => state.setActiveSectionId);
  const addField = useFormStore((state) => state.addField);
  const handleDragOver = useFormStore((state) => state.handleDragOver);
  const handleDragEnd = useFormStore((state) => state.handleDragEnd);

  // Local UI State
  const [isPreview, setIsPreview] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Initialize first section if empty
  useEffect(() => {
    if (sections.length === 0) {
      addSection();
    }
  }, [sections.length, addSection]);

  const saveTemplate = () => {
    console.log("EXPORTED PAYLOAD:", JSON.stringify(sections, null, 2));
    alert("Template logged to console!");
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {!isPreview && <Sidebar onAdd={addField} />}

      <main className="flex-1 flex flex-col overflow-hidden">
        <nav className="h-20 bg-white border-b flex justify-between items-center px-8 shadow-sm z-10">
          <div className="flex items-center gap-3">
            {isPreview && (
              <button onClick={() => setIsPreview(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <ChevronLeft />
              </button>
            )}
            <h1 className="font-normal text-2xl text-slate-800">
              <strong>WEP</strong> <span className="text-[16px]">With Every Patient</span>
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={addSection}
              className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all"
            >
              <FolderPlus size={18} /> Add Section
            </button>
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-slate-100 bg-white shadow-sm"
            >
              {isPreview ? <Layout size={18} className="text-indigo-600" /> : <Eye size={18} className="text-indigo-600" />}
              {isPreview ? 'Back to Design' : 'Live Preview'}
            </button>
            <button
              onClick={saveTemplate}
              className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Save size={18} /> Save Template
            </button>
          </div>
        </nav>

        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50">
          {isPreview ? (
            <FormPreview
              sections={sections}
              formData={formData}
              updateValue={(id, val) => setFormData({ ...formData, [id]: val })}
            />
          ) : (
            <div className="max-w-5xl mx-auto space-y-4">
              <DndContext
                onDragStart={handleDragStart}
                collisionDetection={pointerWithin}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                measuring={{
                  droppable: {
                    strategy: 0, // MeasuringStrategy.Always
                  },
                }}
              >
                {sections.map((section) => (
                  <div
                    key={section.id}
                    onClick={() => setActiveSectionId(section.id)}
                    className={`relative transition-all duration-300 rounded-[2.5rem] p-10 border-2 ${activeSectionId === section.id
                        ? 'border-indigo-500 bg-white shadow-2xl shadow-indigo-100'
                        : 'border-slate-200 bg-white/60 opacity-80'
                      }`}
                  >
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full ${activeSectionId === section.id ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'bg-slate-300'}`} />
                        <input
                          className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 bg-transparent outline-none w-full focus:text-indigo-600"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-4 min-h-10">
                      {section.rows.map((row) => (
                        <BuilderRow
                          key={row.id}
                          row={row}
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