# TripFlow — Smart Travel Planner

Plan a day in Bangkok in English or Thai. Choose a fixed starting point, add destinations and visit durations, select a travel mode, and generate an itinerary with time estimates and a map.

## Run locally

Prerequisites are Python 3.11 or newer, Node.js 22.12 or newer, and npm. Installing packages requires access to PyPI and npm. The hero photo and OpenStreetMap tiles load from external servers.

From the project root, set up and start FastAPI:

```sh
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
cd backend
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

From the project root in a second terminal:

```sh
cp .env.example frontend/.env
cd frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:5173. Vite proxies `/api` to port 8000. Swagger UI is available at http://127.0.0.1:8000/docs. Start typing a place name in Thai or English, or focus the search field to browse the available Bangkok fixtures. For a quick Smart-mode check, start at Siam BTS Station on Monday, November 23, 2026 at 09:00 and add Jim Thompson House and Bangkok National Museum. The itinerary includes a wait until Jim Thompson House opens and a warning for the closed museum.

To run the backend tests and build the frontend from the root:

```sh
(cd backend && ../.venv/bin/python -m pytest -q)
(cd frontend && npm run build)
```

## API

- `GET /api/places/search?q=wat` returns bilingual place records. An empty query returns the demo catalog.
- `POST /api/trips/optimize` returns a fixed-start itinerary, total minutes, structured warnings for skipped Smart-mode stops, and optional route geometry.

Example request:

```json
{
  "mode": "smart",
  "transport": "car",
  "date": "2026-11-23",
  "start_time": "09:00",
  "start_place_id": "siam",
  "destinations": [
    {"place_id": "jim", "duration_minutes": 60},
    {"place_id": "museum", "duration_minutes": 90}
  ]
}
```

Travel options are `car`, `transit`, and `walk`. Times are Bangkok-local, with ISO 8601 timestamps in responses. Trip duration includes travel, waiting, and visits through departure from the last stop. Routes end at the last stop. The in-memory draft survives navigation between planner and result. Reloading resets the draft and result. The language preference is stored in the browser.

## How planning works

- **Fastest** uses nearest neighbor followed by 2-opt improvements. It includes all selected stops and estimates arrival times using travel and visit duration.
- **Smart** uses a deterministic beam search that favors more feasible visits, then earlier completion and less travel. It can arrive before opening and wait, and schedules visits within their opening windows on the selected date. Its bounded search can miss feasible orders.
- Bangkok locations, opening hours, and per-transport travel times are fixed fixtures. Coordinates position map markers. Travel minutes come from the matrix. The mock provider returns null route geometry, so Leaflet connects stops with a dashed reference line.

## Integrating a real provider

Implement `MapsProvider` in `backend/app/services/maps.py` and replace the FastAPI dependency in `backend/app/api/routes.py`. Adapt provider place IDs, bilingual display values, local opening windows, transport-specific matrix minutes, and optional geometry in `[latitude, longitude]` order. Keep API credentials server-side. A provider with unreachable legs or departure-time-dependent travel will also need corresponding matrix and algorithm updates.

For split hosting, set `VITE_API_BASE_URL` to the FastAPI origin before building, set `TRIPFLOW_CORS_ORIGINS` to the frontend origin in the backend shell, and configure the frontend host to serve `index.html` on SPA routes. For same-origin hosting, forward `/api` to FastAPI. For local proxy overrides set `VITE_PROXY_TARGET`. Use `VITE_TILE_URL` to configure the basemap and update the map attribution if changing tile providers.

Photo by SingyeDzong, [Wikimedia Commons (CC0)](https://commons.wikimedia.org/wiki/File:Wat_Arun_from_Chao_Phraya_River_at_sunset.jpg). Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). [OSM tile usage policy](https://operations.osmfoundation.org/policies/tiles/).
