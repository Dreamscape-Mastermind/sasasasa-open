import { NextRequest, NextResponse } from 'next/server'

import axios from 'axios'

import nodemailer from 'nodemailer'
import { record } from 'zod'

// Email template function
const emailTemplate = (email: string, full_name: string) => {
  return `
    <div>
      <h1>Thank you for joining the waitlist, ${email}!</h1>
      <p>We'll notify you as soon as we launch!</p>
    </div>
  `
}

// Define GraphQL query
const query = `
  mutation CreateLeadLiteEntry($full_name: String!, $email: String!, $consentTerms: Boolean) {
    createLead_liteRecord(data: { full_name: $full_name, email: $email, consentTerms: $consentTerms }) {
      id
      full_name
      email
      consentTerms
    }
  }
  `

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

  // Make sure the API token has access to the CMA, and is stored securely

  // console.log(record)

  const response = await fetch(`${process.env.NEXT_PUBLIC_SASASASA_API_URL}api/v1/accounts/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })

  const data = await response.json()

  // console.log(data)

  return NextResponse.json(data, { status: 200 })
  // try {
  //   // Create a new waitlist entry in your DatoCMS model (adjust field IDs accordingly)
  //   const response = await performRequest(query, {
  //     variables: {
  //       full_name,
  //       email,
  //       consentTerms,
  //     },
  //   })

  //   console.log(response)

  //   // Step 2: Send email
  //   // const transporter = nodemailer.createTransport({
  //   //   service: 'SendGrid',
  //   //   auth: {
  //   //     user: process.env.SENDGRID_USER,
  //   //     pass: process.env.SENDGRID_PASS,
  //   //   },
  //   // })

  //   // await transporter.sendMail({
  //   //   from: 'your-email@example.com',
  //   //   to: email,
  //   //   subject: 'Thanks for joining the waitlist!',
  //   //   html: emailTemplate(email, full_name),
  //   // })

  //   // Respond with success

  //   return NextResponse.json(response, { status: 200 })
  // } catch (error) {
  //   console.error('Error adding to waitlist:', error)
  //   return NextResponse.json(error, { status: 500 })
  // }
}
