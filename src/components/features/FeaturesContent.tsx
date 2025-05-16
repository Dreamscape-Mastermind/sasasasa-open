"use client";

import {
  BarChart3,
  Calendar,
  Check,
  CreditCard,
  Globe2,
  QrCode,
  Settings,
  Share2,
  Smartphone,
  Ticket,
} from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

const features = [
  {
    title: "Event Management",
    description: "Create and manage events with powerful tools",
    icon: Calendar,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Ticketing System",
    description: "Flexible ticketing options with QR code check-in",
    icon: Ticket,
    color: "bg-green-500/10 text-green-500",
  },
  {
    title: "Analytics Dashboard",
    description: "Track sales and attendance with detailed analytics",
    icon: BarChart3,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    title: "Payment Processing",
    description: "Secure payment processing with multiple options",
    icon: CreditCard,
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    title: "Mobile Check-in",
    description: "Quick and easy check-in with our mobile app",
    icon: Smartphone,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "QR Code Tickets",
    description: "Digital tickets with secure QR code verification",
    icon: QrCode,
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    title: "Social Integration",
    description: "Share events across social media platforms",
    icon: Share2,
    color: "bg-red-500/10 text-red-500",
  },
  {
    title: "Custom Branding",
    description: "Personalize your event pages and tickets",
    icon: Settings,
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    title: "Multi-language",
    description: "Support for multiple languages and regions",
    icon: Globe2,
    color: "bg-teal-500/10 text-teal-500",
  },
];

const sections = [
  {
    title: "Event Management",
    description:
      "Powerful tools to create and manage successful events of any size",
    features: [
      "Customizable event pages",
      "Multiple ticket types",
      "Scheduled publishing",
      "Attendee management",
      "Event analytics",
      "Custom branding",
    ],
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop",
  },
  {
    title: "Ticketing & Payments",
    description: "Flexible ticketing options with secure payment processing",
    features: [
      "Multiple payment methods",
      "Secure transactions",
      "Automatic refunds",
      "Dynamic pricing",
      "Discount codes",
      "Group bookings",
    ],
    image:
      "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=800&h=600&fit=crop",
  },
  {
    title: "Marketing & Analytics",
    description: "Tools to promote your events and track their performance",
    features: [
      "Social media integration",
      "Email campaigns",
      "Sales tracking",
      "Attendance reports",
      "Customer insights",
      "ROI analysis",
    ],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop",
  },
];

export default function FeaturesContent() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">
              Everything You Need to Create Successful Events
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Powerful features to help you manage events of any size, from
              registration to check-in and beyond.
            </p>
            <Button size="lg">Get Started</Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${feature.color}`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-32 py-20">
        {sections.map((section, index) => (
          <div key={section.title} className="container mx-auto px-4">
            <div
              className={`grid md:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                  <p className="text-xl text-muted-foreground">
                    {section.description}
                  </p>
                </div>
                <ul className="grid gap-3">
                  {section.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-lg"
                    >
                      <Check className="h-5 w-5 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button size="lg">Learn More</Button>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden">
                <img
                  src={section.image}
                  alt={section.title}
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Creating Events?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers who trust EventFlow to create
            memorable experiences for their attendees.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={ROUTES.LOGIN}>Get Started</Link>
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
