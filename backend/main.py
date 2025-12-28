from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer, util
import pdfplumber 
import io
import re
import torch
from pydantic import BaseModel

class AnalyzeRequest(BaseModel):
    resume_text: str
    jd_text: str

model = SentenceTransformer('all-MiniLM-L6-v2')

app = FastAPI()

@app.get("/")
def home():
    return {"message": "API is running! Use /docs to test endpoints."}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_text(text: str):
    # NLP cleaning of unnecessary characters and space
    text = text.replace('\n', ' ')
    text = re.sub(r'[^\w\s.,@-]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text 

TECH_SKILLS_DB = [
    # Languages & Core CS
    "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "php", "swift", "sql", "c",
    "data structures", "algorithms", "object oriented programming", "oop", "r",
    # Frontend & Mobile
    "react", "next.js", "vue", "angular", "html", "css", "tailwind", "sass", "react native", "flutter",
    # Backend / DB / API
    "fastapi", "flask", "django", "node.js", "express", "postgresql", "mongodb", "mysql", "redis", "supabase",
    "rest api", "graphql", "grpc", "microservices",
    # Cloud / DevOps / Tools
    "aws", "azure", "google cloud", "gcp", "docker", "kubernetes", "jenkins", "terraform", "git", "github", 
    "linux", "unix", "bash", "shell", "firebase",
    # AI / Data Science / Math
    "machine learning", "deep learning", "pytorch", "tensorflow", "pandas", "numpy", "scikit-learn", 
    "keras", "opencv", "natural language processing", "nlp", "llm", "statistics", "linear algebra",
    # Hardware & Engineering
    "electrical engineering", "computer engineering", "embedded systems", "microcontrollers", "arduino", 
    "raspberry pi", "verilog", "vhdl", "fpga", "matlab", "solidworks", "cad", "signal processing", 
    "pcb design", "circuit analysis", "oscilloscope"
]

def extract_skills(text: str):
    text_lower = text.lower()
    found_skills = []
    for skill in TECH_SKILLS_DB:
        pattern = rf"\b{re.escape(skill.lower())}\b"
        if re.search(pattern, text_lower):
            found_skills.append(skill)
    return set(found_skills)

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    # only allow pdfs
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    try:
        content = await file.read()
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            raw_text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    raw_text += page_text + " "
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
        
        cleaned = clean_text(raw_text)

        return {
            "filename": file.filename,
            "text": cleaned
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/analyze")
async def analyze_resume(data: AnalyzeRequest):
    try: 
        resume_embedding = model.encode(data.resume_text, convert_to_tensor = True)
        jd_embedding = model.encode(data.jd_text, convert_to_tensor = True)

        cosine_score = util.cos_sim(resume_embedding, jd_embedding)

        match_percentage = round(float(cosine_score[0][0]) * 100, 2)

        resume_skills = extract_skills(data.resume_text)
        jd_skills = extract_skills(data.jd_text)

        matched_skills = list(resume_skills.intersection(jd_skills))
        missing_skills = list(jd_skills - resume_skills)

        return {
            "match_score": match_percentage,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))
        


