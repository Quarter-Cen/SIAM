from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
import httpx 
from services.supabase_service import check_topic_for_team, submit_new_project, get_current_user, check_topic_for_sent, check_teacher_teams_for_projects
from typing import Annotated
from fastapi_cache.decorator import cache

router = APIRouter(
    prefix="/api/topics", 
    tags=["topics"]
)

class ProjectSubmission(BaseModel):
  teamid: str
  name: str
  tid: int
  academic_year: int


class CheckTopic(BaseModel):
    topic: str
    description: str
    advisor_name: Optional[str] = None
    academic_year: Optional[str] = None

@router.post("/check")
async def check_topic(item: CheckTopic):
    """
    Endpoint สำหรับตรวจสอบหัวข้อโครงงานเบื้องต้น
    """
    n8n_webhook_url = "http://localhost:5678/webhook-test/fda09353-7aa0-49c1-b4aa-e108dc7173df"

    try:
        payload = item.dict()
        
        async with httpx.AsyncClient() as client:
            # ส่งข้อมูลไปยัง n8n Webhook และรอรับ response กลับ
            response = await client.post(n8n_webhook_url, json=payload, timeout=60)
            response.raise_for_status()

        # นำ JSON ที่ได้รับจาก n8n มาเป็น response body ของ FastAPI
        n8n_response_json = response.json()
        print(n8n_response_json)
        return {"status": "success", "data": n8n_response_json}
    
    except httpx.HTTPError as e:
        print(e)
        raise HTTPException(
            status_code=500, detail=f"Failed to communicate with n8n: {e}"
        )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )
    

@router.get("/check-topic-for-team/{team_id}")
def check_topic_for_team_api(team_id: str):
    """
    Endpoint เพื่อตรวจสอบว่าทีมนี้มีหัวข้อแล้วหรือยัง
    """
    has_topic = check_topic_for_team(team_id)
    return has_topic



@router.post("/projects/submit")
def submit_project(project: ProjectSubmission, current_user: Annotated[str, Depends(get_current_user)]):
    """
    Endpoint สำหรับส่งหัวข้อโครงงานใหม่
    """ 
    # ตรวจสอบว่าทีมนี้มีหัวข้อแล้วหรือยัง
    print(project)
    if check_topic_for_sent(project.teamid):    
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This team has already submitted a project topic."
        )

    # ส่งข้อมูลไปยัง service เพื่อบันทึกลงฐานข้อมูล
    try:
        result = submit_new_project(project.dict())
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/team-progress/{tid}")
@cache(expire=60)
def check_topic_for_team_api(tid: str):
    """
    Endpoint เพื่อตรวจสอบว่าทีมนี้มีหัวข้อแล้วหรือยัง
    """
    has_team = check_teacher_teams_for_projects(tid)
    return has_team


@router.post("/team_stat")
async def team_stat(item: CheckTopic):
    """
    Endpoint สำหรับตรวจสอบหัวข้อโครงงานเบื้องต้น
    """
    n8n_webhook_url = "http://localhost:5678/webhook-test/request-stat"

    try:
        payload = item.dict()
        
        async with httpx.AsyncClient() as client:
            # ส่งข้อมูลไปยัง n8n Webhook และรอรับ response กลับ
            response = await client.post(n8n_webhook_url, json=payload, timeout=60)
            response.raise_for_status()

        # นำ JSON ที่ได้รับจาก n8n มาเป็น response body ของ FastAPI
        n8n_response_json = response.json()
        print(n8n_response_json)
        return {"status": "success", "data": n8n_response_json}
    
    except httpx.HTTPError as e:
        print(e)
        raise HTTPException(
            status_code=500, detail=f"Failed to communicate with n8n: {e}"
        )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"        
            )
    
