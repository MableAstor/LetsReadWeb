import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Bell,
  Sparkles,
  Star,
  Bookmark,
  Compass,
  Heart,
  Layers3,
  LibraryBig,
  Trophy,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const categories = [
  "ทั้งหมด",
  "นิยายรัก",
  "แฟนตาซี",
  "สืบสวน",
  "พัฒนาตนเอง",
];

const books = [
  {
    id: 1,
    title: "เรื่องราวในวันวาน",
    author: "นักเขียนตัวอย่าง",
    category: "นิยายรัก",
    rating: "4.8",
    description: "เรื่องราวอบอุ่นที่อยากให้คุณได้อ่าน",
    cover: "from-[#E9D7F1] to-[#D8B8DF]",
    accent: "#76517F",
    symbol: "✿",
    tag: "อ่านแล้วใจฟู",
  },
  {
    id: 2,
    title: "จักรวาลอันเงียบงัน",
    author: "นักเขียนตัวอย่าง",
    category: "แฟนตาซี",
    rating: "4.7",
    description: "ออกเดินทางไปยังโลกที่ไม่เคยรู้จัก",
    cover: "from-[#DCEBDD] to-[#B8D6BE]",
    accent: "#456B50",
    symbol: "☾",
    tag: "โลกแห่งจินตนาการ",
  },
  {
    id: 3,
    title: "ความลับในหน้ากระดาษ",
    author: "นักเขียนตัวอย่าง",
    category: "สืบสวน",
    rating: "4.9",
    description: "ทุกเบาะแสซ่อนคำตอบเอาไว้",
    cover: "from-[#F4DDCF] to-[#E7BCA8]",
    accent: "#895442",
    symbol: "⌕",
    tag: "ชวนให้สงสัย",
  },
  {
    id: 4,
    title: "ค่อย ๆ เติบโต",
    author: "นักเขียนตัวอย่าง",
    category: "พัฒนาตนเอง",
    rating: "4.6",
    description: "พื้นที่เล็ก ๆ สำหรับการเรียนรู้ตัวเอง",
    cover: "from-[#F5EAC9] to-[#E9D49A]",
    accent: "#80672F",
    symbol: "☀",
    tag: "เติมพลังใจ",
  },
];

const navigation = [
  { label: "Discover", icon: Compass, path: "/preview-ui" },
  { label: "Feed", icon: Heart, path: "/feed" },
  { label: "Swipe", icon: Layers3, path: "/swipe" },
  { label: "Library", icon: LibraryBig, path: "/library" },
  { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
];

function BookCover({ book }) {
  return (
    <div
      className={`relative flex aspect-[3/4] flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${book.cover} p-4 text-center`}
      style={{ color: book.accent }}
    >
      <span className="mb-3 text-4xl">{book.symbol}</span>

      <div className="max-w-full text-balance font-serif text-lg font-semibold leading-snug">
        {book.title}
      </div>

      <div className="mt-3 text-xs opacity-80">
        A STORY TO REMEMBER
      </div>

      <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] tracking-widest opacity-70">
        LET'S READ
      </div>
    </div>
  );
}

function BookCard({ book }) {
  const [saved, setSaved] = useState(false);

  return (
    <Card className="group min-w-0 overflow-hidden rounded-2xl border-[#F0E4DF] bg-white py-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-3 sm:p-4">
        <div className="relative">
          <BookCover book={book} />

          <Button
            type="button"
            variant="secondary"
            size="icon"
            aria-label={saved ? "เลิกบันทึกหนังสือ" : "บันทึกหนังสือ"}
            aria-pressed={saved}
            onClick={() => setSaved((value) => !value)}
            className="absolute right-2 top-2 size-9 rounded-full bg-white/90 text-[#855D61] shadow-sm hover:bg-white"
          >
            <Bookmark
              className="size-4"
              fill={saved ? "currentColor" : "none"}
            />
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="truncate rounded-full bg-[#FAEFEB] px-2.5 py-1 text-xs text-[#A36D70]">
            {book.category}
          </span>

          <span className="flex shrink-0 items-center gap-1 text-xs text-[#886D52]">
            <Star className="size-3.5 fill-[#E8BC68] text-[#E8BC68]" />
            {book.rating}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-1 font-semibold text-[#533C3E]">
          {book.title}
        </h3>

        <p className="mt-1 text-xs text-[#9B8583]">
          {book.author}
        </p>

        <p className="mt-2 line-clamp-2 min-h-9 text-sm leading-relaxed text-[#816D6A]">
          {book.description}
        </p>

        <Button
          type="button"
          variant="outline"
          className="mt-3 h-9 w-full rounded-xl border-[#EEDDD7] text-[#855D61] hover:bg-[#FCF1ED]"
        >
          ดูรายละเอียด
          <ArrowRight className="ml-1 size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function PreviewUI() {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [query, setQuery] = useState("");

  const filteredBooks = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return books.filter((book) => {
      const matchesCategory =
        activeCategory === "ทั้งหมด" ||
        book.category === activeCategory;

      const matchesQuery =
        !keyword ||
        `${book.title} ${book.author} ${book.category}`
          .toLowerCase()
          .includes(keyword);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <div className="min-h-screen bg-[#FFFAF6] text-[#533C3E]">
      {/* Desktop navigation */}
      

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-5 sm:px-6 md:pb-12 md:pt-8 lg:px-10">
        {/* Mobile brand */}
        <div className="mb-5 flex items-center justify-between md:hidden">
          <Link
            to="/preview-ui"
            className="flex items-center gap-2"
          >
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#F6DDD6] text-[#87575B]">
              <BookOpen className="size-5" />
            </span>

            <span className="font-serif text-xl font-bold">
              let's read.
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label="การแจ้งเตือน"
            className="rounded-xl text-[#85676A]"
          >
            <Bell className="size-5" />
          </Button>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#F8E5DD] p-6 sm:p-9 md:p-12 lg:p-14">
          <div className="pointer-events-none absolute -right-10 -top-14 size-48 rounded-full bg-[#E9CFDF]/60 blur-2xl sm:size-64" />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E9CFC5] bg-white/60 px-3 py-1.5 text-xs font-medium text-[#956568]">
              <Sparkles className="size-3.5" />
              A LITTLE ESCAPE, EVERY DAY
            </span>

            <h1 className="mt-5 font-serif text-4xl font-semibold leading-tight tracking-tight text-[#603F42] sm:text-5xl lg:text-6xl">
              Find your next
              <br />
              <span className="italic text-[#A46E78]">
                favorite story.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#806260] sm:text-base">
              หนังสือดี ๆ อาจเปลี่ยนวันธรรมดาให้พิเศษขึ้น
              มาค้นหาเรื่องราวที่ตรงกับความรู้สึกของคุณกัน
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() =>
                  document
                    .getElementById("discover-books")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="h-11 rounded-xl bg-[#A76E76] px-5 text-white hover:bg-[#925B64]"
              >
                <Compass className="mr-2 size-4" />
                ค้นหาหนังสือ
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-[#E5C9C0] bg-white/60 px-5 text-[#81575A] hover:bg-white"
                onClick={() =>
                  document
                    .getElementById("discover-books")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                สำรวจหนังสือ
              </Button>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-[-35px] right-5 hidden w-48 rotate-6 sm:block lg:right-16 lg:w-56">
            <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl border-4 border-white/70 bg-gradient-to-br from-[#E5D4ED] to-[#C9ADD9] p-5 text-center text-[#765781] shadow-xl">
              <span className="text-5xl">✿</span>
              <span className="mt-3 font-serif text-2xl font-semibold">
                a world
                <br />
                of stories
              </span>
              <span className="mt-4 text-[10px] tracking-widest">
                LET'S READ
              </span>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="mt-7">
          <label
            htmlFor="book-search"
            className="mb-2 block text-sm font-medium text-[#765659]"
          >
            วันนี้อยากอ่านอะไรดี?
          </label>

          <div className="flex gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[#EFE1DB] bg-white px-4 shadow-sm transition focus-within:border-[#D9AFB1]">
              <Search className="size-5 shrink-0 text-[#B18B8A]" />

              <input
                id="book-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อหนังสือ ผู้เขียน หรือหมวดหมู่..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#B5A09C]"
              />
            </div>

            <Button
              variant="outline"
              size="icon"
              aria-label="ตัวกรอง"
              className="size-[50px] shrink-0 rounded-2xl border-[#EFE1DB] bg-white text-[#926D70]"
            >
              <SlidersHorizontal className="size-5" />
            </Button>
          </div>
        </section>

        {/* Discover books */}
        <section id="discover-books" className="mt-9 scroll-mt-28">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium tracking-widest text-[#B08383]">
                YOUR READING CORNER
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold sm:text-3xl">
                หนังสือที่อยากชวนให้อ่าน
              </h2>
              <p className="mt-2 text-sm text-[#9B8583]">
                เลือกเรื่องที่ใช่ แล้วออกเดินทางไปด้วยกัน
              </p>
            </div>

            <span className="text-sm text-[#A77B7D]">
              {filteredBooks.length} เล่ม
            </span>
          </div>

          {/* Categories */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const active = activeCategory === category;

              return (
                <Button
                  key={category}
                  type="button"
                  variant={active ? "default" : "outline"}
                  onClick={() => setActiveCategory(category)}
                  className={`h-9 shrink-0 rounded-full px-4 ${
                    active
                      ? "border-[#A76E76] bg-[#A76E76] text-white hover:bg-[#925B64]"
                      : "border-[#EBDDD7] bg-white text-[#967777] hover:bg-[#FAEFEB]"
                  }`}
                >
                  {category}
                </Button>
              );
            })}
          </div>

          {/* Book grid */}
          {filteredBooks.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-[#EBDDD7] bg-white p-10 text-center">
              <Search className="mx-auto size-8 text-[#C5A4A0]" />
              <p className="mt-3 font-medium">
                ยังไม่พบหนังสือที่ค้นหา
              </p>
              <p className="mt-1 text-sm text-[#9B8583]">
                ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นนะ
              </p>
              <Button
                variant="outline"
                className="mt-4 rounded-xl"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("ทั้งหมด");
                }}
              >
                ล้างตัวกรอง
              </Button>
            </div>
          )}
        </section>

        {/* Inspiration banner */}
        <section className="mt-10 rounded-3xl border border-[#F0E1DC] bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#F7E5E0] text-[#A46E78]">
              <Heart className="size-6" />
            </div>

            <div className="flex-1">
              <h2 className="font-serif text-xl font-semibold">
                ทุกรีวิวมีเรื่องราว
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#947D7A]">
                แบ่งปันความรู้สึกหลังอ่านจบ และช่วยให้ใครสักคนค้นพบหนังสือเล่มโปรด
              </p>
            </div>

            <Link to="/feed">
              <Button
                variant="outline"
                className="w-full rounded-xl border-[#EBD8D3] text-[#95676B] hover:bg-[#FCF1ED] sm:w-auto"
              >
                สำรวจ Feed
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-[#B29A95]">
          Made for book lovers · Let's Read Preview
        </footer>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#F0E4DF] bg-[#FFFAF6]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = item.path === "/preview-ui";

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] transition-colors ${
                  active
                    ? "font-semibold text-[#A76E76]"
                    : "text-[#A58D89] hover:text-[#855D61]"
                }`}
              >
                <span
                  className={`flex size-8 items-center justify-center rounded-xl ${
                    active ? "bg-[#F6E1DC]" : ""
                  }`}
                >
                  <Icon className="size-[19px]" />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
