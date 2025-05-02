import Link from './Link'
import SocialIcon from './social-icons'
import siteMetadata from '@/data/siteMetadata'

export default function Footer() {
  return (
    <footer className="dark:bg-gray-950 ">
      <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left text-sm text-gray-400">
          <div>&copy; {new Date().getFullYear()} {siteMetadata.title}. All rights reserved.</div>
          <div>Made by <a href="https://dreamscapemastermind.com" className="text-gray-400 hover:text-gray-300">Dreamscape Mastermind</a></div>
        </div>
        
        <div className="flex justify-center space-x-6 mt-4 md:mt-0">
          <Link href="/privacy" className="text-gray-400 hover:text-gray-300 text-sm">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-gray-300 text-sm">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  )
}
