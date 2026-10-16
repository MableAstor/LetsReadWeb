
import { Heart, Share2, Bookmark, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./ui/card";

import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export default function ReviewCard() {
  return (
    <Card className="mx-auto w-full max-w-2xl gap-0 rounded-xl border-border bg-card py-0 shadow-sm">

      {/* Profile */}
      <CardHeader className="flex flex-row items-center gap-3 px-4 py-3">
        <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-pink-100 text-pink-600">
          J
        </AvatarFallback>
      </Avatar>

        <span className="min-w-0 truncate text-sm font-semibold sm:text-base">
          Jxneny Eiei
        </span>
      </CardHeader>

      {/* Review content */}
      <CardContent className="px-3 pb-3 sm:px-4">
        <div className="min-w-0 space-y-3 rounded-lg border border-border p-3 sm:p-4">

          {/* Book title and rating */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="min-w-0 break-words text-sm font-semibold sm:text-base">
              Book Title
            </h3>

            <div
              className="flex shrink-0 items-center gap-0.5"
              aria-label="5 out of 5 stars"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400 sm:h-5 sm:w-5"
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 font-normal">
              Fantasy
            </Badge>

            <Badge variant="outline" className="rounded-full px-3 py-1 font-normal">
              Adventure
            </Badge>
          </div>

          {/* Review text */}
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
            This book was an amazing read! The characters
            were well-developed and the plot kept me hooked
            from start to finish. Highly recommend to anyone
            who loves fantasy and adventure!
          </p>
        </div>
      </CardContent>

      {/* Actions */}
      <CardFooter className="flex items-center justify-around gap-2 border-t px-3 py-2 sm:justify-start sm:gap-4 sm:px-4">

        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="gap-1.5 px-2 text-muted-foreground hover:text-pink-500"
        >
          <Heart className="h-4 w-4" />
          <span>Like</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="gap-1.5 px-2 text-muted-foreground hover:text-pink-500"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="gap-1.5 px-2 text-muted-foreground hover:text-pink-500"
        >
          <Bookmark className="h-4 w-4" />
          <span>Save</span>
        </Button>

      </CardFooter>
    </Card>
  );
}
