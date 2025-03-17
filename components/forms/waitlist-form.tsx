'use client'

import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'

import { ChevronRightIcon } from '@radix-ui/react-icons'
import { Input } from '../ui/input'
import ReCAPTCHA from 'react-google-recaptcha'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'

// Update schema to validate email and name
const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  full_name: z
    .string()
    .max(100, { message: 'Full name should not exceed 100 characters.' })
    .optional(),
})

export function WaitlistForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [showCaptcha, setShowCaptcha] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      full_name: '', // Optional field default
    },
  })

  // Add this function to validate email before showing captcha
  const handleEmailValidation = async (email: string) => {
    try {
      await formSchema.parseAsync({ email })
      setShowCaptcha(true)
    } catch (error) {
      setShowCaptcha(false)
    }
  }

  // Update WaitlistForm component's onSubmit method
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError('')
    setSuccess('')
    
    if (!captchaToken) {
      setError('Please complete the reCAPTCHA')
      setLoading(false)
      return
    }

    try {
      // First, initiate the OTP login
      const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/accounts/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: values.email,
          // full_name: values.full_name,
          // recaptchaToken: captchaToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Please check your email for the verification code.')
        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=waitlist`)
      } else {
        setError(data.error || 'Something went wrong, please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}
      {success && (
        <p className="text-green-500 text-sm mb-4 text-center">{success}</p>
      )}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-6 flex flex-col items-center space-y-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Input
                  placeholder="fomo@sasasasa.co"
                  className="w-full min-w-8 rounded-full border border-neutral-800 placeholder:text-neutral-700 focus:ring-2 focus:ring-teal-500"
                  type="email"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e)
                    handleEmailValidation(e.target.value)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showCaptcha && (
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token) => setCaptchaToken('token')}
          />
        )}
        <Button type="submit">
          {loading ? 'Submitting...' : 'Sign Up'} <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}
