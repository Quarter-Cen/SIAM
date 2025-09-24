from fastapi import APIRouter, HTTPException, Depends
from services.supabase_service import get_documents_by_team_id, update_document
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
        

@router.patch("/{docId}")
async def update_document_status(
    docId: int, payload : dict
):
    response = await update_document(docId,payload)
    
    return response