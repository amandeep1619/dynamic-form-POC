import { useDroppable } from '@dnd-kit/core';
import { FormSection, FormRow } from '@/types/form';
import BuilderRow from './BuildRow'; // Ensure this matches your filename

interface SectionProps {
  section: FormSection;
  onUpdateTitle: (title: string) => void;
  onUpdateRows: (rows: FormRow[]) => void;
  // This was the missing link!
  onUpdateOptions: (fieldId: string, options: string[]) => void; 
}

export default function BuilderSection({ 
  section, 
  onUpdateTitle
}: SectionProps) {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });

  return (
    <div 
      ref={setNodeRef}
      className={`p-10 rounded-[2.5rem] border-2 transition-all duration-300 ${
        isOver ? 'border-indigo-400 bg-indigo-50/30 ring-4 ring-indigo-50' : 'border-slate-100 bg-white shadow-xl shadow-slate-200/40'
      }`}
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-1 h-8 bg-indigo-600 rounded-full" />
        <input 
          value={section.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="text-lg font-black text-slate-900 uppercase tracking-widest bg-transparent outline-none focus:text-indigo-600 w-full"
          placeholder="SECTION TITLE..."
        />
      </div>
      
      <div className="space-y-4">
        {section.rows.map((row) => (
          <BuilderRow
            key={row.id} 
            row={row} 
          />
        ))}
      </div>
    </div>
  );
}