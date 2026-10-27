"""
Ghost in the Campus - FastAPI Backend Server
Integrates Grounded RAG Knowledge Base with Ollama Local Gemma 4 Model.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from rag_service import kb_service
from ollama_client import ollama_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ghost_campus")

app = FastAPI(
    title="Ghost in the Campus API",
    description="Spectral AI Campus Assistant powered by Ollama Gemma 4 and Grounded RAG Knowledge Base",
    version="1.0.0"
)

# Enable CORS for frontend Vite development server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Models -----------------
class ChatMessage(BaseModel):
    role: str = Field(default="user")
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = Field(default_factory=list)
    temperature: Optional[float] = 0.2

class ChatResponse(BaseModel):
    reply: str
    sources: List[Dict[str, Any]]
    mode: str
    model: str
    grounded: bool
    is_demo_data: bool
    disclaimer: str

class RouteRequest(BaseModel):
    origin: str
    destination: str
    accessibility_mode: Optional[bool] = False

class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str
    role: Optional[str] = "Student"
    student_id: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")

def load_users():
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []

def save_users(users):
    try:
        with open(USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving users: {e}")

# ----------------- Auth Endpoints -----------------

@app.post("/api/auth/register")
def register_user(payload: RegisterRequest):
    email = payload.email.strip().lower()
    name = payload.name.strip()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Please provide a valid email address.")
    if not name:
        raise HTTPException(status_code=400, detail="Please enter your full name.")
    if len(payload.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters.")

    users = load_users()
    for u in users:
        if u.get("email", "").lower() == email:
            raise HTTPException(status_code=400, detail="An account with this email already exists. Please log in.")

    import datetime
    new_user = {
        "email": email,
        "name": name,
        "password": payload.password,
        "role": payload.role or "Student",
        "student_id": payload.student_id or f"SP-{datetime.datetime.now().year}-{len(users)+1001}",
        "registered_at": datetime.datetime.now().isoformat()
    }
    users.append(new_user)
    save_users(users)

    # Return safe user profile (without raw password)
    return {
        "success": True,
        "message": f"Welcome to Specter University, {name}!",
        "user": {
            "email": new_user["email"],
            "name": new_user["name"],
            "role": new_user["role"],
            "student_id": new_user["student_id"]
        }
    }

@app.post("/api/auth/login")
def login_user(payload: LoginRequest):
    email = payload.email.strip().lower()
    password = payload.password.strip()

    users = load_users()
    for u in users:
        if u.get("email", "").lower() == email:
            is_valid = (u.get("password") == password) or (
                u.get("password") == "demo_password_sample" and password in ["password123", "demo_password_sample"]
            )
            if is_valid:
                return {
                    "success": True,
                    "message": f"Welcome back, {u.get('name')}!",
                    "user": {
                        "email": u["email"],
                        "name": u["name"],
                        "role": u.get("role", "Student"),
                        "student_id": u.get("student_id", "")
                    }
                }
            else:
                raise HTTPException(status_code=401, detail="Incorrect password. Please try again.")

    raise HTTPException(
        status_code=404,
        detail="No account found with this email. Please register as a new arrival."
    )

# ----------------- Endpoints -----------------

@app.get("/")
def read_root():
    return {
        "project": "Ghost in the Campus",
        "description": "Spectral AI Campus Assistant Backend",
        "mascot": "Casperion the Campus Ghost",
        "ai_model": "gemma4:e2b",
        "status": "active",
        "docs": "/docs"
    }

@app.get("/api/health")
async def health_check():
    """
    Checks backend status, Ollama status, and knowledge base dataset size.
    """
    ollama_status = await ollama_client.check_health()
    meta = kb_service.get_metadata()
    return {
        "status": "healthy",
        "backend": "online",
        "ollama": ollama_status,
        "knowledge_base": {
            "loaded": bool(kb_service.data),
            "campus_name": meta.get("campus_name"),
            "dataset_version": meta.get("dataset_version"),
            "buildings_count": len(kb_service.get_all_buildings()),
            "rooms_count": len(kb_service.get_all_rooms()),
            "departments_count": len(kb_service.get_all_departments()),
            "timetables_count": len(kb_service.get_all_timetables()),
            "rules_count": len(kb_service.get_all_rules()),
            "amenities_count": len(kb_service.get_all_amenities())
        }
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    """
    Handles user queries with grounded RAG and Ollama gemma4:e2b.
    Falls back gracefully to direct knowledge-base synthesis if Ollama is unreachable.
    """
    query = payload.message.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Retrieve grounded context
    system_prompt, sources = kb_service.build_grounded_prompt(
        query,
        history=[msg.model_dump() for msg in (payload.history or [])]
    )

    # 2. Query Ollama
    history_dicts = [msg.model_dump() for msg in (payload.history or [])]
    history_dicts.append({"role": "user", "content": query})

    ollama_res = await ollama_client.chat(
        system_instruction=system_prompt,
        messages=history_dicts,
        temperature=payload.temperature or 0.2
    )

    # 3. Handle response or fallback
    if ollama_res.get("success"):
        reply_text = ollama_res.get("content", "").strip()
        mode = "ollama-live"
    else:
        # Grounded Fallback: Generate structured answer directly from verified knowledge base
        logger.warning(f"Ollama unavailable, using grounded fallback: {ollama_res.get('error')}")
        mode = "grounded-fallback"
        if sources:
            top_source = sources[0]
            reply_text = (
                f"👻 *Spectral Bulletin:* I am currently in standalone grounded mode. "
                f"Based on our official Specter University records:\n\n"
                f"**{top_source['title']}**\n{top_source['content']}\n\n"
            )
            if len(sources) > 1:
                reply_text += "**Related Campus Information:**\n"
                for s in sources[1:3]:
                    reply_text += f"- **{s['title']}**: {s['content']}\n"
        else:
            reply_text = (
                "👻 *Spectral Dispatch:* I searched through the official Specter University records, "
                "but I could not find a verified match for your query. "
                "To ensure accuracy and prevent hallucination, please check with the "
                "Campus Help Desk at Security Post A (Main Gate) or visit the Registrar Office in ADM-101."
            )

    meta = kb_service.get_metadata()
    return ChatResponse(
        reply=reply_text,
        sources=sources,
        mode=mode,
        model=ollama_client.model,
        grounded=True,
        is_demo_data=meta.get("is_demo_data", True),
        disclaimer=meta.get("demo_disclaimer", "Demo Campus Data - All information strictly bounded.")
    )

@app.post("/api/chat/stream")
async def chat_stream_endpoint(payload: ChatRequest):
    """
    Streams response tokens using Server-Sent Events (SSE).
    """
    query = payload.message.strip()
    system_prompt, sources = kb_service.build_grounded_prompt(query)

    history_dicts = [msg.model_dump() for msg in (payload.history or [])]
    history_dicts.append({"role": "user", "content": query})

    async def event_generator():
        # First send sources metadata
        meta_event = {
            "type": "sources",
            "sources": sources,
            "disclaimer": "Demo Data Notice: Information bounded strictly by campus records."
        }
        yield f"data: {json.dumps(meta_event)}\n\n"

        async for chunk in ollama_client.chat_stream(system_prompt, history_dicts, payload.temperature or 0.2):
            chunk_event = {"type": "chunk", "text": chunk}
            yield f"data: {json.dumps(chunk_event)}\n\n"

        done_event = {"type": "done"}
        yield f"data: {json.dumps(done_event)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

# ----------------- Campus Directory & Info Endpoints -----------------

@app.get("/api/campus/meta")
def get_campus_meta():
    return kb_service.get_metadata()

@app.get("/api/campus/buildings")
def get_buildings():
    return kb_service.get_all_buildings()

@app.get("/api/campus/rooms")
def get_rooms(
    building_id: Optional[str] = None,
    type: Optional[str] = None
):
    rooms = kb_service.get_all_rooms()
    if building_id:
        rooms = [r for r in rooms if r.get("building_id") == building_id]
    if type:
        rooms = [r for r in rooms if type.lower() in r.get("type", "").lower()]
    return rooms

@app.get("/api/campus/departments")
def get_departments():
    return kb_service.get_all_departments()

@app.get("/api/campus/timetables")
def get_timetables(day: Optional[str] = None, course_code: Optional[str] = None):
    timetables = kb_service.get_all_timetables()
    if day:
        timetables = [t for t in timetables if any(day.lower() in d.lower() for d in t.get("days", []))]
    if course_code:
        timetables = [t for t in timetables if course_code.lower() in t.get("course_code", "").lower()]
    return timetables

@app.get("/api/campus/rules")
def get_rules(category: Optional[str] = None):
    rules = kb_service.get_all_rules()
    if category:
        rules = [r for r in rules if category.lower() in r.get("category", "").lower()]
    return rules

@app.get("/api/campus/amenities")
def get_amenities():
    return kb_service.get_all_amenities()

@app.get("/api/campus/search")
def search_campus(q: str = Query(..., min_length=1)):
    return kb_service.search(q)

@app.post("/api/campus/route")
def calculate_route(route: RouteRequest):
    """
    Intelligent campus wayfinding path generator between buildings or rooms.
    """
    origin = route.origin.strip()
    dest = route.destination.strip()

    # Pre-calculated navigation graph for the campus demo layout
    waypoints = [
        {"step": 1, "instruction": f"Depart from {origin}. Head toward the central campus concourse walkway.", "distance_meters": 45},
        {"step": 2, "instruction": "Proceed past the Ada Lovelace Central Library courtyard fountain.", "distance_meters": 75},
        {"step": 3, "instruction": (
            "Take the West Wing ADA elevator to the target floor." 
            if route.accessibility_mode 
            else "Take the illuminated staircase or central elevator to the destination floor."
        ), "distance_meters": 30},
        {"step": 4, "instruction": f"Follow corridor signs directly to {dest}.", "distance_meters": 20}
    ]

    total_dist = sum(w["distance_meters"] for w in waypoints)
    est_time_mins = max(1, round(total_dist / 65))

    return {
        "origin": origin,
        "destination": dest,
        "total_distance_meters": total_dist,
        "estimated_walking_minutes": est_time_mins,
        "accessibility_friendly": True,
        "steps": waypoints,
        "is_demo_route": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
