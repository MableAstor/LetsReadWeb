
import { ExternalLink, Store } from "lucide-react";

import NaiinLogo from "../assets/Naiin-logo.png";
import MebLogo from "../assets/meb-logo.png";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

const stores = [
  {
    id: "naiin",
    name: "Naiin",
    image: NaiinLogo,
    price: 474.05,
  },
  {
    id: "meb",
    name: "Meb",
    image: MebLogo,
    price: 479.0,
  },
];

export default function BookStoreModel({
  open = false,
  onClose,
  onSelectStore,
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose?.();
      }}
    >
      <DialogContent
        className="
          !w-[calc(100vw-2rem)]
          !max-w-lg
          max-h-[85dvh]
          overflow-y-auto
          rounded-2xl
          p-4
          sm:rounded-3xl
          sm:p-6
        "
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-2 text-base font-bold sm:text-lg">
            <Store className="h-5 w-5 text-[#1D77FF]" />
            Book Store Available
          </DialogTitle>

          <DialogDescription className="text-xs sm:text-sm">
            ร้านหนังสือที่มีจำหน่าย
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col gap-3">
          {stores.map((store) => (
            <Card
              key={store.id}
              className="
                gap-0 rounded-xl
                border border-border
                bg-card py-0
                shadow-none
                transition-colors
                hover:bg-muted/40
              "
            >
              <CardContent
                className="
                  flex min-w-0
                  items-center gap-3
                  p-3
                  sm:gap-4 sm:p-4
                "
              >
                {/* Store Logo */}
                <div
                  className="
                    flex h-14 w-14 shrink-0
                    items-center justify-center
                    overflow-hidden rounded-xl
                    bg-white
                    sm:h-16 sm:w-16
                  "
                >
                  <img
                    src={store.image}
                    alt={`${store.name} logo`}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Store information */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold sm:text-base">
                    {store.name}
                  </h3>

                  <p className="mt-1 text-[11px] text-muted-foreground">
                    ราคา
                  </p>

                  <p className="text-sm font-bold text-emerald-600 sm:text-base">
                    ฿{store.price.toFixed(2)}
                  </p>
                </div>

                {/* Store action */}
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  disabled={!onSelectStore}
                  onClick={() =>
                    onSelectStore?.(store)
                  }
                  aria-label={`เปิดร้าน ${store.name}`}
                  className="
                    h-8 w-8 shrink-0
                    rounded-full
                    sm:h-9 sm:w-9
                  "
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
