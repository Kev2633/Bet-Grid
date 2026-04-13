"""EdgeBoard Backend API"""
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import csv, io, httpx, os
from datetime import datetime

app = FastAPI(title="EdgeBoard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

db = {"accounts": [], "transactions": [], "promotions": []}

ODDS_API_KEY = os.getenv("ODDS_API_KEY", "")
ODDS_API_BASE = "https://api.the-odds-api.com/v4"

class Account(BaseModel):
    sportsbook: str
    nickname: Optional[str] = ""
    initial_deposit: Optional[float] = 0.0

class Transaction(BaseModel):
    date: str
    sportsbook: str
    type: str
    amount: float

class Promotion(BaseModel):
    book: str
    book_name: str
    title: str
    sport: str
    terms: str
    expiry: str

@app.get("/api/accounts")
def get_accounts():
    results = []
    for a in db["accounts"]:
        deps = sum(t["amount"] for t in db["transactions"] if t["sportsbook"] == a["sportsbook"] and t["type"] == "deposit")
        wds = sum(t["amount"] for t in db["transactions"] if t["sportsbook"] == a["sportsbook"] and t["type"] == "withdrawal")
        bon = sum(t["amount"] for t in db["transactions"] if t["sportsbook"] == a["sportsbook"] and t["type"] == "bonus")
        results.append({**a, "deposits": deps, "withdrawals": wds, "bonuses": bon, "net": deps - wds + bon})
    return results

@app.post("/api/accounts")
def add_account(account: Account):
    acct = account.dict()
    db["accounts"].append({"sportsbook": acct["sportsbook"], "nickname": acct["nickname"]})
    if acct["initial_deposit"] > 0:
        db["transactions"].append({"date": datetime.now().strftime("%Y-%m-%d"), "sportsbook": acct["sportsbook"], "type": "deposit", "amount": acct["initial_deposit"]})
    return {"status": "ok"}

@app.get("/api/transactions")
def get_transactions():
    return db["transactions"]

@app.post("/api/transactions")
def add_transaction(txn: Transaction):
    db["transactions"].append(txn.dict())
    return {"status": "ok"}

@app.post("/api/transactions/import-csv")
async def import_csv(file: UploadFile = File(...)):
    content = await file.read()
    reader = csv.DictReader(io.StringIO(content.decode("utf-8")))
    count = 0
    for row in reader:
        txn = {"date": row.get("date", ""), "sportsbook": row.get("sportsbook", "").lower().replace(" ", ""), "type": row.get("type", "deposit").lower(), "amount": float(row.get("amount", 0))}
        db["transactions"].append(txn)
        if not any(a["sportsbook"] == txn["sportsbook"] for a in db["accounts"]):
            db["accounts"].append({"sportsbook": txn["sportsbook"], "nickname": ""})
        count += 1
    return {"imported": count}

@app.get("/api/promotions")
def get_promotions(sport: Optional[str] = None, book: Optional[str] = None):
    promos = db["promotions"]
    if sport: promos = [p for p in promos if p["sport"] == sport]
    if book: promos = [p for p in promos if p["book"] == book]
    return promos

@app.post("/api/promotions")
def add_promotion(promo: Promotion):
    db["promotions"].append(promo.dict())
    return {"status": "ok"}

@app.get("/api/odds/{sport}")
async def get_odds(sport: str, markets: str = "h2h,spreads,totals"):
    if not ODDS_API_KEY:
        return {"error": "Set ODDS_API_KEY env var. Get key at https://the-odds-api.com"}
    params = {"apiKey": ODDS_API_KEY, "regions": "us", "markets": markets, "oddsFormat": "american", "bookmakers": "fanduel,draftkings,betmgm,williamhill_us"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{ODDS_API_BASE}/sports/{sport}/odds", params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return resp.json()

@app.get("/api/dashboard")
def dashboard_summary():
    total_dep = sum(t["amount"] for t in db["transactions"] if t["type"] == "deposit")
    return {"total_deposited": total_dep, "active_accounts": len(db["accounts"]), "active_promos": len(db["promotions"]), "recent_transactions": db["transactions"][-10:][::-1]}
