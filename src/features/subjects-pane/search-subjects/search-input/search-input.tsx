import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

interface SearchInputProps extends React.ComponentProps<"input"> {
  wrapperClassName?: string;
}

export default function SearchInput({
  wrapperClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <div className="absolute top-1/2 left-1.5 -translate-y-1/2 transform">
        <Search size={18} className="text-muted-foreground" />
      </div>
      <Input className="pl-8" {...props} />
    </div>
  );
}
