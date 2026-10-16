
import { Link } from "react-router-dom";
import { BookCard } from "../components/BookCard";
import { topBooks } from "../data/books";

export default function Top100Page() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-screen-2xl px-3 py-6 pb-28">
      <div className="mb-6">
        <Link
          to="/"
          className="mb-3 inline-block text-sm text-[#C65B61] hover:underline"
        >
          ← กลับหน้าหลัก
        </Link>

        <h1 className="text-2xl font-bold text-[#533C3E]">
          หนังสือ Top 100
        </h1>

        <p className="mt-1 text-sm text-[#9B8583]">
          รวมหนังสือในอันดับยอดนิยม
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-7">
        {topBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {topBooks.length === 0 && (
        <p className="py-10 text-center text-[#9B8583]">
          ยังไม่มีหนังสือในหมวดนี้
        </p>
      )}
    </main>
  );
}
