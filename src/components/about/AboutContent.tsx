"use client";

import { Card } from "@/components/ui/ShadCard";
import { FAQ } from "@/components/FAQ";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const features = [
  {
    title: "Built for Africa",
    description:
      "Designed specifically for the unique needs of the Global South market",
  },
  {
    title: "Multiple Payment Options",
    description:
      "From Mobile Money to Traditional credit cards, we meet you where you are",
  },
  {
    title: "Fast Payouts",
    description: "We understand event organizers need quick access to funds",
  },
  {
    title: "Tech-Forward",
    description:
      "Leveraging open protocols like blockchain and NFTs for community engagement and interoperability",
  },
  {
    title: "Experience Backed",
    description: "Founded by event organizers who understand your challenges",
  },
];

export default function AboutContent() {
  return (
    <div className="container max-w-6xl mx-auto px-4">
      {/* Hero Section */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-4xl font-bold mt-16 mb-8">About Sasasasa</h1>
        <p className="text-lg mb-8">
          Sasasasa is innovating on digital commerce across the Global South,
          starting with Sub-Saharan Africa. We're not just another ticketing
          platform – we're building the future of entertainment commerce, one
          event at a time.
        </p>
      </motion.div>

      {/* Mission Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <h2 className="text-2xl font-bold mt-12 mb-6">Our Mission</h2>
        <p className="text-lg mb-8">
          To make buying and selling as simple as saying "sasa" (hello). Whether
          you're an independent artist hosting your first show or a major venue
          managing multiple events, we provide the tools you need to succeed.
        </p>
      </motion.div>

      {/* What Sets Us Apart Section */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerChildren}
      >
        <h2 className="text-2xl font-bold mt-12 mb-8">What Sets Us Apart</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeIn}>
              <Card
                className={cn(
                  "p-6 h-full rounded-[2rem]",
                  "hover:shadow-lg transition-shadow duration-200"
                )}
              >
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ Section */}
      <div className="my-16">
        <FAQ />
      </div>
    </div>
  );
}
