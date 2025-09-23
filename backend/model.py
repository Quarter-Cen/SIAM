
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
    id: int = Field(alias='pmid')
    proposal: Optional[datetime] = None
    research_doc: Optional[datetime] = None
    proposal_slide: Optional[datetime] = None
    final_slide_project: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True # ช่วยให้ Pydantic ใช้ชื่อ alias ในการสร้าง Object ได้