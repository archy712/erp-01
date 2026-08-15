"use client";

import * as React from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export interface KanbanCard {
  id: string;
  title: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cardIds: string[];
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>;
  onColumnsChange: (columns: KanbanColumn[]) => void;
}

function KanbanCardItem({ card }: { card: KanbanCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      <Card className="cursor-grab gap-0 p-3 text-sm font-medium active:cursor-grabbing">
        {card.title}
      </Card>
    </div>
  );
}

function KanbanColumnView({
  column,
  cards,
}: {
  column: KanbanColumn;
  cards: Record<string, KanbanCard>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-64 shrink-0 flex-col gap-2 rounded-lg border bg-muted/30 p-3",
        isOver && "bg-muted/60",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-semibold">{column.title}</span>
        <span className="text-xs text-muted-foreground">
          {column.cardIds.length}
        </span>
      </div>
      <SortableContext
        items={column.cardIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex min-h-10 flex-col gap-2">
          {column.cardIds.map((cardId) =>
            cards[cardId] ? (
              <KanbanCardItem key={cardId} card={cards[cardId]} />
            ) : null,
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({
  columns,
  cards,
  onColumnsChange,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const findColumn = (id: string) =>
    columns.find((col) => col.id === id || col.cardIds.includes(id));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    onColumnsChange(
      columns.map((col) => {
        if (col.id === activeColumn.id) {
          return {
            ...col,
            cardIds: col.cardIds.filter((id) => id !== activeId),
          };
        }
        if (col.id === overColumn.id) {
          const overIndex = col.cardIds.indexOf(overId);
          const insertAt = overIndex >= 0 ? overIndex : col.cardIds.length;
          const next = [...col.cardIds];
          next.splice(insertAt, 0, activeId);
          return { ...col, cardIds: next };
        }
        return col;
      }),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const column = findColumn(activeId);
    if (!column) return;

    const oldIndex = column.cardIds.indexOf(activeId);
    const newIndex = column.cardIds.indexOf(overId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    onColumnsChange(
      columns.map((col) =>
        col.id === column.id
          ? { ...col, cardIds: arrayMove(col.cardIds, oldIndex, newIndex) }
          : col,
      ),
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full gap-3 overflow-x-auto pb-2">
        {columns.map((column) => (
          <KanbanColumnView key={column.id} column={column} cards={cards} />
        ))}
      </div>
      <DragOverlay>
        {activeId && cards[activeId] ? (
          <Card className="w-64 gap-0 p-3 text-sm font-medium shadow-lg">
            {cards[activeId].title}
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
