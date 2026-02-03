import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { FormRow } from '@/types/form';

export default function FormRowComponent({ row, onUpdateField, onRemoveRow }: { 
  row: FormRow, 
  onUpdateField: (id: string, label: string) => void,
  onRemoveRow: () => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative mb-4">
      {/* Drag Handle & Delete */}
      <div className="absolute -left-12 top-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div {...attributes} {...listeners} className="p-2 cursor-grab bg-white border rounded shadow-sm text-slate-400">
          <GripVertical size={14} />
        </div>
        <button onClick={onRemoveRow} className="p-2 bg-white border rounded shadow-sm text-red-400 hover:text-red-600">
          <Trash2 size={14} />
        </button>
      </div>

      <div className={`grid gap-4 p-4 border-2 border-dashed border-transparent hover:border-indigo-100 rounded-xl transition-all grid-cols-${row.fields.length}`}>
        {row.fields.map((field) => (
          <div key={field.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">{field.type}</span>
            <input 
              value={field.label}
              onChange={(e) => onUpdateField(field.id, e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-700 outline-none focus:text-indigo-600 mt-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}