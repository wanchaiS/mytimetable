import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SearchInput from "@/components/ui/search-input";
import useSearchSubjects, { SubjectType } from "@/hooks/useSearchSubjects";
import { Plus, RefreshCcw } from "lucide-react";
import { useState } from "react";

export default function SearchSubjects({
  onOpenChange,
  onAddSubject,
  subjects,
  semester,
}: {
  onOpenChange: (open: boolean) => void;
  onAddSubject: (subject: SubjectType) => void;
  subjects: SubjectType[];
  semester: string;
}) {
  const [search, setSearch] = useState<string>("");
  const { data, isLoading, isError, refetch } = useSearchSubjects(
    search,
    semester,
  );

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formElements = form.elements as typeof form.elements & {
      search: HTMLInputElement;
    };
    setSearch(formElements.search.value);
  };

  const getBodyContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2 pt-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-full animate-pulse rounded bg-gray-200"
            />
          ))}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="flex flex-col items-center space-y-2 pt-2">
          <div className="text-destructive text-center">
            Something went wrong during searching.
          </div>
          <Button
            variant="outline"
            onClick={search ? () => refetch() : undefined}
          >
            Retry <RefreshCcw />
          </Button>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="text-muted-foreground py-4 text-center">
          No subjects found matching your search.
        </div>
      );
    }

    return (
      <div className="max-h-50 space-y-2 overflow-y-auto md:max-h-100">
        {data.map((subject) => (
          <li
            key={subject.code}
            className="flex items-center justify-between rounded-md border border-(--border) p-2"
          >
            <div className="text-sm text-gray-900">
              <div>{subject.name}</div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <div>{subject.callista_code}</div>
                <div className="text-xs text-gray-500">{subject.semester}</div>
              </div>
            </div>
            <div>
              <Button
                disabled={
                  subjects.findIndex((s) => s.code === subject.code) !== -1
                }
                className="h-6 w-6 cursor-pointer items-center rounded-full"
                size="icon"
                onClick={() => onAddSubject(subject)}
              >
                <Plus size={16} />
              </Button>
            </div>
          </li>
        ))}
      </div>
    );
  };
  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="w-3xl">
        <DialogHeader>
          <DialogTitle>Search for {semester} subjects</DialogTitle>
        </DialogHeader>
        <div>
          <form onSubmit={handleSearch}>
            <div className="flex space-x-2">
              <SearchInput
                id="search"
                placeholder="Search subjects"
                defaultValue={search}
                wrapperClassName="mb-2"
              />
              <Button type="submit">Search</Button>
            </div>
          </form>
          {getBodyContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
