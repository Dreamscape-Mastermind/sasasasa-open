'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { ChevronRight, Loader2, Sparkles, Info } from "lucide-react"
import { useForm } from "react-hook-form"
import { Ticket } from "@/utils/dataStructures"
import { useRouter } from 'next/navigation'
import { isFlashSaleValid } from "@/utils/utils"

interface CheckoutProps {
  isOpen: boolean
  onClose: () => void
  total: number
  tickets: Ticket[]
}

type FormData = {
  firstName: string
  lastName: string
  email: string
  discountCode: string
}

type CheckoutStep = 'details' | 'payment' | 'processing' | 'success' | 'error'

const SUPPORT_EMAIL = 'support@sasasasa.co';

// Add this helper function
const hasValidFlashSale = (tickets: Ticket[]): boolean => {
  return tickets.some(ticket => ticket.flash_sale && isFlashSaleValid(ticket.flash_sale));
};

export function Checkout({ isOpen, onClose, total, tickets }: CheckoutProps) {
  const router = useRouter()
  const [step, setStep] = useState<CheckoutStep>('details')
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()
  const filteredTickets = tickets.filter(ticket => {
    const qty = ticket.quantity ? parseInt(ticket.quantity.toString(), 10) : 0;
    return !isNaN(qty) && qty > 0;
  }).map(ticket => ({
    ...ticket,
    quantity: ticket.quantity ? parseInt(ticket.quantity.toString(), 10) : 0,
    price: parseFloat(ticket.price.toString())
  }));

  const onSubmit = async (data: FormData) => {
    // Early validation and logging
    if (!data || !data.email) {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'CHECKOUT_VALIDATION_ERROR',
          data: {
            error: 'Missing required form data',
            formData: data
          }
        })
      }).catch(console.error);
      setError('Missing required form data');
      setStep('error');
      return;
    }

    // Validate tickets data
    if (!filteredTickets || filteredTickets.length === 0) {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'CHECKOUT_VALIDATION_ERROR',
          data: {
            error: 'No valid tickets in cart',
            tickets: filteredTickets,
            rawTickets: tickets
          }
        })
      }).catch(console.error);
      setError('No valid tickets selected');
      setStep('error');
      return;
    }

    setStep('processing');
    const payload = {
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      discount_code: data.discountCode || null,
      tickets: filteredTickets.map(ticket => ({
        ticket_type_id: ticket.id,
        quantity: ticket.quantity,
        price: parseFloat(ticket.price.toString())
      })),
      provider: "PAYSTACK"
    };

    try {
      // Log checkout attempt with device info
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'CHECKOUT_ATTEMPT',
          data: {
            email: data.email,
            total: total,
            ticketCount: filteredTickets.reduce((sum, t) => sum + t.quantity, 0),
            flashSales: filteredTickets
              .filter(t => t.flash_sale && isFlashSaleValid(t.flash_sale))
              .map(t => ({
                ticketId: t.id,
                flashSaleId: t.flash_sale?.id,
                discountType: t.flash_sale?.discount_type,
                discountAmount: t.flash_sale?.discount_amount
              })),
            userAgent: window.navigator.userAgent,
            screenSize: {
              width: window.innerWidth,
              height: window.innerHeight
            },
            timestamp: new Date().toISOString()
          }
        })
      }).catch(console.error);

      // Validate API URL
      const apiUrl = process.env.NEXT_PUBLIC_SASASASA_API_URL;
      if (!apiUrl) {
        throw new Error('API URL configuration is missing');
      }

      const response = await fetch(`${apiUrl}api/v1/events/${process.env.NEXT_PUBLIC_EVENT_ID}/tickets/purchase`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        mode: 'cors',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        // Log API error details
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (result.status === 'success' && result.result?.payment_details?.authorization_url) {
        const { authorization_url } = result.result.payment_details;
        
        // Log successful checkout before redirect
        await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'CHECKOUT_SUCCESS',
            data: {
              email: data.email,
              total: total,
              paymentUrl: authorization_url,
              timestamp: new Date().toISOString()
            }
          })
        }).catch(console.error);
        
        window.location.href = authorization_url;
      } else {
        throw new Error(result.message || 'Invalid response format from payment service');
      }
    } catch (err) {
      // Enhanced error logging
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'CHECKOUT_ERROR',
          data: {
            email: data.email,
            error: err instanceof Error ? {
              message: err.message,
              stack: err.stack,
              name: err.name
            } : 'Unknown error',
            payload: payload,
            total: total,
            userAgent: window.navigator.userAgent,
            timestamp: new Date().toISOString(),
            url: window.location.href
          }
        })
      }).catch(console.error);

      setStep('error');
      setError(err instanceof Error ? 
        `${err.message}. Please try again or contact support if the problem persists.` : 
        'Failed to process ticket purchase. Please try again.'
      );
    }
  };

  const calculateOriginalTotal = (ticket: Ticket, quantity: number) => {
    if (!ticket || isNaN(quantity)) return 0;
    const price = parseFloat(ticket.price.toString());
    return isNaN(price) ? 0 : price * quantity;
  };

  const calculatePotentialSavings = (ticket: Ticket, quantity: number) => {
    if (!ticket?.flash_sale || !isFlashSaleValid(ticket.flash_sale)) return 0;
    const originalPrice = parseFloat(ticket.price.toString());
    if (isNaN(originalPrice)) return 0;
    
    const { discount_type, discount_amount } = ticket.flash_sale;
    if (discount_type === 'PERCENTAGE') {
      return (originalPrice * (discount_amount / 100)) * quantity;
    }
    // For FIXED discount type
    return discount_amount * quantity;
  };

  const calculateTotal = () => {
    return filteredTickets.reduce((total, ticket) => {
        const price = isFlashSaleValid(ticket.flash_sale) && ticket.flash_sale 
            ? ticket.flash_sale.discounted_price
            : ticket.price;
        return total + (price * ticket.quantity);
    }, 0);
  };

  const renderStep = () => {
    switch (step) {
      case 'details':
        return (
          <div className="space-y-6">
            {/* Order Summary Card */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-4">
                {filteredTickets.map((ticket, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium">{ticket.name}</h4>
                        <p className="text-sm text-muted-foreground">Quantity: {ticket.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          KES {(isFlashSaleValid(ticket.flash_sale) && ticket.flash_sale 
                            ? ticket.flash_sale.discounted_price * ticket.quantity
                            : parseFloat(ticket.price.toString()) * ticket.quantity
                          ).toFixed(2)}
                        </div>
                        {ticket.flash_sale && isFlashSaleValid(ticket.flash_sale) && (
                          <div className="text-sm text-green-600 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" />
                            <span>
                              {ticket.flash_sale.discount_type === 'PERCENTAGE' 
                                ? `Save ${ticket.flash_sale.discount_amount}% (-KES ${calculatePotentialSavings(ticket, ticket.quantity).toFixed(2)})`
                                : `Save KES ${calculatePotentialSavings(ticket, ticket.quantity).toFixed(2)}`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Subtotal</span>
                    <span>KES {total.toFixed(2)}</span>
                  </div>
                  {filteredTickets.some(t => t.flash_sale && isFlashSaleValid(t.flash_sale)) && (
                    <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>Flash sale savings will be applied at checkout</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Details</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <Input 
                      {...register('firstName', { required: true })}
                      className={errors.firstName ? 'border-red-500' : ''}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <Input 
                      {...register('lastName', { required: true })}
                      className={errors.lastName ? 'border-red-500' : ''}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input 
                    type="email" 
                    {...register('email', { 
                      required: true, 
                      pattern: /^\S+@\S+$/i 
                    })}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="john.doe@example.com"
                  />
                  {errors.email && (
                    <span className="text-xs text-red-500">
                      Valid email required
                    </span>
                  )}
                </div>
                
                {/* Only show discount code field if no valid flash sales */}
                {!hasValidFlashSale(filteredTickets) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Discount Code <span className="text-muted-foreground">(Optional)</span>
                    </label>
                    <Input 
                      {...register('discountCode')}
                      placeholder="Enter code"
                    />
                  </div>
                )}

                {/* If there is a flash sale, show explanation why discount codes are disabled */}
                {hasValidFlashSale(filteredTickets) && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Discount codes are available after the flash sale expires.</span>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full">
                Continue to Payment 
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <p className="text-sm text-center text-muted-foreground">
                Having trouble? Contact{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </form>
          </div>
        )

      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Processing your payment...</p>
          </div>
        )

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-green-500 bg-green-50 p-3 rounded-full">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Payment Successful!</h3>
            <p className="text-center text-sm text-gray-600">
              Your tickets have been sent to your email address.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        )

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-red-500 bg-red-50 p-3 rounded-full">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Payment Failed</h3>
            <p className="text-center text-sm text-gray-600">{error}</p>
            <p className="text-sm text-muted-foreground text-center">
              Need help? Contact us at{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep('details')}>Try Again</Button>
              <Button variant="destructive" onClick={onClose}>Cancel</Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Checkout</DialogTitle>
          <DialogDescription className="overflow-y-auto">
            {renderStep()}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
} 