import { useCallback, useState } from "react";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface EventSearchProps {
  onSearch: (searchTerm: string) => void;
  className?: string;
}

export function EventSearch({ onSearch, className }: EventSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearch = useDebounce((value: string) => {
    onSearch(value);
  }, 300);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  return (
    <div className={className}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Input
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
