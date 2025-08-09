import fitz
import io
import uuid

def filter_pages(file_obj: io.BytesIO, keywords: list[str]) -> list[int]:
    """
    Finds pages in a PDF (from an in-memory object) that contain any of the given keywords.
    
    Args:
        file_obj: A BytesIO object containing the PDF data.
        keywords: A list of keywords to search for.
    
    Returns:
        A list of page numbers (1-based) where keywords were found.
    """
    # Open the PDF directly from the BytesIO object
    # PyMuPDF's fitz.open() can handle file-like objects
    doc = fitz.open(stream=file_obj, filetype="pdf")
    
    matched_pages = []
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        text = page.get_text()
        
        # Check if any keyword exists in the page text (case-insensitive)
        if any(keyword.lower() in text.lower() for keyword in keywords):
            matched_pages.append(page_num + 1)
            
    doc.close()
    return matched_pages


def create_pdf_with_pages(file_obj: io.BytesIO, pages_to_keep: list[int]) -> bytes:
    """
    Creates a new PDF containing only the specified pages from an in-memory file.
    
    Args:
        file_obj: A BytesIO object containing the source PDF.
        pages_to_keep: A list of page numbers (1-based) to include in the new PDF.
        
    Returns:
        The bytes of the new PDF file.
    """
    # Ensure pages_to_keep is a list of integers
    if not all(isinstance(p, int) for p in pages_to_keep):
        raise TypeError("pages_to_keep must be a list of integers.")

    source_doc = fitz.open(stream=file_obj, filetype="pdf")
    output_doc = fitz.open()
    
    # Create a list of 0-based page numbers for insertion
    page_indices = [p - 1 for p in pages_to_keep]
    
    # Insert pages by copying them from the source document
    output_doc.insert_pdf(source_doc, from_page=min(page_indices), to_page=max(page_indices), links=False)
    print(output_doc.metadata)


    doc_uuid = str(uuid.uuid4())

    # กำหนด metadata โดยใช้ key ที่ fitz รองรับตามที่ print มา
    new_metadata = {
        "title": "Filtered PDF",
        "author": "YourApp",
        "subject": f"UUID: {doc_uuid}",
        "keywords": "keyword-filtered",
        "creator": "MyApp",
        "producer": "PyMuPDF",
        "creationDate": "",  # หรือใส่วันที่จริง
        "modDate": "",
        "trapped": ""
    }

    output_doc.set_metadata(new_metadata)
    output_bytes_io = io.BytesIO(output_doc.tobytes())
    
    source_doc.close()
    output_doc.close()
    
    return output_bytes_io.getvalue(), doc_uuid
