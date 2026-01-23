"use client";

import { useResumeStore } from "@/stores/resume-store";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconPencil,
} from "@tabler/icons-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ListSectionProps {
  title: string;
  description: string;
  items: any[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onReorder: (newItems: any[]) => void;
  renderItem: (item: any) => React.ReactNode;
  renderForm: (item: any, onUpdate: (data: any) => void) => React.ReactNode;
}

function SortableItem({ id, isActive, onClick, onRemove, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        onClick={onClick}
        className={cn(
          "border rounded-lg p-3 bg-white dark:bg-neutral-800 hover:border-lime-300 dark:hover:border-lime-500 transition-all cursor-pointer flex items-center gap-3",
          isActive
            ? "border-lime-500 ring-1 ring-lime-500 bg-lime-50/10 dark:bg-lime-900/10"
            : "border-neutral-200 dark:border-neutral-700",
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="text-neutral-300 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 cursor-grab active:cursor-grabbing p-1"
        >
          <IconGripVertical className="w-4 h-4" />
        </div>

        <div className="flex-1">{children}</div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-neutral-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <IconTrash className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function ListSection({
  title,
  description,
  items,
  onAdd,
  onRemove,
  onReorder,
  renderItem,
  renderForm,
}: ListSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  // Generic Update Wrapper
  const handleUpdate = (id: string, data: any) => {
    // This needs to be passed down from parent to actually work
    // But wait, renderForm calls the parent's update
  };

  // If editing, show form
  const activeItem = items.find((i) => i.id === editingId);

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
      <div className="shrink-0">
        <h2 className="text-lg font-bold mb-1 text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
          {description}
        </p>

        {!editingId && (
          <Button
            onClick={onAdd}
            className="w-full gap-2 border-dashed border-2 bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-lime-400 dark:hover:border-lime-500 hover:text-lime-600 dark:hover:text-lime-400 shadow-none h-12"
          >
            <IconPlus className="w-4 h-4" /> Add New
          </Button>
        )}
      </div>

      {editingId && activeItem ? (
        <div className="flex-1 overflow-y-auto -mx-2 px-2">
          <div className="mb-4 pb-4 border-b flex justify-between items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingId(null)}
              className="h-8"
            >
              ← Back to List
            </Button>
            <span className="text-xs font-mono text-neutral-400">Editing</span>
          </div>
          {renderForm(activeItem, (data) => {
            // We don't have update logic here, the parent handles it via renderForm prop wrapper?
            // Actually the parent passes `(data) => updateItem(...)` as the Prop.
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.length === 0 && (
                <div className="text-center py-10 text-neutral-400 text-sm">
                  No items yet. Click add to start.
                </div>
              )}
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  isActive={false}
                  onClick={() => setEditingId(item.id)}
                  onRemove={() => onRemove(item.id)}
                >
                  {renderItem(item)}
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
