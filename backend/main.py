from fastapi import FastAPI

from api.pdf_api import router as pdf_router
from api.topic.check import router as check_router
from api.scrum_api.scrum import router as scrum_router
from api.permission.permission import router as permission_router
from api.scrum_api.getTopic import router as topicAction_router
from api.document.document import router as document_router
from api.document.milestone import router as milestone_router

from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from redis import asyncio as aioredis
from dotenv import load_dotenv
import os

load_dotenv()
app = FastAPI()
frontend_origin = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

# ตั้งค่า CORS Middleware
origins = [
    frontend_origin,
    "http://localhost:3000",  # URL ของ Next.js Frontend
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_api = os.getenv("REDIS_API")
@app.on_event("startup")
async def startup():
    # เชื่อมต่อกับ Redis
    redis = aioredis.from_url(redis_api, encoding="utf8", decode_responses=True)
    FastAPICache.init(RedisBackend(redis), prefix="fastapi-cache")


app.include_router(pdf_router)
app.include_router(check_router)
app.include_router(scrum_router)
app.include_router(permission_router)
app.include_router(topicAction_router)
app.include_router(document_router)
app.include_router(milestone_router)