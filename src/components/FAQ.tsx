"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "./ui/ShadCard";
import { cn } from "@/lib/utils";
import { useState } from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export const FAQ = () => {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleToggle = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeIn}
      className="w-full"
    >
      <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

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
          <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
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
  );
};

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
