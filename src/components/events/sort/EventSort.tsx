import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EventSortProps {
  onSort: (ordering: string) => void;
  className?: string;
}

const sortOptions = [
  { value: "start_date", label: "Date (Earliest)" },
  { value: "-start_date", label: "Date (Latest)" },
  { value: "title", label: "Title (A-Z)" },
  { value: "-title", label: "Title (Z-A)" },
  { value: "created_at", label: "Recently Added" },
];

export function EventSort({ onSort, className }: EventSortProps) {
  return (
    <Select onValueChange={onSort} defaultValue="start_date">
      <SelectTrigger className={className}>
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
