import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const reference = searchParams.get('reference')

    if (!reference) {
      return Response.json(
        { 
          error: 'Missing required parameter: reference',
          status: 'FAILED',
          message: 'Invalid request parameters',
          reference: '',
          amount: 0
        }, 
        { status: 400 }
      )
    }

    // Construct the URL with query parameters for Paystack
    const url = new URL(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/payments/verify?reference=${reference}`)
    console.log('url ', url)
    const response = await fetch(url.toString(), {
      method: 'POST',
      // Add cache control for production
      cache: process.env.NODE_ENV === 'production' ? 'no-store' : 'default',
    })

    const data = await response.json()
    
    // Add debug logging in production
    if (process.env.NODE_ENV === 'production') {
      console.log('Payment verification response:', {
        status: data.status,
        message: data.message,
        data: data.data,
        rawAmount: data.data?.amount
      })
    }

    // Handle successful responses with direct amount
    const status = data?.status === 'success' ? 'COMPLETED' : 'FAILED'
    
    let amount = 0
    if (data.data?.amount) {
      // Just parse the amount without division since it's already in the correct format
      amount = parseFloat(data.data.amount)
    }

    return Response.json({
      status,
      message: data.data?.gateway_response || data.message || 'Payment processed',
      reference: reference || '',
      amount: amount
    })

  } catch (error) {
    // Add error logging
    console.error('Payment verification detailed error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return Response.json(
      {
        status: 'FAILED',
        message: error instanceof Error ? error.message : 'Failed to verify payment status',
        reference: '',
        amount: 0,
      },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
} 