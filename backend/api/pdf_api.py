from fastapi import APIRouter, UploadFile, File
from fastapi.responses import StreamingResponse
from services.pdf_service import filter_pages, create_pdf_with_pages, filter_spcific_pages
from config import KEYWORDS
import io   

router = APIRouter()

@router.post("/extract-keyword-pages")
async def extract_keyword_pages(file: UploadFile = File(...)):
    """
    Extracts pages from a PDF file that contain specific keywords.
    The process is done entirely in memory without writing to disk.
    """
    # อ่านไฟล์ทั้งหมดเป็น bytes เข้าสู่ memory
    content = await file.read()
    
    # สร้าง file-like object จาก bytes
    file_obj = io.BytesIO(content)


    matched_pages = filter_pages(file_obj, KEYWORDS)

    if not matched_pages:
        return {"message": "No pages matched keywords"}

    # สร้าง PDF ใหม่จากหน้าที่ตรงกันใน memory
    output_bytes, pdf_uuid = create_pdf_with_pages(file_obj, matched_pages)
    

    return StreamingResponse(
        iter([output_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=filtered.pdf",
        "X-PDF-UUID": pdf_uuid }   # ส่ง UUID ใน header นี้
    )

@router.post("/extract-specific-pages")
async def extract_keyword_pages(file: UploadFile = File(...)):
    """
    Extracts pages from a PDF file that contain specific keywords.
    The process is done entirely in memory without writing to disk.
    """
    # อ่านไฟล์ทั้งหมดเป็น bytes เข้าสู่ memory
    content = await file.read()
    
    # สร้าง file-like object จาก bytes
    file_obj = io.BytesIO(content)

    matched_pages = filter_spcific_pages(file_obj)

    if not matched_pages:
        return {"message": "No pages matched keywords"}

    # สร้าง PDF ใหม่จากหน้าที่ตรงกันใน memory
    output_bytes, pdf_uuid = create_pdf_with_pages(file_obj, matched_pages)
    

    return StreamingResponse(
        iter([output_bytes]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=filtered.pdf",
        "X-PDF-UUID": pdf_uuid }   # ส่ง UUID ใน header นี้
    )