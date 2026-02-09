'use client';
import { useMemo, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import SortableField from './SortableField';
import { FormRow } from '@/types/form';

const BuilderRow = memo(({ row }: { row: FormRow }) => {
  const { setNodeRef, isOver } = useDroppable({ id: row.id });

  // Memoize IDs to prevent SortableContext from re-calculating unnecessarily
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
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}, (prev, next) => {
  // Deep comparison to prevent re-renders if data hasn't actually changed
  return (
    prev.row.id === next.row.id && 
    prev.row.fields.length === next.row.fields.length &&
    JSON.stringify(prev.row.fields) === JSON.stringify(next.row.fields)
  );
});

BuilderRow.displayName = 'BuilderRow';

export default BuilderRow;