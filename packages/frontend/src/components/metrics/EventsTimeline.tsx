import { Card, Title } from "@tremor/react";
import { format } from "date-fns";
import { Event } from "../../services/metrics";

interface EventsTimelineProps {
  events: Event[];
}

export default function EventsTimeline({ events }: EventsTimelineProps) {
  return (
    <Card>
      <Title>Contract Events</Title>
      <ul className="list-disc list-inside space-y-2 mt-4">
        {events.map((event, index) => (
          <li key={index}>
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              {event.type}
            </p>
            <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
              {event.details}
            </p>
            <p className="text-tremor-label text-tremor-content-subtle dark:text-dark-tremor-content-subtle">
              {format(new Date(event.timestamp), 'PPp')}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
