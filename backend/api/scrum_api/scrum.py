import pytz 
from fastapi import APIRouter, HTTPException, status
from services.supabase_service import datetime, get_projects,update_milestone,get_milestone,get_group_task, get_topic, get_project_suggestions, get_project_name, set_project_suggestions

from fastapi_cache.decorator import cache
import httpx
from model import MilestoneUpdate, MilestoneData

router = APIRouter(
    prefix="/api/scrum", # กำหนด prefix สำหรับทุก endpoints ใน router นี้
    tags=["scrum"]
)

@router.get("/test-table")
async def testgetfn():
    result = get_projects()
    return result


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


@router.post("/generate-suggestions/{team_id}")
async def get_project_suggestions_api(
    team_id: str,
):

    data =  get_project_name(team_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project name not found")

    n8n_webhook_url = "http://localhost:5678/webhook/recommendation"
    try:

        payload = data
        
        async with httpx.AsyncClient() as client:
            # ส่งข้อมูลไปยัง n8n Webhook และรอรับ response กลับ
            response = await client.post(n8n_webhook_url, json=payload, timeout=120)
            response.raise_for_status()

        # นำ JSON ที่ได้รับจาก n8n มาเป็น response body ของ FastAPI
        n8n_response_json = response.json()
        print(n8n_response_json)

        set_response = await set_project_suggestions(n8n_response_json, team_id)
        print(set_response)
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
    

@router.patch("/milestones/update/", response_model=MilestoneData)
async def update_project_milestones(update_data: MilestoneUpdate):
    """
    อัปเดตวันที่/เวลาของ Milestones เฉพาะ Field ที่ระบุ (ใช้ PATCH Logic)
    """
    # 1. เตรียมข้อมูลสำหรับอัปเดต: ลบ Field ที่เป็น None ออก และเอา pmid ออก
    update_dict = update_data.model_dump(exclude_none=True)
    pmid_to_update = update_dict.pop('pjid') 
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update."
        )
    for key, value in update_dict.items():
            if isinstance(value, str):
                # 1. แปลง String YYYY-MM-DDTHH:mm เป็น Aware Datetime (Logic เดิม)
                naive_dt = datetime.fromisoformat(value)
                aware_dt = naive_dt.replace(tzinfo=pytz.timezone('UTC')) 
                
                # 2. 🛑 แก้ไข: แปลง Aware Datetime Object กลับเป็น ISO String
                update_dict[key] = aware_dt.isoformat() # 🎯 ใช้ .isoformat() 🎯
    try:
        # 2. เรียก Service Layer เพื่อทำการอัปเดตใน Supabase
        updated_data = update_milestone(pmid_to_update, update_dict)
        
        if not updated_data:
            # อาจเกิดขึ้นถ้า pmid ไม่ถูกต้อง หรืออัปเดตไม่สำเร็จ
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Milestone ID {pmid_to_update} not found or update failed."
            )
        
        return updated_data
        
    except Exception as e:
        print(f"Update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update milestone due to server error."
        )