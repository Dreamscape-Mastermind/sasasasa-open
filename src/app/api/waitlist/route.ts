import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, full_name, recaptchaToken } = await request.json()

  // // Validate email and reCAPTCHA
  if (!email || !recaptchaToken) {
    return NextResponse.json({ error: 'Email and reCAPTCHA token are required' }, { status: 400 })
  }

  // // Access the RECAPTCHA_SECRET_KEY from environment variables
  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ message: 'Missing reCAPTCHA secret key' }, { status: 500 })
  }

  // // Verify reCAPTCHA token
  const recaptchaRes = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${secretKey}&response=${recaptchaToken}`,
  })

  const recaptchaData = await recaptchaRes.json()

  if (!recaptchaData.success) {
    return NextResponse.json({ error: 'reCAPTCHA validation failed' }, { status: 400 })
  }

  // Set consentTerms to true if recaptchaToken is not empty
  const consentTerms = recaptchaToken ? true : false


  const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()

  return NextResponse.json(data, { status: 200 })
}
