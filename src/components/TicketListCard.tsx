
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Ticket, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";


export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  status: "active" | "draft" | "ended";
  startDate?: string;
  endDate?: string;
}

interface TicketCardProps {
  ticket: TicketType;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const TicketCard = ({ ticket, onEdit, onDelete }: TicketCardProps) => {
  const [isActive, setIsActive] = useState(ticket.status === "active");
  // const { toast } = useToast();

  const handleStatusChange = (checked: boolean) => {
    setIsActive(checked);
    // toast({
    //   title: `Ticket ${checked ? "activated" : "deactivated"}`,
    //   description: `"${ticket.name}" is now ${checked ? "active" : "inactive"}.`,
    // });
  };

  const getStatusBadge = () => {
    switch (ticket.status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <div 
            className={`p-2 rounded-md ${
              ticket.name.includes("VIP") ? "bg-purple-100" : 
              ticket.name.includes("Early Bird") ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <Ticket 
              className={`h-5 w-5 ${
                ticket.name.includes("VIP") ? "text-purple-500" : 
                ticket.name.includes("Early Bird") ? "text-blue-500" : "text-gray-500"
              }`} 
            />
          </div>
          <div>
            <p className="font-semibold">{ticket.name}</p>
            <p className="text-sm text-muted-foreground">
              ${ticket.price.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(ticket.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(ticket.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="font-medium">{ticket.quantity - ticket.sold}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sold</p>
            <p className="font-medium">{ticket.sold} / {ticket.quantity}</p>
          </div>
        </div>
        
        {(ticket.startDate || ticket.endDate) && (
          <div className="mt-3 text-sm">
            <p className="text-muted-foreground">Sale period</p>
            <p>{ticket.startDate || "Now"} - {ticket.endDate || "Unlimited"}</p>
          </div>
        )}
      </CardContent>

      <Separator />

      <CardFooter className="pt-3 flex items-center justify-between">
        <div className="flex items-center">
          <Switch 
            checked={isActive} 
            onCheckedChange={handleStatusChange}
            id={`switch-${ticket.id}`}
          />
          <label 
            htmlFor={`switch-${ticket.id}`}
            className="ml-2 text-sm font-medium cursor-pointer"
          >
            {isActive ? "Active" : "Inactive"}
          </label>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit(ticket.id)}>
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TicketCard;