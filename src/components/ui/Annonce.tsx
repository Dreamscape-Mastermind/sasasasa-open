export interface AnnonceProps {
  className?: string
}

export const Annonce: React.FC<AnnonceProps> = ({ className, ...props }) => (
  <div className="[&amp;>span]:rounded-full text-primary group flex w-fit items-center gap-3 rounded-full border py-1.5 pl-1.5 pr-5">
    <span className="block rounded-full bg-primary-600 px-2 py-0.5 text-xs text-white">
      Waitlist
    </span>
    <p className="text-sm">Limited slots available</p>
  </div>
)
