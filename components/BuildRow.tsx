import { useMemo, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableField from './SortableField';
import { FormRow } from '@/types/form';

const BuilderRow = memo(({ 
  row, 
  onUpdate, 
  onRemove, 
  onUpdateOptions 
}: { 
  row: FormRow, 
  onUpdate: (id: string, label: string) => void, 
  onRemove: (id: string) => void, 
  onUpdateOptions: (id: string, options: string[]) => void 
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: row.id });

  // Memoize the IDs to ensure SortableContext doesn't see a new array on every render
  const fieldIds = useMemo(() => row.fields.map(f => f.id), [row.fields]);

  const gridMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
  };

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[110px] p-4 rounded-2xl border-2 transition-all ${
        isOver 
          ? 'border-indigo-400 bg-indigo-50 shadow-inner' 
          : row.fields.length === 0 
            ? 'border-dashed border-slate-200 bg-slate-50/50' 
            : 'border-transparent bg-white shadow-sm'
      }`}
    >
      <div className={`grid gap-4 h-full min-w-0 ${gridMap[row.fields.length] || 'grid-cols-1'}`}>
        <SortableContext 
          items={fieldIds}
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
}, (prev, next) => {
  // Deep check: Only re-render if the row ID changes or the actual field data changes
  return (
    prev.row.id === next.row.id && 
    prev.row.fields.length === next.row.fields.length &&
    JSON.stringify(prev.row.fields) === JSON.stringify(next.row.fields)
  );
});

// Fix for: Component definition is missing display name
BuilderRow.displayName = 'BuilderRow';

export default BuilderRow;