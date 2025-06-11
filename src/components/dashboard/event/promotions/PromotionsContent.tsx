"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs2";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

// Mock data for active promotions
const activePromotions = [
  {
    id: 1,
    name: "Summer Sale",
    discount: "20%",
    type: "Percentage Off",
    expiration: "2023-08-31",
  },
  {
    id: 2,
    name: "Buy One Get One Free",
    discount: "BOGO",
    type: "Buy One Get One",
    expiration: "2023-09-15",
  },
  {
    id: 3,
    name: "Early Bird Special",
    discount: "$10",
    type: "Fixed Amount",
    expiration: "2023-08-25",
  },
];

export function PromotionsContent({ eventId }: { eventId: string }) {
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Promotions</h1>
        <p className="text-muted-foreground">
          Manage your event promotions and discounts. We offer a variety of
          deals, special offers, and price reductions available to customers,
          often highlighting limited-time discounts, percentage off sales,
          buy-one-get-one promotions, and other incentives to encourage
          purchases.
        </p>
      </div>

      <Tabs defaultValue="promotions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Promotion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Promotion Name</Label>
                  <Input id="name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Promotion Type</Label>
                  <select id="type" className="border rounded p-2">
                    <option value="discount">Discount</option>
                    <option value="flash-sale">Flash Sale</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input id="discount" type="number" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expiration">Expiration Date</Label>
                  <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                      <Input
                        id="expiration"
                        value={expirationDate.toLocaleDateString()}
                        readOnly
                        onClick={() => setIsOpen(true)}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <Calendar
                        selected={expirationDate}
                        onSelect={(date) => {
                          setExpirationDate(date);
                          setIsOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Enter promotion details..."
                  />
                </div>
              </div>
              <Button>Create Promotion</Button>
            </CardContent>
          </Card>

          {/* List of Active Promotions */}
          <Card>
            <CardHeader>
              <CardTitle>Active Promotions</CardTitle>
              <CardDescription>
                Current deals, special offers, and price reductions available to
                customers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activePromotions.map((promotion) => (
                  <div key={promotion.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{promotion.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {promotion.type} - {promotion.discount}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Expires on: {promotion.expiration}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
