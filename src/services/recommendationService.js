// เรียก Recommendation API เพื่อเลือกหนังสือเล่มถัดไป
export const getNextBook = async ({
  apiBase,
  likes,
  dislikes,
  swiped,
  pool,
  selectedCategories,
  selectedSubcategories,
}) => {
  const response = await fetch(`${apiBase}/next-book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      likes,
      dislikes,
      swiped,
      pool,
      selected_categories: selectedCategories,
      selected_subcategories: selectedSubcategories,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Recommendation API Error: ${errorText}`);
  }

  return response.json();
};