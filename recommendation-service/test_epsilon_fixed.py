import unittest
from engine import select_next_book

class TestEpsilonGreedy(unittest.TestCase):
    def setUp(self):
        self.payload = {
            'preferences': [], 'swiped': [],
            'selected_categories': ['Romance'],
            'selected_subcategories': ['Adventure'],
            'pool': [
                {'id': 1, 'categories': ['Romance'], 'subcategories': ['Adventure']},
                {'id': 2, 'categories': ['Fantasy'], 'subcategories': ['Adventure']},
            ],
        }
    def test_explore(self):
        result = select_next_book(self.payload, random_value=0.1)
        self.assertEqual(result['book']['id'], 2)
        self.assertEqual(result['metadata']['selection_mode'], 'exploration')
    def test_exploit(self):
        result = select_next_book(self.payload, random_value=0.9)
        self.assertEqual(result['book']['id'], 1)
    def test_rate(self):
        count = sum(select_next_book(self.payload, random_value=i/1000)['metadata']['exploration_selected'] for i in range(1000))
        self.assertEqual(count, 200)
    def test_fallback_without_eligible_exploration(self):
        self.payload['pool'][1]['subcategories'] = ['Mystery']
        result = select_next_book(self.payload, random_value=0.1)
        self.assertEqual(result['book']['id'], 1)
        self.assertFalse(result['metadata']['exploration_selected'])

if __name__ == '__main__': unittest.main()
