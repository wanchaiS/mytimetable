import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { WEEK_DAYS, WEEKEND_DAYS } from "@/pages/timetable-planner/constants";
import { useActionState, useCallback, useState } from "react";

interface TimeReserverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reservation: ReservationFormType) => void;
  days?: string[]; // Optional, for custom day lists
}

const DAYS = [...WEEK_DAYS, ...WEEKEND_DAYS];

interface ReservationFormType {
  label: string;
  days: string[];
  start: string;
  end: string;
}

export default function TimeReserverDialog({
  onOpenChange,
  onSubmit,
  days = DAYS,
}: TimeReserverDialogProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [multiSelectError, setMultiSelectError] = useState<string | null>(null);
  const handleSubmit = useCallback(
    (_: ReservationFormType, formData: FormData): ReservationFormType => {
      const label = formData.get("label") as string;
      const start = formData.get("start") as string;
      const end = formData.get("end") as string;

      // prevent submission if no days are selected
      if (selectedDays.length === 0) {
        setMultiSelectError("Please select at least one day");
        return { label, days: [], start, end };
      }

      onSubmit({ label, days: selectedDays, start, end });

      // reset multi select
      setMultiSelectError(null);
      setSelectedDays([]);
      // reset form
      return {
        label: "",
        days: [],
        start: "",
        end: "",
      };
    },
    [selectedDays, onSubmit],
  );

  const [state, formAction] = useActionState(handleSubmit, {
    label: "",
    days: selectedDays,
    start: "",
    end: "",
  });
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Reserve Time</DialogTitle>
            <DialogDescription>
              Reserve your time on your calendar.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label className="text-muted-foreground mb-1 text-sm">Label</Label>
            <Input
              type="text"
              name="label"
              className="w-full"
              required
              defaultValue={state.label}
            />
          </div>
          <div className="flex flex-1 flex-col">
            <Label className="text-muted-foreground mb-1 text-sm">Day</Label>
            <MultiSelect
              modalPopover={true}
              options={days.map((d) => ({
                label: d,
                value: d,
              }))}
              onValueChange={(value) => {
                setSelectedDays(value);
              }}
              placeholder="Select days"
            />
            {multiSelectError && (
              <p className="text-sm text-red-500">{multiSelectError}</p>
            )}
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex flex-1 flex-col">
              <Label className="text-muted-foreground mb-1 text-sm">
                Start Time
              </Label>
              <Input
                type="time"
                className="w-full"
                name="start"
                required
                defaultValue={state.start}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <Label className="text-muted-foreground mb-1 text-sm">
                End Time
              </Label>
              <Input
                type="time"
                className="w-full"
                name="end"
                required
                defaultValue={state.end}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Reserve</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
