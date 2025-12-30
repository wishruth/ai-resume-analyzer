# AI Resume Intelligence & Skill-Gap Analyzer

A high-performance, full-stack application that uses Natural Language Processing (NLP) to calculate semantic similarity between resumes and job descriptions. It identifies missing technical keywords and provides actionable career advice.

## Live Demo (Local Preview)
-------------------------
Since this project is optimized for local ML performance, please see the screenshots below for a full feature walkthrough.

## 📋 Table of Contents
--------------------
[Features](#-features)

[NLP Engine Details](#-NLPEngineDetails)

[Tech Stack](#-TechStack)

[Project Structure](#-ProjectStructure)

[Screenshots & Demo](#-Screenshots&Demo)

[Installation & Setup](#-Installation&Setup)


## Features
---------------
### 🧠 Intelligent Match Engine

Semantic Scoring: Uses the all-MiniLM-L6-v2 transformer model to understand the context of your experience, not just exact keywords.

Skill Gap Analysis: Automatically cross-references your resume against a database of 100+ technical engineering skills.

Pro-Tip Generator: Dynamically suggests the top 3 most impactful skills to add to your resume to increase your score.




### 📄 Document Processing

PDF Extraction: Robust text extraction using pdfplumber to handle complex multi-column resume layouts.

Real-time Feedback: Instant visual feedback with a loading spinner while the AI "thinks."




### 🎨 Modern UI/UX

Dark Mode Interface: Built with Tailwind CSS for a sleek, developer-centric aesthetic.

Dynamic Chips: Visual green/red "Skill Chips" for immediate clarity on what you have and what you lack.



## NLP Engine Details
-------------------
The core intelligence of this application relies on Sentence Embeddings rather than simple keyword matching. This allows the system to understand that a resume mentioning "Expertise in developing RESTful services" is a strong match for a job description requiring "Backend API development experience."
- **Vector Embeddings**(all-MiniLM-L6-v2): We utilize the Sentence-Transformers framework to convert raw text into high-dimensional vectors (384 dimensions).Model: all-MiniLM-L6-v2Why this model?: It is specifically optimized for semantic search and sentence similarity, providing a perfect balance between speed (low latency for local execution) and accuracy.
- **Semantic Similarity Calculation**: Instead of counting word frequency, we calculate the Cosine Similarity between the resume vector ($u$) and the job description vector ($v$).The similarity score is determined by:$$\text{similarity} = \cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$Score of 1.0: Perfect semantic alignment.Score of 0.0: No contextual relationship.
- **Skill Extraction Pipeline**: The backend executes a multi-stage pipeline:Text Normalization: Stripping noise from PDFs using pdfplumber.Tokenization: Breaking text into manageable semantic units.Keyword Intersection: Cross-referencing extracted tokens against our TECH_SKILLS_DB using high-performance Python sets for $O(1)$ lookup time.

🛠️ Tech Stack
---------------------
### Frontend:
- **React 18** - Component-based UI
- **Vite** - High-speed development server
- **Tailwind CSS** - Modern styling & layout
- **Lucide React** - High-quality iconography

### Backend:
- **FastAPI** - High-performance Python framework
- **Sentence-Transformers** - State-of-the-art NLP embeddings
- **PyTorch** - Machine learning backend
- **Uvicorn** - ASGI server implementation
- **PDFPlumber** - Text extraction
- **Scikit-learn** - Industry-standard machine learning library used specifically for its cosine_similarity function to calculate the final match score between resume and job description vectors.

### Environment: 
- Cross-origin Resource Sharing (CORS) configured for local development.

📁 Project Structure
---------------------

```
ai-resume-matcher/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── App.jsx        # Main Logic & State Management
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Tailwind directives
│   ├── .env.example       # Template for environment variables
│   └── package.json
│
├── backend/                # FastAPI application
│   ├── main.py            # API Endpoints & NLP Logic
│   ├── requirements.txt   # Python dependencies
│   └── venv/              # Local virtual environment
│
└── README.md
```
📸 Screenshots & Demo
---------------------
1. The Dashboard

2. Match Results & Skill Gap

Installation & Setup
--------------------
1. Clone the Repository
```
git clone https://github.com/your-username/ai-resume-matcher.git
cd ai-resume-matcher
```

2. Backend Setup
```
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

3. Frontend Setup
```
cd ../frontend
npm install
cp .env.example .env
npm run dev
```
