from fastapi import APIRouter, HTTPException, Depends
from services.supabase_service import get_documents_by_team_id, get_current_user, is_user_member_of_team
from fastapi import APIRouter, Depends, HTTPException, status


router = APIRouter(
    prefix="/api/documents", # กำหนด prefix สำหรับทุก endpoints ใน router นี้
    tags=["document"]
)

@router.get("/{team_id}")
async def get_team_documents(
    team_id: str,
):
    """
    Endpoint สำหรับดึงข้อมูลเอกสารทั้งหมดของทีม
    """
    documents = await get_documents_by_team_id(team_id)

    if not documents:
        return []
    
    return documents
        