# Veridian IT Support AI Agent

A polished full-stack prototype for **AIONOS Assignment  — Internal Service Agent (IT Support)**.

## What it does
- AI-style IT support chat with grounded policy retrieval
- Request triage for REQ-01 to REQ-15
- Existing ticket queue with active/closed states
- Automatic routing: IT / Security / Finance / Manager / Employee
- Risk-aware handling of phishing, access, software, VPN, mailbox, printer and hardware requests
- Policy/source panel showing exactly which KB rule supports an answer
- No external API is required to run the demo

## Tech stack
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** Python FastAPI + Pydantic
- **Data:** JSON seed data (easy to replace with PostgreSQL)
- **AI layer:** grounded intent classification + policy retrieval + response synthesis
- **Architecture:** React UI → FastAPI → Agent service → policy/request/ticket data

## Run locally

### 1. Backend
```bash
cd backend
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows:
# .venv\Scripts\activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (normally http://localhost:5173).

### Demo API
- `GET /api/health`
- `GET /api/requests`
- `GET /api/tickets`
- `GET /api/policies`
- `POST /api/chat`
- `POST /api/triage/{request_id}`

## Grounding rule
The assignment explicitly says to use only the supplied source data and not invent policies. This implementation therefore keeps the policy corpus in `backend/app/data.py` and every generated answer includes the relevant KB IDs. The app does not invent approval chains or SLAs beyond what the data pack states.

## Demo prompts
Try:
- "My account is locked after six password attempts."
- "My VPN credentials expired."
- "I received a phishing email."
- "My mailbox is full."
- "Can I get a monitor? I work from home 4 days a week."
- "I need a non-catalog software installation."
- "Can I get guest Wi-Fi for tomorrow?"
- "I need admin access to the finance reporting server."

## AIONOS reviewer flow
1. Open **Command Center** and inspect request/ticket metrics.
2. Open **AI Agent** and ask one of the prompts above.
3. Open **Requests** and click a request to see the grounded triage decision.
4. Open **Knowledge Base** to inspect source policies.
5. Use the API docs at `http://localhost:8000/docs` if desired.

## Production upgrade path
- PostgreSQL + SQLAlchemy
- Auth/RBAC
- OpenAI/Anthropic model behind a strict retrieval layer
- pgvector for semantic retrieval
- Audit logs
- Redis queue for human handoffs
- Docker/Kubernetes deployment

## Author
Oorjita Sharma
