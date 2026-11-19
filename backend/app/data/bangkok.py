from app.schemas.trips import Place

# Fixed demo records. Opening windows are illustrative, not live venue information.
_RECORDS = [
    ("siam", "Siam BTS Station", "สถานีบีทีเอสสยาม", "Pathum Wan", "ปทุมวัน", 13.74555, 100.53413, 15, 360, 1440, ()),
    ("palace", "The Grand Palace", "พระบรมมหาราชวัง", "Phra Nakhon", "พระนคร", 13.75008, 100.49246, 75, 510, 930, ()),
    ("pho", "Wat Pho", "วัดโพธิ์", "Phra Nakhon", "พระนคร", 13.74657, 100.49329, 50, 480, 1140, ()),
    ("arun", "Wat Arun", "วัดอรุณ", "Bangkok Yai", "บางกอกใหญ่", 13.74372, 100.48894, 45, 480, 1080, ()),
    ("jim", "Jim Thompson House", "พิพิธภัณฑ์บ้านจิม ทอมป์สัน", "Pathum Wan", "ปทุมวัน", 13.74930, 100.52837, 60, 600, 1080, ()),
    ("museum", "Bangkok National Museum", "พิพิธภัณฑสถานแห่งชาติ พระนคร", "Phra Nakhon", "พระนคร", 13.75720, 100.49228, 90, 540, 960, (0, 1)),
    ("park", "Lumphini Park", "สวนลุมพินี", "Pathum Wan", "ปทุมวัน", 13.73142, 100.54144, 45, 270, 1320, ()),
    ("market", "Chatuchak Weekend Market", "ตลาดนัดจตุจักร", "Chatuchak", "จตุจักร", 13.79991, 100.55019, 90, 540, 1080, (0, 1, 2, 3, 4)),
    ("icon", "ICONSIAM", "ไอคอนสยาม", "Khlong San", "คลองสาน", 13.72664, 100.51033, 60, 600, 1320, ()),
    ("chinatown", "Yaowarat Chinatown", "เยาวราช", "Samphanthawong", "สัมพันธวงศ์", 13.73978, 100.51018, 60, 0, 1440, ()),
]
PLACES = {
    row[0]: Place(**dict(zip(
        ("id", "name", "name_th", "district", "district_th", "lat", "lng", "suggested_duration"),
        row[:8],
    ))) for row in _RECORDS
}
HOURS = {row[0]: row[8:] for row in _RECORDS}

# Upper triangles keyed by fixture order. Each mode has independently authored
# point-to-point minutes, including local river connections where applicable.
_TRAVEL = {
    "car": [
        [27, 25, 35, 7, 28, 10, 26, 20, 17],
        [6, 16, 25, 6, 28, 33, 19, 12],
        [14, 23, 9, 25, 34, 17, 10],
        [32, 18, 33, 42, 18, 22],
        [25, 13, 25, 21, 14],
        [30, 35, 23, 15],
        [29, 18, 17],
        [37, 33],
        [15],
    ],
    "transit": [
        [31, 28, 36, 13, 39, 18, 25, 29, 22],
        [10, 16, 35, 14, 41, 52, 32, 19],
        [12, 33, 17, 34, 47, 28, 17],
        [40, 24, 41, 54, 33, 24],
        [38, 25, 30, 32, 22],
        [44, 54, 37, 23],
        [31, 28, 25],
        [42, 37],
        [24],
    ],
    "walk": [
        [67, 66, 88, 14, 70, 25, 102, 66, 43],
        [10, 20, 58, 13, 81, 123, 61, 33],
        [15, 55, 21, 77, 128, 55, 30],
        [79, 29, 95, 149, 62, 46],
        [59, 35, 106, 65, 33],
        [84, 123, 70, 42],
        [116, 59, 56],
        [147, 129],
        [33],
    ],
}

MATRICES = {}
for mode, rows in _TRAVEL.items():
    ids = list(PLACES)
    matrix = {(place_id, place_id): 0 for place_id in ids}
    for i, row in enumerate(rows):
        for j, minutes in enumerate(row, start=i + 1):
            matrix[ids[i], ids[j]] = matrix[ids[j], ids[i]] = minutes
    MATRICES[mode] = matrix
