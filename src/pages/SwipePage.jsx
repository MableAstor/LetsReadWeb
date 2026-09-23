import CategorySelector from "../components/CategorySelector";

export default function SwipePage() {
  return (
    
    <div className="p-4">
      <CategorySelector maxSelect={5} />
    </div>

  );
}