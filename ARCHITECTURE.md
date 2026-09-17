# Architecture

```text
                 ┌────────────────────────────┐
                 │       React + Vite UI      │
                 │ Dashboard / Chat / Queue   │
                 └─────────────┬──────────────┘
                               │ REST
                               ▼
                 ┌────────────────────────────┐
                 │        FastAPI API         │
                 │ /chat /requests /tickets  │
                 └─────────────┬──────────────┘
                               ▼
                 ┌────────────────────────────┐
                 │       Agent Service        │
                 │ 1. Intent classification   │
                 │ 2. Policy retrieval       │
                 │ 3. Grounded response      │
                 │ 4. Routing / risk         │
                 └─────────────┬──────────────┘
                               ▼
                 ┌────────────────────────────┐
                 │      Approved Data Pack    │
                 │ KB policies + requests +   │
                 │ existing ticket records    │
                 └────────────────────────────┘
```

The key design choice is **grounding before generation**: the agent retrieves policy evidence first and refuses to invent an approval workflow when the source data is insufficient.
