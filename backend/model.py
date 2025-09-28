
from pydantic import BaseModel, Field
from enum import Enum
from typing import List
from datetime import datetime
from typing import List, Literal, Optional

class ActionType(str, Enum):
    ACCEPT = "accept"
    REJECT = "reject"


class TopicActionRequest(BaseModel):
    action: str
    remark: str | None = None  
    tid: int
    teamid: str
    topicName: str
    year: str


class ProjectData(BaseModel):
    title: str
    team: List[str]
    advisors: List[str]
    goal: str
    year: str

class Member(BaseModel):
    id: str

class Advisor(BaseModel):
    name: str

class GoalUpdateRequest(BaseModel):
    goal: str

class MilestoneData(BaseModel):
    # Field ที่มาจาก database
    pmid: int = Field(alias='pmid')
    proposal: Optional[str] = None
    research_doc: Optional[str] = None
    proposal_slide: Optional[str] = None
    final_slide_project: Optional[str] = None

    class Config:
        from_attributes = True



class MilestoneUpdate(BaseModel):
    pjid: int = Field(..., description="Project Milestone ID ที่ต้องการอัปเดต")
    
    # ทุก Field เป็น Optional เพื่อรองรับการ PATCH
    proposal: Optional[str] = None
    research_doc: Optional[str] = None
    proposal_slide: Optional[str] = None
    final_slide_project: Optional[str] = None