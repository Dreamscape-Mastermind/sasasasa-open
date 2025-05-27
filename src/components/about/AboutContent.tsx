"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/ShadCard";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

const faqData = [
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept various payment methods including Mobile Money (M-Pesa), credit cards, and (soon) select cryptocurrencies.",
  },
  {
    question: "How quickly can event organizers access their funds?",
    answer:
      "Most payouts are processed within 24-48 hours, subject to our security verification process.",
  },
  {
    question: "Can I sell tickets to virtual events?",
    answer:
      "Yes! Sasasasa supports both physical and virtual events, with integrated solutions for streaming and access management coming soon.",
  },
  {
    question: "What makes Sasasasa different from other ticketing platforms?",
    answer:
      "We're built specifically for the Global South market, with features like offline ticket validation, multiple payment options, and fast local payouts.",
  },
];
export default function AboutContent() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleToggle = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };
  return (
    <div className="container max-w-6xl mx-auto px-4">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <h1 className="text-4xl font-bold mt-16 mb-8">About Sasasasa</h1>
        <p className="text-lg mb-8">
          Sasasasa is innovating on digital commerce across the Global South,
          starting with Sub-Saharan Africa. We're not just another ticketing
          platform – we're building the future of entertainment commerce, one
          event at a time.
        </p>
      </motion.div>
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
      <div className="my-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="w-full"
        >
          <h2 className="text-3xl font-bold mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4 mt-6">
            {faqData.map((faq, index) => {
              const isExpanded = expanded === `panel${index}`;

              return (
                <Card
                  key={index}
                  className={cn(
                    "overflow-hidden transition-all duration-200 rounded-2xl",
                    isExpanded && "ring-2 ring-primary"
                  )}
                >
                  <button
                    className={cn(
                      "flex w-full items-center justify-between px-6 py-4",
                      "text-left text-lg font-semibold rounded-2xl",
                      "hover:bg-muted/50 transition-colors"
                    )}
                    onClick={() => handleToggle(`panel${index}`)}
                    aria-expanded={isExpanded}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform duration-200 flex-shrink-0 ml-4",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-muted-foreground">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              );
            })}
          </div>

          {/* Contact Section */}
          <motion.div variants={fadeIn} className="mt-12 text-center">
            <Card className="p-8 rounded-2xl">
              <h3 className="text-xl font-semibold mb-4">
                Still have questions?
              </h3>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Please contact our
                friendly team.
              </p>
              <Button variant="default" className="gap-2" asChild>
                <a href="mailto:hello@sasasasa.co">
                  <Mail className="h-4 w-4" />
                  support@sasasasa.co
                </a>
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
