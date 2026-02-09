'use client';
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Trash2, 
  Settings2, 
  Plus, 
  X 
} from 'lucide-react';

import { FormField } from '@/types/form';
import { useFormStore } from '@/store/useFormStore'; // Import the store

interface SortableFieldProps {
  field: FormField;
  // Look! No function props here.
}

export default function SortableField({ field }: SortableFieldProps) {
  const [showSettings, setShowSettings] = useState(false);

  // Grab only the specific actions this field needs
  const updateFieldLabel = useFormStore((state) => state.updateFieldLabel);
  const updateFieldOptions = useFormStore((state) => state.updateFieldOptions);
  const removeField = useFormStore((state) => state.removeField);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id, disabled: false });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0
  };

  const supportsOptions = ['select', 'radio', 'checkbox_group'].includes(field.type);

  // --- Logic remains the same, but calls the store directly ---
  const addOption = () => {
    const currentOptions = field.options || [];
    updateFieldOptions(field.id, [...currentOptions, `Option ${currentOptions.length + 1}`]);
  };

  const editOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    updateFieldOptions(field.id, newOptions);
  };

  const removeOption = (index: number) => {
    updateFieldOptions(field.id, (field.options || []).filter((_, i) => i !== index));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col bg-white border rounded-xl shadow-sm transition-all ${
        isDragging ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Drag handle */}
        <div {...attributes} {...listeners} className="cursor-grab text-slate-300 hover:text-indigo-500">
          <GripVertical size={18} />
        </div>

        <div className="flex-1">
          <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-1">
            {field.type}
          </p>
          <input
            value={field.label}
            onChange={(e) => updateFieldLabel(field.id, e.target.value)}
            className="w-full font-bold text-slate-700 outline-none bg-transparent focus:text-indigo-600"
            placeholder="Enter Field Label..."
          />
        </div>

        <div className="flex gap-1">
          {supportsOptions && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300 hover:bg-slate-50'}`}
            >
              <Settings2 size={16} />
            </button>
          )}
          <button 
            onClick={() => removeField(field.id)} 
            className="p-2 text-slate-300 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && supportsOptions && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest">Manage Choices</p>
            <div className="space-y-2">
              {field.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input 
                    value={opt}
                    onChange={(e) => editOption(idx, e.target.value)}
                    className="flex-1 text-xs p-2 rounded border border-slate-200 focus:border-indigo-400 outline-none"
                  />
                  <button onClick={() => removeOption(idx)} className="text-slate-300 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button 
                onClick={addOption}
                className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline pt-1"
              >
                <Plus size={12} /> Add Option
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}