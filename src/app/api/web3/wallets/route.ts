import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_SASASASA_API_URL
    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Backend API URL not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${backendUrl}/api/v1/web3/wallets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: 'Backend request failed', details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Web3 wallets proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
