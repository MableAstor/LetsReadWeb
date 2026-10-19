
import { useState } from "react";
import {
  BookOpen,
  Bookmark,
  ShoppingBag,
} from "lucide-react";

import WanttoRead from "../components/Wanttoread.jsx";
import WanttoBuy from "../components/WanttoBuy";
import Savebookfrom from "../components/Savebookfrom";

import {
  viralBooks,
  topBooks,
  savedBooks,
} from "../data/books";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const initialLibrary = {
  wantToRead: [...viralBooks],
  wantToBuy: savedBooks.slice(0, 2),

  savedBooks: [
    {
      book: savedBooks[2],
      review: {
        id: 1,
        username: "Emma",
        bookTitle: savedBooks[2].title,
        mainCategory: savedBooks[2].tags[0],
        subCategory: savedBooks[2].tags[1],
        rating: 5,
        reviewText:
          "This book was an amazing read! Highly recommended.",
      },
    },
    {
      book: savedBooks[3],
      review: {
        id: 2,
        username: "John Doe",
        bookTitle: savedBooks[3].title,
        mainCategory: savedBooks[3].tags[0],
        subCategory: savedBooks[3].tags[1],
        rating: 4,
        reviewText:
          "A lovely story with interesting characters.",
      },
    },
  ],
};

const tabs = [
  {
    value: "savedBooks",
    label: "Saved Books",
    icon: Bookmark,
  },
  {
    value: "wantToRead",
    label: "Want to Read",
    icon: BookOpen,
  },
  {
    value: "wantToBuy",
    label: "Want to Buy",
    icon: ShoppingBag,
  },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("savedBooks");
  const [library, setLibrary] = useState(initialLibrary);

  const sameBook = (a, b) => a.id === b.id;

  const moveBook = (book, targetTab) => {
    setLibrary((prev) => {
      const next = {
        wantToRead: prev.wantToRead.filter(
          (item) => !sameBook(item, book)
        ),
        wantToBuy: prev.wantToBuy.filter(
          (item) => !sameBook(item, book)
        ),
        savedBooks: prev.savedBooks.filter(
          (entry) => !sameBook(entry.book, book)
        ),
      };

      if (targetTab === "wantToBuy") {
        next.wantToBuy.push(book);
      }

      if (targetTab === "wantToRead") {
        next.wantToRead.push(book);
      }

      return next;
    });
  };

  const removeBook = (book) => {
    setLibrary((prev) => ({
      wantToRead: prev.wantToRead.filter(
        (item) => !sameBook(item, book)
      ),
      wantToBuy: prev.wantToBuy.filter(
        (item) => !sameBook(item, book)
      ),
      savedBooks: prev.savedBooks.filter(
        (entry) => !sameBook(entry.book, book)
      ),
    }));
  };

  const markAsRead = (book) => {
    console.log("Mark as Read:", book);
  };

  const currentItems = library[activeTab] ?? [];

  return (
    <main
      className="
        mx-auto w-full max-w-5xl
        min-w-0 px-3 pt-4
        pb-[calc(110px+env(safe-area-inset-bottom))]
        sm:px-5 sm:pt-6
        lg:pb-10
      "
    >
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Library
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            จัดการหนังสือที่คุณบันทึกไว้
          </p>
        </div>

        <Badge variant="secondary" className="rounded-full">
          {currentItems.length} Books
        </Badge>
      </div>

      {/* Tabs */}
      <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl bg-white/70 p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.value;

          return (
            <Button
              key={tab.value}
              type="button"
              variant="ghost"
              onClick={() => setActiveTab(tab.value)}
              aria-pressed={selected}
              className={`
                flex h-auto min-h-14 min-w-0
                flex-col gap-1 rounded-xl
                px-1 py-2 text-[10px]
                sm:min-h-12 sm:flex-row
                sm:px-3 sm:text-sm
                ${
                  selected
                    ? "bg-[#FAEFEB] text-[#A36D70]"
                    : "text-muted-foreground"
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-center">
                {tab.label}
              </span>
              <span>({library[tab.value].length})</span>
            </Button>
          );
        })}
      </div>

      {/* Book Grid */}
      {currentItems.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-white/70 p-6 text-center">
          <BookOpen className="h-9 w-9 text-muted-foreground" />

          <p className="text-sm font-semibold">
            ยังไม่มีหนังสือในหมวดนี้
          </p>
        </div>
      ) : (
        <div
          className="
            grid w-full min-w-0
            grid-cols-2 items-start
            gap-x-3 gap-y-6
            sm:grid-cols-3 sm:gap-4
            lg:grid-cols-4
            xl:grid-cols-5
          "
        >
          {activeTab === "savedBooks" &&
            library.savedBooks.map((entry) => (
              <Savebookfrom
                key={entry.book.id}
                book={entry.book}
                review={entry.review}
                onMoveToWantToBuy={(book) =>
                  moveBook(book, "wantToBuy")
                }
                onMarkAsRead={markAsRead}
                onRemove={removeBook}
              />
            ))}

          {activeTab === "wantToRead" &&
            library.wantToRead.map((book) => (
              <WanttoRead
                key={book.id}
                book={book}
                onMoveToWantToBuy={(item) =>
                  moveBook(item, "wantToBuy")
                }
                onMarkAsRead={markAsRead}
                onRemove={removeBook}
              />
            ))}

          {activeTab === "wantToBuy" &&
            library.wantToBuy.map((book) => (
              <WanttoBuy
                key={book.id}
                book={book}
              />
            ))}
        </div>
      )}
    </main>
  );
}
