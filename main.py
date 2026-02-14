from fastapi import FastAPI, Request, HTTPException, Query, Header, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, date
import os

from database import init_db, get_db
from service import LocationService, APIKeyService

app = FastAPI(title="Manadia Location Logger")

# Initialize database on startup
@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def health_check():
    """Health check endpoint"""
    return {"status": "running", "message": "Location logger is active"}


@app.post("/pub")
async def receive_location(request: Request, db: Session = Depends(get_db)):
    """
    Receive location data from OwnTracks.
    No authentication required (handled by Caddy basicauth).
    """
    try:
        data = await request.json()
        service = LocationService(db)
        location = service.ingest_location(data)
        return []
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


def verify_api_key(x_api_key: str = Header(None), db: Session = Depends(get_db)) -> dict:
    """
    Verify API key from header.
    Returns key info if valid.
    """
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="API key required",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    service = APIKeyService(db)
    if not service.verify_api_key(x_api_key):
        raise HTTPException(status_code=403, detail="Invalid API key")
    
    return service.get_api_key_info(x_api_key)


@app.get("/history")
async def get_all_history(
    db: Session = Depends(get_db),
    limit: int = Query(None, gt=0, le=10000),
    offset: int = Query(0, ge=0),
    key_info: dict = Depends(verify_api_key)
):
    """
    Get all location history with pagination.
    Requires valid API key.
    """
    service = LocationService(db)
    return service.get_history(limit=limit, offset=offset)


@app.get("/history/date")
async def get_history_by_date(
    query_date: str = Query(..., description="Date in YYYY-MM-DD format"),
    db: Session = Depends(get_db),
    key_info: dict = Depends(verify_api_key)
):
    """
    Get location history for a specific date.
    Requires valid API key.
    """
    try:
        target_date = datetime.strptime(query_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    service = LocationService(db)
    return service.get_history_by_date(target_date)


@app.get("/history/device/{device_id}")
async def get_device_history(
    device_id: str,
    db: Session = Depends(get_db),
    key_info: dict = Depends(verify_api_key)
):
    """
    Get all location history for a specific device.
    Requires valid API key.
    """
    service = LocationService(db)
    return service.get_device_history(device_id)


@app.post("/admin/generate-api-key")
async def generate_api_key(
    user_name: str = Query(...),
    description: str = Query(None),
    db: Session = Depends(get_db)
):
    """
    Generate a new API key for a user.
    Protected by Caddy basicauth at /admin/* path.
    """
    service = APIKeyService(db)
    result = service.generate_api_key(user_name, description)
    return {**result, "message": "API key generated successfully"}


@app.post("/admin/revoke-api-key")
async def revoke_api_key(
    api_key: str = Query(...),
    db: Session = Depends(get_db)
):
    """
    Revoke an API key.
    Protected by Caddy basicauth at /admin/* path.
    """
    service = APIKeyService(db)
    success = service.revoke_api_key(api_key)
    if success:
        return {"message": "API key revoked successfully"}
    else:
        raise HTTPException(status_code=404, detail="API key not found")