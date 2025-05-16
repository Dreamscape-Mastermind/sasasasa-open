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
import { Download, Filter, QrCode, Search, Ticket } from 'lucide-react';
import TicketForm from '@/components/forms/ticket-form';

const tickets = [
  {
    id: 'TK-001',
    eventName: 'Tech Conference 2025',
    ticketType: 'VIP',
    holderName: 'Sarah Davis',
    purchaseDate: '2024-03-15',
    status: 'active',
    price: 699,
  },
  {
    id: 'TK-002',
    eventName: 'Music Festival',
    ticketType: 'Regular',
    holderName: 'Michael Johnson',
    purchaseDate: '2024-03-14',
    status: 'active',
    price: 199,
  },
  {
    id: 'TK-003',
    eventName: 'Food & Wine Expo',
    ticketType: 'Early Bird',
    holderName: 'Emily Brown',
    purchaseDate: '2024-03-14',
    status: 'used',
    price: 149,
  },
];

export default function TicketsPage() {
  return (
    <div className="space-y-6 animate-in">
      <TicketForm/>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tickets</h1>
          <p className="text-muted-foreground">
            Manage and track all event tickets
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tickets
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Tickets
            </CardTitle>
            <QrCode className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">
              Ready for use
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Used Tickets
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              Already scanned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">
              Total ticket sales
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tickets</CardTitle>
          <CardDescription>
            A list of all tickets across your events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search tickets..."
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
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Ticket Type</TableHead>
                  <TableHead>Holder</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">
                      {ticket.id}
                    </TableCell>
                    <TableCell>{ticket.eventName}</TableCell>
                    <TableCell>{ticket.ticketType}</TableCell>
                    <TableCell>{ticket.holderName}</TableCell>
                    <TableCell>{ticket.purchaseDate}</TableCell>
                    <TableCell>${ticket.price}</TableCell>
                    <TableCell>
                      <Badge
                        variant={ticket.status === 'active' ? 'default' : 'secondary'}
                      >
                        {ticket.status}
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