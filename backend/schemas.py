from pydantic import BaseModel, Field
from typing import List, Optional, Any

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class ChatResponse(BaseModel):
    content: str

class IDPRequest(BaseModel):
    profile: dict

class IDPResponse(BaseModel):
    idp: str

class Opportunity(BaseModel):
    id: str = Field(..., description="Notion page ID")
    name: str
    status: str
    division: Optional[list[str]] = None
    description: Optional[str] = None
    apply_url: Optional[str] = None

class SearchRequest(BaseModel):
    query: str
    k: int = 5

class SearchResult(BaseModel):
    document_title: str
    chunk_index: int
    score: float
    text: str
