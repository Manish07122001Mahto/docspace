import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type SearchBarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
};

export function SearchBar({ placeholder = 'Search', value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9 border-[1.5px] border-slate-300 hover:border-slate-400 transition-colors focus-visible:ring-1 focus-visible:ring-primary"
        placeholder={placeholder}
        type="search"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
