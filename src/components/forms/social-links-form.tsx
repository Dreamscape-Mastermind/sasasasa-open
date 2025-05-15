'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/ShadCard"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Circle, ImagePlus, Loader2, MapPin, Check, CircleDot, X, Facebook, Twitter, Instagram, Linkedin, Globe } from 'lucide-react'
import { useForm, Control, useFieldArray } from "react-hook-form"
import * as z from "zod"

// First, define the social links schema
const socialSchema = z.object({
  facebook_url: z.string().url("Please enter a valid Facebook URL").optional().or(z.literal("")),
  website_url: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Please enter a valid LinkedIn URL").optional().or(z.literal("")),
  instagram_url: z.string().url("Please enter a valid Instagram URL").optional().or(z.literal("")),
  twitter_url: z.string().url("Please enter a valid Twitter URL").optional().or(z.literal("")),
});


export default function SocialLinksForm() {

  // Initialize the form
const socialForm = useForm<z.infer<typeof socialSchema>>({
  resolver: zodResolver(socialSchema),
  defaultValues: {
    facebook_url: "",
    website_url: "",
    linkedin_url: "",
    instagram_url: "",
    twitter_url: "",
    },
  });

  // Submit handler
  const onSubmitSocial = (data: z.infer<typeof socialSchema>) => {
    console.log('Social Links Data:', data);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
            <Form {...socialForm}>
              <form onSubmit={socialForm.handleSubmit(onSubmitSocial)} className="space-y-6">
                <Card className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                    <CardDescription>Add social media links for your event</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={socialForm.control}
                      name="website_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4 text-gray-500" />
                              <Input 
                                {...field} 
                                placeholder="https://your-website.com"
                                className="dark:bg-zinc-900 dark:border-gray-700"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialForm.control}
                      name="facebook_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Facebook className="w-4 h-4 text-gray-500" />
                              <Input 
                                {...field} 
                                placeholder="https://facebook.com/your-page"
                                className="dark:bg-zinc-900 dark:border-gray-700"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialForm.control}
                      name="instagram_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Instagram className="w-4 h-4 text-gray-500" />
                              <Input 
                                {...field} 
                                placeholder="https://instagram.com/your-handle"
                                className="dark:bg-zinc-900 dark:border-gray-700"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialForm.control}
                      name="twitter_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Twitter className="w-4 h-4 text-gray-500" />
                              <Input 
                                {...field} 
                                placeholder="https://twitter.com/your-handle"
                                className="dark:bg-zinc-900 dark:border-gray-700"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={socialForm.control}
                      name="linkedin_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Linkedin className="w-4 h-4 text-gray-500" />
                              <Input 
                                {...field} 
                                placeholder="https://linkedin.com/company/your-page"
                                className="dark:bg-zinc-900 dark:border-gray-700"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="submit"
                    className="dark:bg-zinc-900"
                  >
                    Save Social Links
                  </Button>
                </div>
              </form>
            </Form>
      </div>
    </div>
  );
}
