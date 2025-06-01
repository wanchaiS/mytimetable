import { LogOut, User } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface UserProfileProps extends React.ComponentProps<"div"> {
  username?: string;
  onLogout?: () => void;
}

export function UserProfile({
  username = "User",
  onLogout,
  className,
  ...props
}: UserProfileProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            className="border-border bg-background hover:bg-accent relative size-10 rounded-full border"
            size="icon"
          >
            <div className="bg-muted flex size-8 items-center justify-center rounded-full">
              <User className="text-muted-foreground size-4" />
            </div>
            <span className="sr-only">Open user menu</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56" align="end">
          <div className="flex items-center gap-3 p-2">
            <div className="border-border bg-background flex size-10 items-center justify-center rounded-full border">
              <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                <User className="text-muted-foreground size-4" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{username}</span>
            </div>
          </div>
          <div className="p-1">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={onLogout}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
