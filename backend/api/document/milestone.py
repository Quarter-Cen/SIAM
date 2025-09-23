from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from model import MilestoneData
from services.supabase_service import get_all_milestones


router = APIRouter(
    prefix="/api/milestones",
    tags=["milestones"]
)

@router.get("/", response_model=Optional[MilestoneData])
async def get_milestones(
):
    """
    Endpoint สำหรับดึงข้อมูล Milestones ทั้งหมด
    """
    
    milestones = await get_all_milestones()
    print(milestones)
    return milestones