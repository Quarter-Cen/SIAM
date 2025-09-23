# app/routes.py
from fastapi import APIRouter, HTTPException, Depends
from services.supabase_service import process_topic_action,get_project_by_team, update_project_goal, get_current_user
# is_user_member_of_team
from model import TopicActionRequest, GoalUpdateRequest


# สร้าง instance ของ APIRouter
router = APIRouter(
    prefix="/api/topics", # กำหนด prefix สำหรับทุก endpoints ใน router นี้
    tags=["topics"]
)

@router.put("/action/{tpid}")
def handle_topic_action(tpid: str, request: TopicActionRequest):
    try:
        result = process_topic_action(tpid, request.action, request.tid, request.teamid, request.topicName ,request.year ,request.remark)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
    

@router.get("/overview/{tmid}")
async def get_overview(tmid: str):
    response = get_project_by_team(tmid)
    return response



@router.patch("/overview/{team_id}/goal")
def update_goal_route(
    team_id: str, 
    request: GoalUpdateRequest,
    current_user_id: str = Depends(get_current_user) # ได้ user_id จาก token
):
    """
    Endpoint สำหรับอัปเดต Goal
    """
    
    print(team_id, current_user_id)
    # ส่ง current_user_id ไปให้ service function เพื่อทำการตรวจสอบสิทธิ์
    updated_project = update_project_goal(
        team_id=team_id, 
        new_goal=request.goal,
        user_id=current_user_id.get("id")
    )
    return updated_project