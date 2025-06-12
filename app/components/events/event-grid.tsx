"use client";
import { EventCard } from "./event-card";
import type { EventType } from "./events-management";

interface EventGridProps {
  events: EventType[];
  onEdit: (event: EventType) => void;
  onDelete: (event: EventType) => void;
  onViewDetails: (event: EventType) => void;
}

export function EventGrid({
  events,
  onEdit,
  onDelete,
  onViewDetails,
}: EventGridProps) {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event, index) => (
          <EventCard
            key={event.event_id}
            event={event}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
