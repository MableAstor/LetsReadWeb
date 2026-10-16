
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";

export default function ReviewInput({ onClick }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-xl border bg-card p-3 shadow-sm">

      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-pink-100 text-pink-600">
          J
        </AvatarFallback>
      </Avatar>

      <button
        type="button"
        onClick={onClick}
        className="flex h-10 min-w-0 flex-1 items-center rounded-full border bg-muted/50 px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Write a review...
      </button>

    </div>
  );
}
