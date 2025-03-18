'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormMessage } from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import Image from 'next/image'
import { AppKit } from 'contexts/AppKit'

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
})

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/accounts/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: values.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/verify-otp?email=${encodeURIComponent(values.email)}&type=login`)
      } else {
        setError(data.error || 'Failed to send verification code')
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image
            src="/images/sasasasaLogo.png"
            alt="Sasasasa Logo"
            width={150}
            height={50}
            className="mx-auto mb-4"
          />
          <h2 className="mt-6 text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-200">
            Sign in to get started
          </p>
          <div className='mt-4 flex justify-center'>
            <AppKit/>
          </div>
        </div>

        {/* <Form {...form}>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className="rounded-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending Code...' : 'Continue with Email'}
            </Button>
          </form>
        </Form> */}
      </div>
    </div>
  )
} 