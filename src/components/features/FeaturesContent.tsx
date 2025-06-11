"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { features, sections } from "./data";

import { Button } from "@/components/ui/button";
import router from "next/router";

export default function FeaturesContent() {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">
              Everything You Need To Scale A Sustainable Creative Empire.
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              All-in-one platform to sell products, host events, and grow your brand. Gain lower fees, fewer barriers, and more freedom.
            </p>
            <Button size="lg">Get Started</Button>
          </div>
        </div>
      </div>
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
      {/* <div className="space-y-32 py-20">
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
      </div> */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready To Grow Your Brand?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our growing community of creatives who trust Sasasasa to create to grow their community and revenue.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/dashboard")}>Get Started</Button>
            {/* <Button size="lg" variant="outline">
              Contact Sales
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
