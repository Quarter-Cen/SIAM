from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx # ใช้สำหรับส่ง HTTP Request ไปยัง n8n

router = APIRouter(
    prefix="/api/topics", # กำหนด prefix สำหรับทุก endpoints ใน router นี้
    tags=["topics"]
)

# Pydantic Model สำหรับตรวจสอบข้อมูล
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
        return {"status": "success", "data": n8n_response_json}
    
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to communicate with n8n: {e}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An unexpected error occurred: {e}"
        )