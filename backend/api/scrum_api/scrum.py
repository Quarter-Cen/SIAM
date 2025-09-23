from fastapi import APIRouter, HTTPException, status
from services.supabase_service import get_projects,update_milestone,datetime,get_milestone,get_group_task, get_topic, get_project_suggestions
from pydantic import BaseModel
from fastapi_cache.decorator import cache
import httpx

router = APIRouter(
    prefix="/api/scrum", # กำหนด prefix สำหรับทุก endpoints ใน router นี้
    tags=["scrum"]
)

@router.get("/test-table")
async def testgetfn():
    result = get_projects()
    return result


class MilestoneUpdate(BaseModel):
    proposal: datetime
    proposal_slide: datetime
    final_slide_project: datetime
    research_doc: datetime

@router.put("/milestone")
async def update_milestone_api(payload: MilestoneUpdate):
    result = update_milestone(
        1,
        proposal=payload.proposal,
        proposal_slide=payload.proposal_slide,
        final_slide_project=payload.final_slide_project,
        research_doc=payload.research_doc
    )
    return {"updated": result}

@router.get("/milestone")
async def getmilestone():
    result = get_milestone()
    return result


# ดึงเอา Total_task และ task ที่ complete ของทีม
@router.get("/group_task_complete/{team_id}")
async def get_group_task_api(team_id: str):
    result = get_group_task(team_id)
    return {"summary": result}

# teacher ดูกลุ่มที่เสนอชื่อมาหาคุณ
@router.get("/topic/{teacher_id}")
@cache(expire=60)
async def get_topic_api(teacher_id: int):
    result = get_topic(teacher_id)
    return result


@router.get("/stat/{team_id}")
@cache(expire=120)
async def get_team_stat_api(team_id: str):
    """
    Endpoint สำหรับตรวจสอบหัวข้อโครงงานเบื้องต้น
    """
    n8n_webhook_url = "http://localhost:5678/webhook/request-stat"

    try:
        payload = team_id
        
        async with httpx.AsyncClient() as client:
            # ส่งข้อมูลไปยัง n8n Webhook และรอรับ response กลับ
            response = await client.post(n8n_webhook_url, json=payload, timeout=120)
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
    
@router.get("/suggestions/{team_id}")
async def get_project_suggestions_api(
    team_id: str,
):
    """
    Retrieves project suggestions and adjustments for a specific team.
    """
    data = await get_project_suggestions(team_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project suggestions not found")
    
    return data