import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import useSubjects from "@/hooks/useSubjects";
import { CirclePlus, Plus } from "lucide-react";
import { use, useState } from "react";
import SearchInput from "./search-input/search-input";

export default function SearchSubjects() {
  const [search, setSearch] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, isError } = useSubjects(search);
  const { subjects, onAddSubject } = use(DashboardContext);

  const getBodyContent = () => {
    if (isLoading) {
      return <div>Loading.....</div>;
    }

    if (isError) {
      return <div>Something went wrong during searching</div>;
    }
    return (
      <div className="max-h-100 space-y-2 overflow-y-auto">
        {data.map((subject) => (
          <li
            key={subject.code}
            className="flex justify-between rounded-md border border-gray-500 p-1"
          >
            <div className="text-sm text-gray-900">
              <div>{subject.name}</div>
              <div className="text-xs text-gray-500">{subject.code}</div>
            </div>
            <div>
              <Button
                disabled={
                  subjects.findIndex((s) => s.code === subject.code) !== -1
                }
                className="h-8 w-8 cursor-pointer items-center rounded-full"
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <CirclePlus fill="#84cc16" size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-3xl">
        <DialogHeader>
          <DialogTitle>Search for subjects</DialogTitle>
        </DialogHeader>
        <div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const formElements = form.elements as typeof form.elements & {
                search: HTMLInputElement;
              };
              // clear search param
              setSearch(formElements.search.value);
            }}
          >
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
