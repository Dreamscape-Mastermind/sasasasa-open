"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { X } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function Cart() {
  const items: CartItem[] = [
    {
      id: "1",
      name: "THE CRYSTAL PROJECT CD EDITION",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
    {
      id: "2",
      name: "PHONE CASE",
      price: 30.0,
      quantity: 2,
      image: "/logo.png?height=100&width=100",
    },
  ];

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCloseCart = () => {
    // Implement the logic to close the cart sidebar
    console.log("Close cart");
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-normal">Cart</h1>
        {/* <Button
          variant="ghost"
          size="icon"
          onClick={handleCloseCart}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
          <span className="sr-only">Close cart</span>
        </Button> */}
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 py-4">
            <div className="bg-[#f8e8ff] rounded-lg overflow-hidden w-24 h-24 flex-shrink-0">
              <Image
                src={item.image}
                alt={item.name}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-normal text-gray-700">
                    {item.name}
                  </h3>
                  <p className="text-lg mt-1">${item.price.toFixed(2)}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">
                <Select defaultValue={item.quantity.toString()}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex justify-between items-center text-lg">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <Button className="w-full h-12 text-lg bg-[#CC322D] hover:bg-[#CC322D]">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
