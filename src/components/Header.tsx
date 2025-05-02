"use client";

import { Button } from "./ui/button";
import Image from "next/image";
import Link from "./Link";
import MobileNav from "./MobileNav";
import { ShoppingCart } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";
import headerNavLinks from "@/lib/headerNavLinks";
import siteMetadata from "@/config/siteMetadata";
import { useSidebar } from "@/components/providers/SidebarContext";

const Header = () => {
  const headerClass =
    "fixed top-0 left-0 right-0 flex items-center w-full bg-background justify-between py-6 px-4 md:px-8 z-50 border-b";

  const { openSidebar } = useSidebar();

  return (
    <>
      <header className={headerClass}>
        <Link href="/" aria-label={siteMetadata.headerTitle}>
          <div className="flex items-center">
            <Image
              src="/images/sasasasaLogo.png"
              alt={siteMetadata.headerTitle}
              width={30}
              height={30}
              className="h-auto w-auto mr-3"
            />
            {typeof siteMetadata.headerTitle === "string" ? (
              <div className="hidden text-xl font-semibold sm:block text-foreground">
                {siteMetadata.headerTitle}
              </div>
            ) : (
              siteMetadata.headerTitle
            )}
          </div>
        </Link>
        <div className="flex items-center space-x-3 sm:space-x-4 leading-5">
          <nav className="hidden sm:flex items-center space-x-4 md:space-x-6">
            {headerNavLinks
              .filter((link) => link.href !== "/")
              .map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="font-medium text-foreground hover:text-primary transition-colors"
                >
                  {link.title}
                </Link>
              ))}
          </nav>
          <ThemeSwitch />
          <MobileNav />
        </div>
      </header>
      <div className="h-[96px]" />
    </>
  );
};

export default Header;
