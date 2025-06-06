import {
  BarChart3,
  Calendar,
  CreditCard,
  Globe2,
  QrCode,
  Settings,
  Share2,
  Smartphone,
  Ticket,
} from "lucide-react";

export const features = [
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

export const sections = [
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
