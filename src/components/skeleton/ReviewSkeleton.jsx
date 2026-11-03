
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function ReviewSkeleton({ count = 3 }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={index}
          className="w-full overflow-hidden rounded-2xl border-[#F1D9D2] bg-white/90 shadow-sm"
        >
          <CardContent className="p-4 sm:p-5">
            {/* User information */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-full bg-[#F5E5E2]" />

              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-32 bg-[#F5E5E2]" />
                <Skeleton className="h-3 w-24 bg-[#F5E5E2]" />
              </div>

              <Skeleton className="h-8 w-8 rounded-full bg-[#F5E5E2]" />
            </div>

            {/* Review content */}
            <div className="mt-5 flex flex-col gap-3">
              <Skeleton className="h-5 w-3/4 bg-[#F5E5E2]" />
              <Skeleton className="h-4 w-full bg-[#F5E5E2]" />
              <Skeleton className="h-4 w-full bg-[#F5E5E2]" />
              <Skeleton className="h-4 w-2/3 bg-[#F5E5E2]" />
            </div>

            {/* Book image placeholder */}
            <Skeleton className="mt-4 h-44 w-full rounded-xl bg-[#F5E5E2] sm:h-52" />

            {/* Action buttons */}
            <div className="mt-5 flex items-center justify-between border-t border-[#F5E5E2] pt-4">
              <div className="flex gap-4">
                <Skeleton className="h-8 w-16 rounded-full bg-[#F5E5E2]" />
                <Skeleton className="h-8 w-16 rounded-full bg-[#F5E5E2]" />
              </div>

              <Skeleton className="h-8 w-8 rounded-full bg-[#F5E5E2]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
