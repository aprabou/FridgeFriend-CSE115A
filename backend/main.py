from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import requests

load_dotenv()

app = FastAPI()

# ✅ CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Supabase config
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

print(f"Supabase URL: {url}")
print(f"Supabase KEY: {key[:10]}...")

# ✅ Pydantic model includes user_id
class Item(BaseModel):
    name: str
    expiration: str
    category: str
    unit: str
    purchased: str
    location: str
    quantity: int
    user_id: str

@app.post("/add-item")
async def add_item(item: Item):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": item.name,
        "expiration": item.expiration,
        "category": item.category,
        "unit": item.unit,
        "purchased": item.purchased,
        "location": item.location,
        "quantity": item.quantity,
        "user_id": item.user_id  # ✅ now dynamic!
    }

    response = requests.post(
        f"{url}/rest/v1/fridge_items",
        headers=headers,
        json=payload
    )

    try:
        data = response.json()
    except Exception:
        data = {"message": response.text}

    if not response.ok:
        print("❌ Backend error:", data)
        raise HTTPException(status_code=response.status_code, detail=data)

    return {"success": True, "data": data}
