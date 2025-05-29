import { Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge } from "@tremor/react";
import { format } from "date-fns";
import { Log } from "../../services/metrics";

interface LogsTableProps {
  logs: Log[];
}

export default function LogsTable({ logs }: LogsTableProps) {
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return 'blue';
      case 'success':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Card>
      <Title>Contract Logs</Title>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Timestamp</TableHeaderCell>
            <TableHeaderCell>Level</TableHeaderCell>
            <TableHeaderCell>Message</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>
                {format(new Date(log.timestamp), 'PPp')}
              </TableCell>
              <TableCell>
                <Badge color={getLevelColor(log.level)}>
                  {log.level}
                </Badge>
              </TableCell>
              <TableCell>{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
