import {
  BarChart3,
  Calendar,
  CreditCard,
  Globe2,
  HandCoins,
  Percent,
  QrCode,
  Settings,
  Share2,
  ShieldCheck,
  Smartphone,
  Ticket,
  Truck,
} from "lucide-react";

export const features = [
  {
    title: "Experience Management",
    description: "Create and manage experiences with powerful tools. Flexible ticketing options with QR code check-in and digital tickets.",
    icon: Calendar,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    title: "Social Integration",
    description: "Share and sell across social media platforms",
    icon: Share2,
    color: "bg-red-500/10 text-red-500",
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
    title: "Dropship Curated Products (Coming Soon)",
    description: "Discover and sell our curated quality products to your community via custom store links. $0 cost on stock, shipping and fulfillment using our global network.",
    icon: Globe2 ,
    color: "bg-indigo-500/10 text-indigo-500",
  },
  {
    title: "Set Your Own Commission (Coming Soon)",
    description: "Set your own commission margin on our curated products. You know your community best.",
    icon:  Percent,
    color: "bg-teal-500/10 text-teal-500",
  },

  {
    title: "0% Supplier Commission (Coming Soon)",
    description: "We don't take a cut from supplier sales. We're here to help you grow your sales and connect you with the right curators.",
    icon: HandCoins,
    color: "bg-purple-500/10 text-purple-500",
  },

  {
    title: "Trusted Suppliers (Coming Soon)",
    description: " Only verified manufacturers / wholesalers allowed",
    icon: ShieldCheck,
    color: "bg-purple-500/10 text-purple-500",
  },
  
  {
    title: "Global and Continental Shipping (Coming Soon)",
    description: "We source and ship, globally.",
    icon: Truck,
    color: "bg-purple-500/10 text-purple-500",
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
