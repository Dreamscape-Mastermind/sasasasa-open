'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Search, UserPlus } from 'lucide-react';
import { useEvent } from '@/contexts/event-context';

const attendees = [
  {
    id: 1,
    name: 'Sarah Davis',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    events: 3,
    status: 'active',
  },
  {
    id: 2,
    name: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '+1 (555) 234-5678',
    events: 1,
    status: 'active',
  },
  {
    id: 3,
    name: 'Emily Brown',
    email: 'emily@example.com',
    phone: '+1 (555) 345-6789',
    events: 2,
    status: 'inactive',
  },
];

export default function AttendeesPage() {
  const { currentEvent } = useEvent();
  // TODO get all ticket types for the event

  // TODO get all attendees for the event from all the ticket types

  // TODO display the attendees in a table

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendees</h1>
          <p className="text-muted-foreground">
            Manage your event attendees and their information
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Attendee
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Attendees</CardTitle>
          <CardDescription>
            A list of all attendees across your events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search attendees..."
              className="max-w-sm"
              type="search"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell>
                      <div className="font-medium">{attendee.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{attendee.email}</div>
                        <div className="text-muted-foreground">
                          {attendee.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{attendee.events}</TableCell>
                    <TableCell>
                      <Badge
                        variant={attendee.status === 'active' ? 'default' : 'secondary'}
                      >
                        {attendee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}