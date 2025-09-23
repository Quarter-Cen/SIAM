
from fastapi import APIRouter, HTTPException
from services.supabase_service import Depends, role_required, create_token, authenticate_user, get_student_profile, get_student_team, get_teacher_profile, get_student_profile_for_sheet
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/permission", 
    tags=["account"]
)


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    print(user)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user['id'], user['role'])
    return {"access_token": token, "token_type": "bearer"}

@router.get("/teacher-only")
def teacher_only(user = Depends(role_required(["teacher"]))):
    return {"msg": f"Hello teacher {user['id']}"}


@router.get("/student-or-teacher")
def student_or_teacher(user = Depends(role_required(["student", "teacher"]))):
    return {"msg": f"Hello {user['role']} {user['id']}"}


@router.get("/get-student-profile/{sid}")
def student_profile(sid: str):
    response = get_student_profile(sid)
    return response

@router.get("/get-student-profile-for-sheet/{sid}")
def student_profile_for_sheet(sid: str):
    response = get_student_profile_for_sheet(sid)
    return response


@router.get("/get-student-team/{sid}")
def student_team(sid: str):
    response = get_student_team(sid)
    return response


@router.get("/get-teacher-profile/{sid}")
def student_profile(sid: str):
    response = get_teacher_profile(sid)
    return response