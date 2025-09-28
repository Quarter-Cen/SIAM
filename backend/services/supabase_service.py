from supabase import create_client, Client
from dotenv import load_dotenv
import jwt, os
from datetime import datetime
from fastapi.security import HTTPBearer
from fastapi import Depends, HTTPException, status, APIRouter
from datetime import datetime, timedelta
from typing import Optional
from typing import List, Optional, Dict, Any
from model import MilestoneData

load_dotenv()

url = os.getenv("URL_SUPABASE")
key = os.getenv("KEY_SUPABASE")
supabase: Client = create_client(url, key)

security = HTTPBearer()
JWT_SECRET = key
JWT_ALGORITHM = "HS256"

def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=["HS256"])
        
        user_id = payload.get("sub")
        user_role = payload.get("role")

        if not user_id or not user_role:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # ตรวจสอบว่าผู้ใช้มีตัวตนจริงในฐานข้อมูล
        # Query ฐานข้อมูลแค่ครั้งเดียว
        table_name = "student" if user_role == "student" else "teacher"
        id_column = "sid" if user_role == "student" else "tid"

        response = supabase.table(table_name).select(id_column).eq(id_column, user_id).execute()
        if not response.data:
            raise HTTPException(status_code=401, detail="User profile not found")

        return {
            "id": user_id,
            "role": user_role
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error")

def role_required(required_roles: list[str]):
    def wrapper(user = Depends(get_current_user)):
        role = user["role"]   # <-- ตอนนี้คืนค่ามาแบบนี้
        if role not in required_roles:
            raise HTTPException(status_code=403, detail="Not enough permissions")
        return user
    return wrapper

def create_token(user_id: str, role: str):
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_student_profile(user_id: str):
    try:
        response = supabase.table("student").select("sid, name, teamid").eq("sid", user_id).single().execute()
        return response.data
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None

def get_student_profile_for_sheet(user_id: str):
    """
    ดึงข้อมูลโปรไฟล์นักศึกษา (sid, name, teamid) และ ajdv_pm_sheet ของทีม
    """
    try:
        # 1. ดึงข้อมูลโปรไฟล์นักศึกษาโดยใช้ sid
        student_response = supabase.table("student").select("sid, name, teamid").eq("sid", user_id).single().execute()
        
        # ตรวจสอบว่าพบข้อมูลนักศึกษาหรือไม่
        if not student_response.data:
            print(f"Error: Student with sid '{user_id}' not found.")
            return None

        team_id = student_response.data.get("teamid")
        if not team_id:
            print(f"Error: Student '{user_id}' does not have a teamid.")
            return student_response.data  # คืนข้อมูลที่ได้มาแม้ไม่พบ teamid

        # 2. ดึงข้อมูล ajdv_pm_sheet จาก teamid ที่ได้มา
        team_response = supabase.table("team").select("ajdv_pm_sheet").eq("tmid", team_id).single().execute()
        
        # สร้าง dictionary ใหม่เพื่อรวมข้อมูลทั้งหมด
        result_data = {
            "sid": student_response.data.get("sid"),
            "name": student_response.data.get("name"),
            "teamid": team_id,
            # เพิ่ม ajdv_pm_sheet เข้าไปในผลลัพธ์
            "ajdv_pm_sheet": team_response.data.get("ajdv_pm_sheet") if team_response.data else None
        }

        return result_data

    except Exception as e:
        print(f"Error fetching user profile for sheet: {e}")
        return None

def authenticate_user(username: str, password: str) -> Optional[dict]:
    """
    ตรวจสอบข้อมูลผู้ใช้จากตาราง student และ teacher
    """
    try:
        # 1. ตรวจสอบในตาราง student ก่อน
        student_response = supabase.table('student').select("sid").eq("sid", username).execute()
        student_data = student_response.data
        if student_data:
            user = student_data[0]
            if user['sid'] == password:
                return {"id": user['sid'], "role": "student"}
        print("ไม่มี student")
        # 2. ถ้าไม่พบในตาราง student ให้ตรวจสอบในตาราง teacher
        teacher_response = supabase.table('teacher').select("tid").eq("tid", username).execute()
        teacher_data = teacher_response.data
        if teacher_data:
            print("มี teacher")
            user = teacher_data[0]
            print(str(user["tid"]) == password)

            if str(user["tid"]) == password:
                return {"id": user['tid'], "role": "teacher"}

        # 3. ถ้าไม่พบผู้ใช้ในทั้งสองตาราง ให้คืนค่า None
        return None

    except Exception as e:
        # จัดการข้อผิดพลาดที่อาจเกิดขึ้น
        print(f"Error during authentication: {e}")
        return None




def get_projects():
    response = supabase.table("student").select("*").execute()
    return response.data

def update_milestone(pjid: int, update_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    อัปเดตเฉพาะ Field ที่ระบุสำหรับ Project Milestone ID (pmid) ที่กำหนดใน Supabase
    """
    try:
        response = (
            supabase.table('project_milestone')

            .update(update_dict) 
            .eq('pmid', pjid) 
            .execute()
        )
        
        updated_data = response.data

        # 🛑 แก้ไข: ถ้าอัปเดตสำเร็จ (response.data ไม่ว่าง) ให้คืนค่าข้อมูลที่อัปเดตแล้ว
        if updated_data:
            # Supabase จะคืนค่าเป็น List of Dicts เราจึงคืนค่า Dict แรก
            return updated_data[0] 
        
        # ถ้าอัปเดตแล้วแต่ Supabase คืนค่าว่าง (เช่น ไม่พบ pmid นั้น)
        return None 
    
    except Exception as e:
        # การจัดการข้อผิดพลาด เช่น DB Connection Error หรือ Invalid Data
        print(f"Supabase UPDATE error: {e}")
        return None
def get_milestone():
    response = supabase.table("project_milestone").select("*").execute()
    return response.data


def get_group_task(team_id: str):
    response = supabase.rpc(
        "get_group_task_summary", 
        {"team_id": team_id} 
    ).execute()
    return response.data


def get_topic(tid: int):
    response = supabase.table("topic").select("*").eq("tid", tid).execute()
    return response.data


def check_topic_for_team(team_id: str):
    """
    ตรวจสอบว่าทีมนี้มีหัวข้อหรือโปรเจกต์แล้วหรือยัง
    """
    try:
        # สมมติว่าตารางโปรเจกต์คือ 'project' และมีคอลัมน์ 'team_id'
        # ใช้ .count() เพื่อตรวจสอบการมีอยู่ของข้อมูลอย่างมีประสิทธิภาพ
        response = supabase.table("project").select("teamid", count="exact").eq("teamid", team_id).execute()
        return response.count > 0
    except Exception as e:
        print(f"Error checking topic for team: {e}")
        return False
    

def check_topic_for_sent(team_id: str):
    """
    ตรวจสอบว่าทีมนี้มีหัวข้อหรือโปรเจกต์แล้วหรือยัง
    """
    try:
        # สมมติว่าตารางโปรเจกต์คือ 'project' และมีคอลัมน์ 'team_id'
        # ใช้ .count() เพื่อตรวจสอบการมีอยู่ของข้อมูลอย่างมีประสิทธิภาพ
        response = supabase.table("topic").select("teamid", count="exact").eq("teamid", team_id).ne("status", "not-pass").execute()
        return response.count > 0
    except Exception as e:
        print(f"Error checking topic for team: {e}")
        return False
    
    
def submit_new_project(project_data: dict):
    """
    บันทึกข้อมูลโปรเจกต์ใหม่ลงในตาราง 'project'
    """
    try:
        response = supabase.table("topic").insert(project_data).execute()
        return response.data[0]
    except Exception as e:
        print(f"Error submitting new project: {e}")
        return None
    

def get_student_team(student_id: str):
    try:
        response = supabase.table("student").select("teamid").eq("sid", student_id).execute()
        return response.data[0]
    except Exception as e:
        print(f"Error find student team: {e}")
        return None
    
def get_teacher_profile(teacher_id: str):
    try:
        response = supabase.table("teacher").select("tid, name").eq("tid", teacher_id).single().execute()
        return response.data
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None
    


def process_topic_action(
    tpid: str,
    action: str,
    tid: str,  # เปลี่ยนเป็น str
    teamid: str,
    topicName: str,
    year: str,
    remark: str | None = None
) -> dict:
    if action == "accept":
        new_status = "pass"
        # หากอนุมัติ ให้เตรียมข้อมูลอัปเดตของ team
        update_team_data = {
            "name": topicName,
            "status": "on-going",
            "teacherid": tid, 
        }

        create_project_data = {
            "topic": topicName,
            "objective": "",
            "status": "on-going",
            "year" : year,
            "teamid": teamid
        }
    elif action == "reject":
        new_status = "not-pass"
        # หากปฏิเสธ ไม่ต้องอัปเดตตาราง team หรือกำหนดเป็นค่าว่าง
        update_team_data = {} 
    else:
        raise ValueError("Invalid action. Must be 'accept' or 'reject'.")

    update_topic_data = {
        "status": new_status,
        "remark": remark,
    }

    try:
        topic_response = supabase.table("topic").update(update_topic_data).eq("tpid", tpid).execute()
        if not topic_response.data:
            raise HTTPException(status_code=404, detail="Topic not found or already processed")

        # ถ้า action คือ 'accept' จึงจะทำการอัปเดตตาราง team
        if action == "accept":
            team_response = supabase.table("team").update(update_team_data).eq("tmid", teamid).execute()
            if not team_response.data:
                # ถ้าอัปเดต team ล้มเหลว ให้แจ้งเตือนและยกเลิก
                print(f"Failed to update team: Team ID {teamid} not found.")
                raise HTTPException(status_code=404, detail="Topic updated, but associated Team not found or failed to update.")
            project_create = supabase.table("project").insert(create_project_data).execute()
            if not project_create.data:
                print(f"Failed to create project.")
                raise HTTPException(status_code=404, detail="Topic updated, but associated Team not found or failed to update.")
            # ดึง project_id ที่เพิ่งสร้าง
            project_id = project_create.data[0].get("pid") 
            if not project_id:
                raise HTTPException(status_code=500, detail="Failed to retrieve new project ID.")

            # สร้าง list ของ dictionary สำหรับเอกสารแต่ละประเภท
            documents_to_insert = [
                {"doc_type": "proposal", "status": "not-submitted", "pid": project_id},
                {"doc_type": "slide-proposal", "status": "not-submitted", "pid": project_id},
                {"doc_type": "thesis", "status": "not-submitted", "pid": project_id},
                {"doc_type": "slide-final-present", "status": "not-submitted", "pid": project_id},
            ]

            # ส่งรายการทั้งหมดไป insert ใน Supabase ในการเรียกครั้งเดียว
            doc_submit_create = supabase.table("doc").insert(documents_to_insert).execute()
            
            if not doc_submit_create.data:
                print(f"Failed to create documents for project ID: {project_id}.")
                raise HTTPException(status_code=500, detail="Failed to create initial documents.")
            
            
        return {
            "message": f"Topic '{tpid}' has been {new_status}.",
            "new_status": new_status,
        }
    except Exception as e:
        # หากเกิดข้อผิดพลาด ให้ rollback หรือแจ้งผู้ใช้
        print(f"Error during topic and team update: {e}")
        # คุณอาจพิจารณาเพิ่ม logic สำหรับ rollback ในกรณีที่อัปเดตบางส่วนสำเร็จ
        raise HTTPException(status_code=500, detail=f"Database error: {e}")
    
def check_teacher_teams_for_projects(tid: str):
    """
    Checks for projects associated with a teacher's teams.
    
    Args:
        tid (str): The teacher ID.
        
    Returns:
        The response object from the Supabase query, or None if an error occurs.
    """
    try:
        # Step 1: Get all team IDs associated with the teacher
        teams_response = supabase.table("team").select("tmid").eq("teacherid", tid).execute()
        
        # Check if the teacher has any teams
        if not teams_response.data:
            print("No teams found for this teacher.")
            return None
            
        # Extract a list of team IDs
        team_ids = [team['tmid'] for team in teams_response.data]

        # Step 2: Query the 'project' table for any of these team IDs
        # Use the 'in_' filter to check against an array of IDs
        projects_response = supabase.table("project").select("*").in_("teamid", team_ids).execute()
        print(projects_response.data)
        return projects_response.data
        
    except Exception as e:
        print(f"Error checking teacher's teams for projects: {e}")
        return None
    
def get_project_by_team(tmid: str):
    # ค้นหาข้อมูล project จาก teamid
    response = supabase.table("project").select("*").eq("teamid", tmid).execute()
    project = response.data
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    data_row = project[0]
    
    # ดึงข้อมูลสมาชิกจากตาราง "student"
    members_response = supabase.table("student").select("sid").eq("teamid", tmid).execute()
    team_members = [m['sid'] for m in members_response.data]

    find_teacherID_team = supabase.table("team").select("teacherid").eq("tmid", tmid).execute()
    teacher_id = find_teacherID_team.data[0]['teacherid']

    advisors_names = []
    if teacher_id:
        find_teacher_name = supabase.table("teacher").select("name").eq("tid", teacher_id).execute()
        advisors_names = [t['name'] for t in find_teacher_name.data]

    return {
        "title": data_row["topic"],  # แก้ไขจาก "title" เป็น "topic"
        "team": team_members,
        "advisors": advisors_names,
        "goal": data_row["objective"], # แก้ไขจาก "goal" เป็น "objective"
        "year": data_row["year"],      # ตรวจสอบอีกครั้งว่า year ใน DB มีค่าหรือไม่
    }

def update_project_goal(team_id: str, new_goal: str, user_id: str) -> dict:
    """
    อัปเดตวัตถุประสงค์ (goal) ของโครงงาน
    :param team_id: ID ของทีม
    :param new_goal: วัตถุประสงค์ใหม่
    :param user_id: ID ของผู้ใช้ที่กำลังร้องขอการแก้ไข
    :return: ข้อมูลที่อัปเดตแล้ว
    """
    # ---  Authorization Check ---
    # ตรวจสอบก่อนว่าผู้ใช้ที่ login อยู่ เป็นสมาชิกของทีมที่กำลังจะแก้ไขหรือไม่

    if not is_user_member_of_team(user_id=user_id, team_id=team_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to edit this project."
        )

    # ถ้าผ่านการตรวจสอบด้านบนแล้ว จึงจะทำงานส่วนที่เหลือ
    try:
        response = supabase.table('project').update({'objective': new_goal}).eq('teamid', team_id).execute()
        if response.data:
            return response.data[0]
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Project for team {team_id} not found.")
    except Exception as e:
        print(f"Error updating project goal: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update project goal.")
    
def is_user_member_of_team(user_id: str, team_id: str) -> bool:
    """
    ตรวจสอบว่า User ID ที่ระบุ เป็นสมาชิกของ Team ID ที่กำหนดหรือไม่
    :param user_id: ID ของผู้ใช้ (sid) ที่ได้จาก Token
    :param team_id: ID ของทีมที่ต้องการตรวจสอบ
    :return: True ถ้าเป็นสมาชิก, False ถ้าไม่ใช่
    """

    print(team_id, user_id)
    try:
        # ค้นหาโปรไฟล์ของนักศึกษาจาก user_id ที่ login เข้ามา
        response = supabase.table('student').select('teamid').eq('sid', user_id).single().execute()
        
        if response.data and response.data.get('teamid') == team_id:
            return True
        return False
    except Exception:
        return False

async def get_documents_by_team_id(team_id: str):
    """
    ดึงข้อมูลเอกสารทั้งหมดของทีมที่กำหนดจากฐานข้อมูล
    โดยค้นหา project_id ที่เชื่อมกับทีมก่อน
    """
    try:
        # 1. ค้นหา project_id ของทีม
        project_response = supabase.table('project').select('pid').eq('teamid', team_id).single().execute()
        
        # ตรวจสอบว่าพบ project_id หรือไม่
        if not project_response.data:
            print(f"No project found for team ID: {team_id}")
            return []
            
        project_id = project_response.data.get('pid')
        
        # 2. ใช้ project_id ที่ได้ไปดึงข้อมูลเอกสารจากตาราง 'documents'
        documents_response = supabase.table('doc').select('*').eq('pid', project_id).execute()

        if not documents_response.data:
            return []

        return documents_response.data
        
    except Exception as e:
        print(f"Error fetching documents: {e}")
        # ในสถานการณ์จริงควรมีการจัดการ error ที่ละเอียดกว่านี้
        return []

async def get_all_milestones() -> Optional[MilestoneData]:
    """
    ดึงข้อมูล Milestone ทั้งหมดจากฐานข้อมูล (สมมติว่าเป็นโปรเจกต์เดียว)
    """
    try:
        # ดึงข้อมูลทั้งหมดจากตาราง 'milestone'
        milestone_response = supabase.table('project_milestone').select('*').single().execute()
        print(milestone_response)
        if not milestone_response.data:
            return None # ไม่พบข้อมูล milestones

        # แปลงข้อมูลที่ได้จาก Supabase เป็น Pydantic Model
        return MilestoneData.model_validate(milestone_response.data)
    except Exception as e:
        print(f"Error fetching milestones: {e}")
        return None


async def get_project_suggestions(team_id: str):
    """
    Fetches recommendations and additional_work data for a given team from the project table.
    """
    try:
        # The `await` goes here, before the entire chain of methods.
        response = supabase.table("project").select("recommendations, additional_work").eq("teamid", team_id).single().execute()
        return response.data
    except Exception as e:
        print(f"Error fetching project suggestions: {e}")
        return None
    

def get_project_name(team_id: str):
    try:
        # The `await` goes here, before the entire chain of methods.
        response = supabase.table("project").select("topic").eq("teamid", team_id).single().execute()
        return response.data
    
    except Exception as e:
        print(f"Error fetching project name: {e}")
        return None
    
async def set_project_suggestions(set_response: list, team_id: str):
    """
    อัปเดตหัวข้อและรายละเอียดคำแนะนำสำหรับโปรเจกต์
    """
    # 1. ตรวจสอบว่า list ไม่ว่างเปล่า
    if not set_response or not isinstance(set_response, list):
        print("Error: Invalid set_response format. Expected a non-empty list.")
        return None

    # 2. ดึง dictionary แรกจาก list
    data_dict = set_response[0]

    # 3. ตรวจสอบว่า dictionary มี 'result' key
    if 'result' not in data_dict:
        print("Error: 'result' key not found in the response dictionary.")
        return None
    
    # 4. ดึงค่า recommendations และ additional_work
    recommendations = data_dict['result'].get('recommendations', '')
    additional_work = data_dict['result'].get('additional_work', '')
    
    # สร้าง payload สำหรับการอัปเดต
    payload = {
        "recommendations": recommendations,
        "additional_work": additional_work
    }
    
    print(f"Updating project for team {team_id} with data: {payload}")
    
    try:

        response = supabase.table("project").update(payload).eq("teamid", team_id).execute()
        
        # ตรวจสอบว่าอัปเดตสำเร็จ
        if response.data:
            print("Successfully updated project suggestions.")
            return response.data
        else:
            print("Update operation successful but no data was returned.")
            return None

    except Exception as e:
        print(f"Error updating project suggestions: {e}")
        return None
    



def get_team_profile_for_sheet(teamid: str):
    try:

        team_response = supabase.table("team").select("ajdv_pm_sheet").eq("tmid", teamid).single().execute()
        
        result_data = {
            "teamid": teamid,
            "ajdv_pm_sheet": team_response.data.get("ajdv_pm_sheet") if team_response.data else None
        }

        return result_data
    except Exception as e:
        print(f"Error fetching user profile for sheet: {e}")
        return None
    
async def update_document(did: int, payload: dict):
    update_data = {
            "status": payload.get("status"),
            "stamp_at": datetime.now().isoformat(),  # ใช้ .isoformat() เพื่อให้เป็น string ที่ถูกต้องสำหรับฐานข้อมูล
        }
    try:

        response = supabase.table("doc").update(update_data).eq("did", did).execute()


        return response.data

    except Exception as e:

        print(f"Error updating documents for document {did}: {e}")
        return []
    

