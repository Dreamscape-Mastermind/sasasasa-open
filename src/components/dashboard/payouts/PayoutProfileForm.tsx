'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

const payoutProfileSchema = z.object({
  idType: z.string(),
  idNumber: z.string(),
  idPhoto: z.any().refine(file => file instanceof File, "ID Photo is required."),
  selfie: z.any().refine(file => file instanceof File, "Selfie is required."),
  terms: z.boolean().refine(value => value === true, "You must accept the terms and conditions."),
});

type PayoutProfileFormValues = z.infer<typeof payoutProfileSchema>;

export function PayoutProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const form = useForm<PayoutProfileFormValues>({
    resolver: zodResolver(payoutProfileSchema),
    defaultValues: {
      terms: false,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: any, setPreview: (value: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        field.onChange(file);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: PayoutProfileFormValues) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success('Your payout profile is pending approval.');
  }

  if (isSubmitted) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold">Pending Approval</h2>
        <p className="text-gray-500 mt-2">
          Your payout profile has been submitted and is currently under review.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="idType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an ID type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="national-id">National ID</SelectItem>
                  <SelectItem value="passport">Passport</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Number</FormLabel>
              <FormControl>
                <Input placeholder="Your ID number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="idPhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID Photo</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => handleFileChange(e, field, setIdPhotoPreview)} />
              </FormControl>
              {idPhotoPreview && <Image src={idPhotoPreview} alt="ID Photo Preview" width={200} height={200} />}              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="selfie"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selfie</FormLabel>
              <FormControl>
                <Input type="file" onChange={(e) => handleFileChange(e, field, setSelfiePreview)} />
              </FormControl>
              {selfiePreview && <Image src={selfiePreview} alt="Selfie Preview" width={200} height={200} />}              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to the terms of service
                </FormLabel>
                <FormDescription>
                  You agree to our Terms of Service and Privacy Policy.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </form>
    </Form>
  );
}
