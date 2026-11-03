
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

const getBookTitle = (book) =>
  book?.title || book?.Books_Title || book?.Books_title || "ไม่ระบุชื่อหนังสือ";

const getBookImage = (book) =>
  book?.image ||
  book?.cover ||
  book?.Books_Cover ||
  book?.image_url ||
  "";

  const getBookCategory = (book) =>
  book?.category ||
  book?.main_category ||
  book?.Main_Category ||
  "";

const getBookSubcategory = (book) => {
  const value =
    book?.subCategory ||
    book?.subcategory ||
    book?.sub_category ||
    book?.Sub_Category ||
    [];

  const items = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[•,]/)
      : [];

  return [...new Set(
    items.map((item) => String(item).trim()).filter(Boolean)
  )];
};

export default function ResultBookCard({ book, rank, showDetails = true }) {
  const title = getBookTitle(book);
  const image = getBookImage(book);
  const category = getBookCategory(book);
const subcategory = getBookSubcategory(book);

  const rankLabel = {
    1: "TOP 1",
    2: "TOP 2",
    3: "TOP 3",
  };

  return (
    <Card className="group min-w-0 gap-0 overflow-hidden rounded-2xl border border-[#eee5dc] bg-white py-0 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f3eee8]">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[#b6a99d]">
            <span className="text-4xl">📖</span>
            <span className="text-xs">ไม่มีรูปปก</span>
          </div>
        )}

        {rank && (
          <Badge className="absolute left-2 top-2 rounded-full border-0 bg-[#f4e4df] px-3 py-1 text-[10px] font-semibold text-[#875e59] shadow-sm hover:bg-[#f4e4df]">
            {rankLabel[rank] || `TOP ${rank}`}
          </Badge>
        )}
      </div>

      <CardContent className="min-w-0 space-y-2 px-3 py-3 sm:px-4 sm:py-4">
        <h3
          className="line-clamp-2 min-h-[2.5em] break-words text-xs font-semibold leading-snug text-[#403b37] sm:text-sm"
          title={title}
        >
          {title}
        </h3>

        {showDetails && (
          <>
            {(category || subcategory.length > 0) && (
                <div className="flex min-w-0 flex-wrap items-center gap-1">
  {category && (
    <Badge className="h-auto shrink-0 rounded-full border-0 bg-[#f3e3dc] px-2 py-0.5 text-[9px] font-medium leading-normal text-[#9b6f65]">
      {category}
    </Badge>
  )}

  {subcategory.map((item, index) => (
    <Badge
      key={`${item}-${index}`}
      className="h-auto shrink-0 rounded-full border-0 bg-[#f4eee8] px-2 py-0.5 text-[9px] font-medium leading-normal text-[#99877b]"
    >
      {item}
    </Badge>
  ))}
</div>
)}

            {book?.author && (
              <p className="truncate text-[10px] text-[#b0a49a] sm:text-xs">
                ผู้แต่ง: {book.author}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
