from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import requests
from datetime import datetime

load_dotenv()

app = FastAPI()

# ✅ CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Supabase credentials
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_KEY")

print(f"Supabase URL: {url}")
print(f"Supabase KEY: {key[:10]}...")

# ✅ Pydantic model (no notes)
class Item(BaseModel):
    name: str
    expiration: str  # format: YYYY-MM-DD
    category: str
    unit: str
    purchased: str   # format: YYYY-MM-DD
    location: str
    quantity: int
    user_id: str

@app.post("/add-item")
async def add_item(item: Item):
    try:
        expiration_date = datetime.strptime(item.expiration, "%Y-%m-%d").date().isoformat()
        purchase_date = datetime.strptime(item.purchased, "%Y-%m-%d").date().isoformat()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }

    payload = {
        "name": item.name,
        "expiration": expiration_date,
        "category": item.category,
        "unit": item.unit,
        "purchased": purchase_date,
        "location": item.location,
        "quantity": item.quantity,
        "user_id": item.user_id
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
