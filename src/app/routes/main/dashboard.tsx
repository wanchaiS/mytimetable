import DashboardProvider from "@/contexts/dashboard/dashboard-provider";
import SubjectsPane from "@/features/subjects-pane/subjects-pane2";

export default function Dashboard() {
  return (
    <DashboardProvider>
      <SubjectsPane />
      {/* <div>
        <div className="space-x-4 p-4">
          <span>Preference</span>
          <select
            name="preference"
            id="preference"
            value={preference}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setPreference(e.target.value as Preference)
            }
          >
            <option value="Late">Late</option>
            <option value="Morning">Morning</option>
          </select>
          <Button onClick={() => handleSuggest()}>Suggest</Button>
          <Button
            onClick={handlePrevSuggest}
            disabled={suggestions.currentSuggestionIdx === 0}
          >
            Prev Suggestion
          </Button>
          <Button
            onClick={handleNextSuggest}
            disabled={
              suggestions.currentSuggestionIdx >= suggestions.all.length - 1
            }
          >
            Next Suggestion
          </Button>
        </div> */}
      {/* <Calendar/> */}
    </DashboardProvider>
  );
}
