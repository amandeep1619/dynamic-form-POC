// components/SortableField.tsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  X, 
  Settings2 
} from 'lucide-react';
import { FormElement } from '@/types/form';

interface SortableFieldProps {
  element: FormElement;
  onRemove: () => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdateOptions: (id: string, options: string[]) => void;
}

export default function SortableField({ 
  element, 
  onRemove, 
  onUpdateLabel, 
  onUpdateOptions 
}: SortableFieldProps) {
  
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  // Logic to determine if this field needs an options editor
  const supportsOptions = ['select', 'radio', 'checkbox_group'].includes(element.type);

  // --- Option Management Handlers ---
  const addOption = () => {
    const currentOptions = element.options || [];
    onUpdateOptions(element.id, [...currentOptions, `New Option ${currentOptions.length + 1}`]);
  };

  const removeOption = (index: number) => {
    const newOptions = (element.options || []).filter((_, i) => i !== index);
    onUpdateOptions(element.id, newOptions);
  };

  const editOption = (index: number, newValue: string) => {
    const newOptions = [...(element.options || [])];
    newOptions[index] = newValue;
    onUpdateOptions(element.id, newOptions);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex flex-col bg-white border-2 rounded-2xl transition-all duration-200 ${
        isDragging 
          ? 'shadow-2xl border-blue-500 opacity-90 scale-[1.02] z-50' 
          : 'border-slate-100 hover:border-blue-200 hover:shadow-md'
      }`}
    >
      {/* Main Field Row */}
      <div className="flex items-center gap-4 p-5">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab p-2 text-slate-300 hover:text-blue-500 transition-colors"
        >
          <GripVertical size={20} />
        </div>

        {/* Label Editor */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {element.type.replace('_', ' ')}
            </span>
          </div>
          <input
            type="text"
            value={element.label}
            onChange={(e) => onUpdateLabel(element.id, e.target.value)}
            className="w-full text-lg font-bold text-slate-800 bg-transparent outline-none focus:text-blue-600 placeholder:text-slate-300"
            placeholder="Field Label (e.g., Participant Weight)"
          />
        </div>

        {/* Delete Button */}
        <button
          onClick={onRemove}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          title="Remove Field"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Options Editor (Only shows for Select/Radio/Checkbox Group) */}
      {supportsOptions && (
        <div className="px-5 pb-5 ml-12">
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings2 size={14} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                Configuration Choices
              </span>
            </div>
            
            <div className="space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => editOption(index, e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              <button
                onClick={addOption}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-all"
              >
                <Plus size={14} />
                Add Choice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}