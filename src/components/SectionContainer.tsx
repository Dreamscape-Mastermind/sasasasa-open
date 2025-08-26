import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function SectionContainer({ children }: Props) {
  return (
    <section className="mx-auto pt-20 sm:pt-0 px-4 sm:px-6 xl:max-w-6xl xl:px-0">
      {children}
    </section>
  );
}
