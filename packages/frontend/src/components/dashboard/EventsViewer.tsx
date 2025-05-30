import { Card, Text } from "@tremor/react";

interface Event {
  type: string;
  message: string;
  timestamp: string;
}

interface EventsViewerProps {
  events: Event[];
}

export default function EventsViewer({ events }: EventsViewerProps) {
  return (
    <Card className="mt-4">
      <Text className="font-bold mb-2">Logs & Events</Text>
      <div className="max-h-48 overflow-y-auto">
        {events.length === 0 ? (
          <Text>No events available</Text>
        ) : (
          events.map((event, index) => (
            <div key={index} className="mb-2">
              <Text className="font-semibold">{event.type}</Text>
              <Text>{event.message}</Text>
              <Text className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</Text>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
