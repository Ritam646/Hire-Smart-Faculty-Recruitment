from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from ai_workflow import run_ai_workflow
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
load_dotenv()

app = FastAPI()
import traceback  # Add at top

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), job_dept: str = "Computer Science"):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes supported")

    temp_path = f"/tmp/{file.filename}"
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = run_ai_workflow(temp_path, job_dept)

        # Store in Supabase (add try/except if needed)
        supabase.table("candidates").insert({
            "name": result.get("name", "Unknown"),
            "score": result["score"],
            "ranking": result["ranking"],
            "interview_questions": result["interview_questions"]
        }).execute()

        return result

    except Exception as e:
        traceback.print_exc()  # This will show the real error in your backend terminal!
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
# CORS for frontend (update origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase client
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...), job_dept: str = "Computer Science"):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes supported")

    # Save temporary file
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # Run AI workflow
    result = run_ai_workflow(temp_path, job_dept)

    # Store in Supabase
    supabase.table("candidates").insert({
        "name": result.get("name", "Unknown"),
        "score": result["score"],
        "ranking": result["ranking"],
        "interview_questions": result["interview_questions"]
    }).execute()

    os.remove(temp_path)
    return result

@app.get("/candidates")
async def get_candidates():
    response = supabase.table("candidates").select("*").execute()
    return response.data


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for hackathon demo (change to your frontend URL in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)