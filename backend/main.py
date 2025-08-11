from fastapi import FastAPI
from api.pdf_api import router as pdf_router
from api.topic.check import router as check_router
app = FastAPI()

app.include_router(pdf_router)
app.include_router(check_router)