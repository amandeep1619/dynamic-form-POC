import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableField from './SortableField';
import { FormRow } from '@/types/form';

export default function BuilderRow({ 
  row, 
  onUpdate, 
  onRemove, 
  onUpdateOptions 
}: { 
  row: FormRow, 
  onUpdate: (id: string, label: string) => void, 
  onRemove: (id: string) => void, 
  onUpdateOptions: (id: string, options: string[]) => void 
}) {
  const { setNodeRef, isOver } = useDroppable({ id: row.id });
 

  // Map column counts to static classes so Tailwind generates the CSS
  const gridMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[27.5] p-4 rounded-2xl border-2 transition-all ${
        isOver 
          ? 'border-indigo-400 bg-indigo-50 shadow-inner' 
          : row.fields.length === 0 
            ? 'border-dashed border-slate-200 bg-slate-50/50' 
            : 'border-transparent bg-white shadow-sm'
      }`}
    >
      <div className={`grid gap-4 h-full min-w-0 ${gridMap[row.fields.length] || 'grid-cols-1'}`}>
        <SortableContext 
          items={row.fields.map(f => f.id)} 
          strategy={horizontalListSortingStrategy}
        >
          {row.fields.map((field) => (
            <SortableField
              key={field.id}
              field={field}
              onUpdateLabel={onUpdate}
              onRemove={onRemove}
              onUpdateOptions={onUpdateOptions}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
 