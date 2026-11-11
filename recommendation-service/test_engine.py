import unittest

from engine import rank_liked_books, select_next_book


BOOKS = [
    {"id": 1, "title": "Yaoi Feel Good A", "categories": ["Yaoi"], "subcategories": ["Feel Good"]},
    {"id": 2, "title": "Yaoi Feel Good B", "categories": ["Yaoi"], "subcategories": ["Feel Good"]},
    {"id": 3, "title": "Yaoi Dark", "categories": ["Yaoi"], "subcategories": ["Dark"]},
    {"id": 4, "title": "Mystery Feel Good", "categories": ["Mystery"], "subcategories": ["Feel Good"]},
    {"id": 5, "title": "Horror Supernatural", "categories": ["Horror"], "subcategories": ["Supernatural"]},
]


class EngineTests(unittest.TestCase):
    def test_first_book_matches_selected_seed(self):
        result = select_next_book({
            "likes": [], "dislikes": [], "swiped": [], "pool": BOOKS,
            "selected_categories": ["Yaoi"], "selected_subcategories": ["Feel Good"],
        }, random_value=0.99)
        self.assertIn(result["book"]["id"], {1, 2})
        self.assertEqual(result["metadata"]["feature_mode"], "main_plus_subcategory")

    def test_swiped_book_never_repeats(self):
        result = select_next_book({
            "likes": [BOOKS[0]], "dislikes": [], "swiped": [BOOKS[0]], "pool": BOOKS,
            "selected_categories": ["Yaoi"], "selected_subcategories": ["Feel Good"],
        }, random_value=0.99)
        self.assertIsNotNone(result["book"])
        self.assertNotEqual(str(result["book"]["id"]), "1")

    def test_exploration_can_choose_outside_selected_main_categories(self):
        result = select_next_book({
            "likes": [BOOKS[0]], "dislikes": [], "swiped": [BOOKS[0]], "pool": BOOKS,
            "selected_categories": ["Yaoi"], "selected_subcategories": ["Feel Good"],
        }, random_value=0.0)
        self.assertIn(result["book"]["id"], {4, 5})
        self.assertEqual(result["metadata"]["selection_mode"], "exploration")

    def test_result_top3_contains_only_liked_books(self):
        payload = {
            "likes": [BOOKS[0], BOOKS[3], BOOKS[2]],
            "dislikes": [BOOKS[4]],
            "swiped": [BOOKS[0], BOOKS[3], BOOKS[2], BOOKS[4]],
            "pool": BOOKS,
            "selected_categories": ["Yaoi"],
            "selected_subcategories": ["Feel Good"],
        }
        result = rank_liked_books(payload)
        result_ids = {str(book["id"]) for book in result["recommendations"]}
        like_ids = {str(book["id"]) for book in payload["likes"]}
        self.assertLessEqual(result_ids, like_ids)
        self.assertEqual(len(result["recommendations"]), 3)
        self.assertEqual(str(result["discovery"]["id"]), "4")

    def test_no_candidates_returns_none(self):
        result = select_next_book({
            "likes": [BOOKS[0]], "dislikes": [], "swiped": BOOKS, "pool": BOOKS,
            "selected_categories": ["Yaoi"], "selected_subcategories": ["Feel Good"],
        })
        self.assertIsNone(result["book"])


if __name__ == "__main__":
    unittest.main()
