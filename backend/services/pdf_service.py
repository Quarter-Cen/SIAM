import fitz
import io
import uuid

def filter_pages(file_obj: io.BytesIO, keywords: list[str]) -> list[int]:
    """
    Finds pages in a PDF that contain any of the given keywords.
    Special case: if the keyword is 'บทที่ 5', only keep the last page where it appears.
    """
    doc = fitz.open(stream=file_obj, filetype="pdf")

    matched_pages = []
    special_keyword = "บทที่ 5"
    special_pages = []
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()

        # lowercase เพื่อค้นหาแบบไม่สนตัวพิมพ์เล็ก/ใหญ่
        lower_text = text.lower()

        # เก็บหน้าสำหรับทุก keyword ปกติ
        if any(kw.lower() in lower_text for kw in keywords if kw != special_keyword):
            matched_pages.append(page_num + 1)

        # เก็บหน้าที่เจอ keyword เฉพาะ
        if special_keyword.lower() in lower_text:
            special_pages.append(page_num + 1)

    doc.close()

    # ถ้ามีเจอ "บทที่ 5" ให้เอาเฉพาะหน้าสุดท้ายและหน้าสุดท้าย + 1
    if special_pages:
        print(special_pages)
        matched_pages.append(special_pages[-1])
        matched_pages.append(special_pages[-1] + 1)
        

    # ลบเลขหน้าซ้ำ และเรียงลำดับ
    matched_pages = sorted(set(matched_pages))

    return matched_pages


def create_pdf_with_pages(file_obj: io.BytesIO, pages_to_keep: list[int]) -> bytes:
    """
    Creates a new PDF containing only the specified pages from an in-memory file.
    """
    if not all(isinstance(p, int) for p in pages_to_keep):
        raise TypeError("pages_to_keep must be a list of integers.")

    source_doc = fitz.open(stream=file_obj, filetype="pdf")
    output_doc = fitz.open()
    
    # แปลงเป็น 0-based และลบซ้ำ
    page_indices = sorted(set(p - 1 for p in pages_to_keep))
    
    # คัดลอกทีละหน้า
    for idx in page_indices:
        output_doc.insert_pdf(source_doc, from_page=idx, to_page=idx, links=False)

    doc_uuid = str(uuid.uuid4())

    # กำหนด metadata
    new_metadata = {
        "title": "Filtered PDF",
        "author": "SIAM",
        "subject": f"UUID: {doc_uuid}",
        "keywords": "keyword-filtered",
        "creator": "SIAM-System",
        "producer": "PyMuPDF",
        "creationDate": "",
        "modDate": "",
        "trapped": ""
    }
    output_doc.set_metadata(new_metadata)

    output_bytes_io = io.BytesIO(output_doc.tobytes())
    
    source_doc.close()
    output_doc.close()
    
    return output_bytes_io.getvalue(), doc_uuid

