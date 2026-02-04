import { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableField from './SortableField';
import { FormRow } from '@/types/form';
 
interface BuilderRowProps {
  row: FormRow;
  onUpdate: any;
  onRemove: any;
  onUpdateOptions: (id: string, options: string[]) => void;
}
 
export default function BuilderRow({
  row,
  onUpdate,
  onRemove,
  onUpdateOptions,
}: BuilderRowProps) {
  const { setNodeRef, isOver } = useDroppable({ id: row.id });
 

  const sortableItems = useMemo(
    () => row.fields.map((f) => f.id),
    [row.fields]
  );
 
  const columns = row.fields.length || 1;
 
  return (
    <div
      ref={setNodeRef}
      className={`min-h-27.5 p-4 rounded-2xl border-2 transition-all ${
        isOver
          ? 'border-indigo-400 bg-indigo-50'
          : row.fields.length === 0
          ? 'border-dashed border-slate-200'
          : 'border-transparent bg-white shadow-sm'
      }`}
    >

      <div
        className="grid gap-4 h-full"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        <SortableContext
          items={sortableItems}
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
 