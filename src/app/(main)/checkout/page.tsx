"use client";

import { Card, CardContent } from "@/components/ui/ShadCard";
import { ChevronDown, Lock, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Component() {
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState(false);

  const cartItems = [
    {
      id: 1,
      name: "THE CRYSTAL PROJECT CD EDITION",
      quantity: 2,
      price: 30.0,
      image: "/logo.png?height=80&width=80",
      hasDetails: true,
    },
    {
      id: 2,
      name: "PHONE CASE",
      quantity: 2,
      price: 30.0,
      image: "/logo.png?height=80&width=80",
      hasDetails: false,
    },
  ];

  const handlePromoSubmit = () => {
    setPromoError(true);
  };

  return (
    <div className="bg-gray-50">
      <div className=" max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[1fr,400px]">
          {/* Scrollable Left Section */}
          <div className="space-y-8">
            <div className="bg-gray-100 p-4 text-sm">
              Have an account?{" "}
              <Button variant="link" className="h-auto p-0 text-primary">
                Log in
              </Button>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-medium">Customer details</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="firstName">First name *</Label>
                  <Input id="firstName" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name *</Label>
                  <Input id="lastName" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input id="phone" type="tel" required />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-medium">Payment details</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method *</Label>
                  <div className="relative">
                    <Select>
                      <SelectTrigger
                        id="payment-method"
                        className="w-full bg-white"
                      >
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        side="bottom"
                        position="popper"
                        className="w-full min-w-[200px]"
                        avoidCollisions={false}
                      >
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="crypto">Crypto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Right Section */}
          <div>
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Order summary (4)</h2>
                    <Button variant="link" className="h-auto p-0">
                      Edit Cart
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="h-20 w-20 rounded-lg border object-cover"
                          height={80}
                          width={80}
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          {item.hasDetails && (
                            <Button
                              variant="link"
                              className="h-auto p-0 text-sm"
                            >
                              More Details{" "}
                              <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => setPromoError(false)}
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      Enter a promo code
                    </Button>
                    {(promoCode || promoError) && (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g., SAVE50"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value)}
                          />
                          <Button onClick={handlePromoSubmit}>Apply</Button>
                        </div>
                        {promoError && (
                          <p className="text-sm text-red-500">
                            This promo code isn't valid.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>$60.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales Tax</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-medium">
                      <span>Total</span>
                      <span>$60.00</span>
                    </div>
                  </div>

                  <Button className="w-full">
                    <Lock className="mr-2 h-4 w-4" /> Secure Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
