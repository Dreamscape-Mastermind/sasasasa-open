import React, { type ReactElement } from 'react'
import { BackgroundBeams } from './ui/background-beams' 
import { Annonce } from './ui/Annonce'

import { WaitlistForm } from './forms/waitlist-form'

// Hero component

export default function Hero(): ReactElement {
  return (
    <div>
      <div className="flex h-[40rem] w-full flex-col items-center justify-center rounded-md antialiased">
        <BackgroundBeams />
        <div className="mx-auto max-w-2xl p-4">
          <div className="flex items-center justify-center p-2">
            {/* <Annonce /> */}
          </div>
          <div className="text-center">
            <h1 className=" font-sans text-xl  font-bold md:text-7xl">SASASASA</h1>
            <h3 className="text-2xl font-bold sm:text-4xl">
              Be the first to access the best events and experiences 🎟️ 
            </h3>
            <p className="mt-4">
              Sign up for exclusive early access and snag discounts and offers!  Get it now now  😉
            </p>
          </div>
          <div className="flex-col items-center justify-center pt-4">
            <WaitlistForm />
          </div>
          <p className="mt-4 text-center text-sm">
            {' '}
            We respect your privacy. No spam, just vibes and essential updates ✉️
          </p>
        </div>
      </div>
    </div>
  )
}
