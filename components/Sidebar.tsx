import { Type, Calendar, CheckSquare, Heading2, Info, List, Radio } from 'lucide-react';
import { FieldType } from '@/types/form';

export default function Sidebar({ onAdd }: { onAdd: (type: FieldType) => void }) {
  const tools = [
    { type: 'header', label: 'Section Header', icon: <Heading2 size={18} /> },
    { type: 'instruction', label: 'Instruction Text', icon: <Info size={18} /> },
    { type: 'text', label: 'Text Input', icon: <Type size={18} /> },
    { type: 'date', label: 'Date Field', icon: <Calendar size={18} /> },
    { type: 'select', label: 'Select Box', icon: <List size={18} /> },
    { type: 'radio', label: 'Radio (Single)', icon: <Radio size={18} /> },
    { type: 'checkbox_group', label: 'Checkboxes (Multi)', icon: <CheckSquare size={18} /> },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 p-6 flex flex-col gap-2 shadow-2xl z-10">
      <div className="mb-8">
        <h2 className="text-white text-lg font-bold uppercase tracking-tight">Form Engine</h2>
        <p className="text-xs text-slate-500">Click to add to canvas</p>
      </div>
      {tools.map((tool) => (
        <button
          key={tool.type}
          onClick={() => onAdd(tool.type as FieldType)}
          className="cursor-pointer flex items-center gap-3 p-3 rounded-xl border border-slate-800 hover:border-blue-500 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium"
        >
          <span className="text-blue-400 bg-blue-400/10 p-2 rounded-lg">{tool.icon}</span>
          {tool.label}
        </button>
      ))}
    </aside>
  );
}