import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, data } = body

    // Add timestamp
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data,
      environment: process.env.NODE_ENV
    }

    // Log to your preferred logging service
    // Example using console.log for development
    if (process.env.NODE_ENV === 'development') {
      console.log('LOG:', logEntry)
    } else {
      // In production, you might want to use a logging service
      // Examples: Winston, Pino, CloudWatch, etc.
      // await logger.log(logEntry)
      console.log('LOG production:', logEntry)
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Logging error:', error)
    return NextResponse.json(
      { error: 'Failed to log event' },
      { status: 500 }
    )
  }
}
