from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .data import POLICIES, REQUESTS, TICKETS
from .agent import respond

app = FastAPI(title="Veridian IT Support AI Agent", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class ChatRequest(BaseModel):
    message: str

@app.get("/api/health")
def health():
    return {"status":"ok","agent":"veridian-grounded-agent"}

@app.get("/api/requests")
def requests():
    return REQUESTS

@app.get("/api/tickets")
def tickets():
    return TICKETS

@app.get("/api/policies")
def policies():
    return POLICIES

@app.post("/api/chat")
def chat(body: ChatRequest):
    return respond(body.message)

@app.post("/api/triage/{request_id}")
def triage(request_id: str):
    item = next((x for x in REQUESTS if x["id"] == request_id), None)
    if not item:
        return {"error":"Request not found"}
    result = respond(item["request"])
    return {"request": item, **result}
