import unittest

from app.algorithms.fastest import fastest_order
from app.algorithms.smart import smart_schedule


class AlgorithmTests(unittest.TestCase):
    def test_fastest_uses_two_opt_and_fixed_start(self):
        matrix = {
            ("s", "a"): 1, ("s", "b"): 2, ("s", "c"): 10,
            ("a", "b"): 2, ("a", "c"): 3, ("b", "c"): 20,
            ("b", "a"): 2, ("c", "a"): 3, ("c", "b"): 20,
        }
        self.assertEqual(fastest_order("s", ["a", "b", "c"], matrix), ["b", "a", "c"])

    def test_smart_considers_urgency_to_fit_both_visits(self):
        matrix = {("s", "a"): 10, ("s", "b"): 20, ("a", "b"): 20, ("b", "a"): 20}
        visits = smart_schedule("s", 0, {"a": 30, "b": 30}, {"a": [(0, 200)], "b": [(0, 55)]}, matrix)
        self.assertEqual([visit.place_id for visit in visits], ["b", "a"])

    def test_smart_skips_closed_destination_and_waits_for_second_window(self):
        matrix = {("s", "a"): 12, ("s", "b"): 20, ("a", "b"): 20, ("b", "a"): 20}
        visits = smart_schedule("s", 0, {"a": 30, "b": 30}, {"a": [(0, 35), (50, 85)], "b": []}, matrix)
        self.assertEqual(len(visits), 1)
        self.assertEqual((visits[0].arrival, visits[0].visit_start, visits[0].departure), (12, 50, 80))

    def test_smart_returns_no_visit_when_duration_exceeds_window(self):
        visits = smart_schedule("s", 0, {"a": 60}, {"a": [(15, 60)]}, {("s", "a"): 10})
        self.assertEqual(visits, ())
