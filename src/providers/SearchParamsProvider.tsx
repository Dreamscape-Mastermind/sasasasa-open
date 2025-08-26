"use client";

import { Suspense, createContext, useContext } from "react";

import { ReadonlyURLSearchParams } from "next/navigation";
import { useSearchParams } from "next/navigation";

interface SearchParamsContextType {
  searchParams: ReadonlyURLSearchParams;
}

const SearchParamsContext = createContext<SearchParamsContextType | undefined>(
  undefined
);

function SearchParamsContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  return (
    <SearchParamsContext.Provider value={{ searchParams }}>
      {children}
    </SearchParamsContext.Provider>
  );
}

export function SearchParamsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SearchParamsContent>{children}</SearchParamsContent>
    </Suspense>
  );
}

export function useSearchParamsContext() {
  const context = useContext(SearchParamsContext);
  if (context === undefined) {
    throw new Error(
      "useSearchParamsContext must be used within a SearchParamsProvider"
    );
  }
  return context;
}
