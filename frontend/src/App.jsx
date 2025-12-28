import { useState } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [extractedText, setExtractedText] = useState("")
  const [loading, setLoading] = useState(false)
  const [jobDescription, setJobDescription] = useState("");
  const [matchScore, setMatchScore] = useState(null);
  const [analysisData, setAnalysisData] = useState({ matched: [], missing: [] });
  const API_URL = import.meta.env.VITE_API_URL;

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setExtractedText("");
    setMatchScore(null);
    setAnalysisData({matched: [], missing: []});

    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
  };

  const uploadResume = async() => {
    if (!file) return alert ("Select a pdf first")

    setLoading(true)
    const formData = new FormData();
    formData.append("file", file); 

    try {
      const response = await fetch(`${API_URL}/extract-text`, {
        method: "POST",
        body: formData,
    })
    const data = await response.json()

    const resumeText = data.text;

    const analyzeResponse = await fetch(`${API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_text: resumeText,
        jd_text: jobDescription
      })
    }); 


    const result = await analyzeResponse.json();

    console.log("Full Backend Result:", result);

    setAnalysisData({
      matched: result.matched_skills || [],
      missing: result.missing_skills || []
    });

    setMatchScore(result.match_score);

    setExtractedText(data.text)
  } catch(error) {
    console.error("Upload Failed:", error)
    alert("Backend isn't responding, check if it's running?")
  } finally {
    setLoading(false)
  }
}

return (
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-400">AI Resume Intelligence</h1>
          <p className="text-slate-400 mt-2 text-lg italic">Semantic Matcher & Skill Gap Analyzer Active</p>
        </header>

        <div className="mb-6">
          <label className="block text-blue-300 font-bold mb-2 text-left">Job Description</label>
          <textarea
            className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-300 focus:border-blue-500 outline-none"
            placeholder="Paste the job requirements here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileChange}
              className="file:bg-blue-600 file:text-white file:border-none file:px-4 file:py-2 file:rounded-lg cursor-pointer hover:file:bg-blue-500 transition"
            />
            <div className="flex gap-4 w-full">
              <button 
                onClick={uploadResume}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                  loading 
                    ? 'bg-slate-700 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-900/20 active:scale-95'
                }`}
              > 
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                    <span>AI is Analyzing...</span>
                  </div>
                ) : (
                  "Analyze Match"
                )}
              </button>
              {/* The Reset button only appears if we have a match score */}
              {matchScore !== null && (
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-bold transition border border-slate-600 hover:text-white"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </section>

        {matchScore !== null && (
        <section className="bg-slate-800 p-8 rounded-2xl border-2 border-green-500/50 shadow-lg text-center animate-in fade-in zoom-in duration-500">
          <h2 className="text-2xl font-bold text-slate-400 uppercase tracking-widest">Match Score</h2>
          <div className={`text-6xl font-black my-4 transition-colors duration-500 ${
            matchScore >= 75 ? 'text-green-400' : 
            matchScore >= 50 ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            {matchScore}%
          </div>
          <p className="text-slate-400 font-medium">
            {matchScore > 75 ? "🔥 Strong Match!" : matchScore > 50 ? "⚡ Decent Alignment" : "⚠️ Low Similarity"}
          </p>
        </section>
        )}

        {/* Skill Gap Analysis Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-slate-800 p-5 rounded-2xl border border-green-500/20 shadow-lg">
            <h3 className="text-green-400 font-bold mb-4 flex items-center gap-2">
              ✅ Matched Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysisData.matched.length > 0 ? analysisData.matched.map(skill => (
                <span key={skill} className="px-3 py-1 bg-green-900/30 text-green-300 rounded-lg text-xs font-medium border border-green-500/20 uppercase">
                  {skill}
                </span>
              )) : <p className="text-slate-500 text-sm italic">No direct matches found.</p>}
           </div>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-red-500/20 shadow-lg">
            <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2">
              ❌ Missing from Resume
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysisData.missing.length > 0 ? analysisData.missing.map(skill => (
                <span key={skill} className="px-3 py-1 bg-red-900/30 text-red-300 rounded-lg text-xs font-medium border border-red-500/20 uppercase">
                  {skill}
                </span>
              )) : <p className="text-slate-500 text-sm italic">You have all the detected skills!</p>}
            </div>
          </div>
        </div>

        {analysisData.missing.length > 0 && (
          <div className="mt-6 p-6 bg-blue-900/20 border border-blue-500/30 rounded-2xl animate-in fade-in zoom-in duration-1000">
            <h3 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
              💡 Pro-Tip to Increase Your Score
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your match score is currently impacted by missing mentions of 
              <span className="text-blue-200 font-bold mx-1">
                {analysisData.missing.slice(0, 3).join(", ")}
              </span>. 
              Try integrating these keywords into your 
              <span className="italic text-slate-400 ml-1">Work Experience</span> or 
              <span className="italic text-slate-400 ml-1">Projects</span> sections 
              to better align with this specific role.
            </p>
          </div>
        )}

        {extractedText && (
          <section className="bg-slate-800 p-6 rounded-2xl border border-blue-500/50 shadow-inner">
            <h2 className="text-xl font-bold mb-4 text-blue-300">Cleaned Resume Content:</h2>
            <div className="text-slate-300 text-sm h-64 overflow-y-auto leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-4 rounded-lg">
              {extractedText}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default App 