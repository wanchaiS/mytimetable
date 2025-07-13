import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useSuggestions } from "@/pages/timetable-planner/hooks/useSuggestions";
import { Preference } from "@/pages/timetable-planner/types";
import { Expand, Minimize, Moon } from "lucide-react";

interface PreferenceOption {
  key: Preference;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PREFERENCES: PreferenceOption[] = [
  {
    key: "Compact",
    label: "Compact",
    description: "Classes scheduled close together",
    icon: <Minimize className="h-5 w-5 text-blue-600" />,
  },
  {
    key: "Relaxed",
    label: "Relaxed",
    description: "Classes evenly distributed",
    icon: <Expand className="h-5 w-5 text-blue-600" />,
  },
  {
    key: "Late",
    label: "Late study",
    description: "Classes in afternoon and evening",
    icon: <Moon className="h-5 w-5 text-blue-600" />,
  },
];

interface PreferenceSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuggestCompleted: () => void;
  initialPreference?: string;
}

export function PreferenceSettings({
  open,
  onOpenChange,
  onSuggestCompleted,
}: PreferenceSettingsProps) {
  const { handleSuggest } = useSuggestions();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-sm font-semibold">
            Suggestion Preferences
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {PREFERENCES.map((pref) => (
            <Card
              key={pref.key}
              className="flex cursor-pointer flex-row rounded-xl border p-4 transition-transform hover:scale-105"
              onClick={() => {
                handleSuggest(pref.key);
                onSuggestCompleted();
              }}
            >
              <div>{pref.icon}</div>
              <div>
                <span className={cn("block text-sm font-semibold")}>
                  {pref.label}
                </span>
                <span className="mt-1 block text-xs text-gray-500">
                  {pref.description}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
