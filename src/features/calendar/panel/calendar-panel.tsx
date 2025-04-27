import { Button } from "@/components/ui/button";
import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import { ArrowLeft, ArrowRight, Settings, Sparkles } from "lucide-react";
import { use } from "react";

export default function CalendarPanel() {
  const {
    swapping,
    onSuggest,
    suggestionsController,
    onNextSuggest,
    onPrevSuggest,
    onClearSelected,
    onAbortSwapping,
  } = use(DashboardContext);
  return (
    <div className="flex items-center border-b border-(--border) p-3">
      {swapping && (
        <Button className="cursor-pointer" onClick={() => onAbortSwapping()}>
          Abort selecting
        </Button>
      )}
      <div className="flex flex-1 items-center justify-end space-x-2">
        <Button variant={"outline"} onClick={() => onClearSelected()}>
          Reset
        </Button>
        {suggestionsController.allSuggestedBySem.length > 0 && (
          <>
            <Button
              onClick={() => onPrevSuggest()}
              disabled={!suggestionsController.hasPrev}
              variant={"outline"}
              size={"icon"}
              className="cursor-pointer rounded-full"
            >
              <ArrowLeft />
            </Button>
            <div>
              {suggestionsController.currentSuggestionIdx + 1} of{" "}
              {suggestionsController.allSuggestedBySem.length} Suggestions
            </div>

            <Button
              onClick={() => onNextSuggest()}
              disabled={!suggestionsController.hasNext}
              variant={"outline"}
              size={"icon"}
              className="cursor-pointer rounded-full"
            >
              <ArrowRight />
            </Button>
          </>
        )}
        <Button onClick={() => onSuggest()} className="cursor-pointer">
          {" "}
          <Sparkles />
          Suggest Timetable
        </Button>
        <Button className="cursor-pointer" size="icon">
          <Settings />
        </Button>
      </div>
    </div>
  );
}
