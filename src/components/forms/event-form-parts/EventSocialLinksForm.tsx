import * as z from "zod";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Facebook, Instagram, Linkedin, Twitter } from "@/components/social-icons/icons";
import { Globe } from "lucide-react";

const formSchema = z.object({
  facebook_url: z.string().optional(),
  website_url: z.string().optional(),
  linkedin_url: z.string().optional(),
  instagram_url: z.string().optional(),
  twitter_url: z.string().optional(),
});

export function EventSocialLinksForm() {
  const { control } = useFormContext();

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>Social media links?</AccordionTrigger>
        <AccordionContent>
          <FormField
            control={control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <Input
                      {...field}
                      placeholder="https://your-website.com"
                      className="rounded-lg "
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="facebook_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Facebook color="white" className="w-4 h-4" />
                    <Input
                      {...field}
                      placeholder="https://facebook.com/your-page"
                      className="rounded-lg "
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="instagram_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Instagram className="w-4 h-4" />
                    <Input
                      {...field}
                      placeholder="https://instagram.com/your-handle"
                      className="rounded-lg "
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="twitter_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Twitter className="w-4 h-4 " />
                    <Input
                      {...field}
                      placeholder="https://twitter.com/your-handle"
                      className="rounded-lg "
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-4 h-4" />
                    <Input
                      {...field}
                      placeholder="https://linkedin.com/company/your-page"
                      className="rounded-lg "
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}