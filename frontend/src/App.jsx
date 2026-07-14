import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BookOpen, Layers, Book, Target, Settings2, FileText, CheckCircle2, Circle, Lightbulb, GraduationCap, Sparkles, Download } from 'lucide-react';
import 'katex/dist/katex.min.css';
import ReactFlowDiagram from './components/ReactFlowDiagram';

const MATH_SYMBOLS = [
  '∫ x² dx = x³/3 + C', 'dy/dx = f\'(x)', '∇²f = 0', 'e^(iπ) + 1 = 0', 
  '∮ E·da = Q/ε₀', '∑(1/n²)', 'lim(x→∞)', 'd²y/dx² + ω²y = 0',
  '△', '○', '□', '◇', '▱', '⬡', '∑', '∫', 'π', '∞'
];

const FloatingSymbols = () => {
  const symbols = useRef(
    Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      char: MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)],
      left: `${Math.random() * 100}vw`,
      fontSize: `${Math.random() * 1.5 + 1}rem`,
      animationDuration: `${Math.random() * 20 + 20}s`,
      animationDelay: `-${Math.random() * 40}s`
    }))
  ).current;

  return (
    <>
      {symbols.map(s => (
        <div 
          key={s.id} 
          className="floating-symbol"
          style={{
            left: s.left,
            fontSize: s.fontSize,
            animationDuration: s.animationDuration,
            animationDelay: s.animationDelay
          }}
        >
          {s.char}
        </div>
      ))}
    </>
  );
};

function App() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const [stream, setStream] = useState('Computer Science');
  const [semester, setSemester] = useState('1');
  const [subject, setSubject] = useState('');
  const [moduleNum, setModuleNum] = useState('1');
  const [topics, setTopics] = useState('');
  const [depth, setDepth] = useState('exam');
  const [includeExamples, setIncludeExamples] = useState(false);
  const [includeTips, setIncludeTips] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [error, setError] = useState('');
  
  const notesRef = useRef(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!topics.trim()) {
      setError('Please enter the module topics.');
      return;
    }
    if (!subject.trim()) {
      setError('Please enter the subject name.');
      return;
    }

    setIsGenerating(true);
    setGeneratedNotes('');

    try {
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream,
          semester,
          subject,
          moduleNum,
          topics,
          depth,
          includeExamples,
          includeTips
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate notes');
      }

      const text = data.data;
      
      // Aggressive preprocessing to fix AI formatting errors
      const cleanText = text
        .replace(/`\$(.*?)\$`/g, '$$$1$$')
        .replace(/`\$\$(.*?)\$\$`/gs, '$$$$$1$$$$')
        .replace(/```(?:math|latex|tex)\n([\s\S]*?)```/gi, '$$$$\n$1\n$$$$');
      
      setGeneratedNotes(cleanText);
      setTimeout(() => {
        notesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while generating notes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadHTML = () => {
    if (!notesRef.current) return;
    
    const htmlContent = notesRef.current.innerHTML;
    
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject} - Module ${moduleNum} Notes</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <style>
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background-color: #f8fafc;
        padding: 40px;
        color: #333333;
        line-height: 1.6;
      }
      .textbook-theme {
        max-width: 900px;
        margin: 0 auto;
        background: white;
        padding: 60px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      .textbook-theme h1 {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 2.8rem;
        color: #1a365d;
        text-align: center;
        margin-top: 20px;
        margin-bottom: 20px;
        font-weight: 700;
      }
      .textbook-theme h2 {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 2rem;
        color: #1a365d;
        border-bottom: 2px solid #3b82f6;
        padding-bottom: 10px;
        margin-top: 40px;
        margin-bottom: 20px;
        font-weight: 600;
      }
      .textbook-theme h1 + h2 {
        text-align: center;
        border-bottom: none;
        font-size: 1.8rem;
        color: #1a365d;
        margin-top: 10px;
      }
      .textbook-theme hr {
        border: none;
        border-top: 2px solid #3b82f6;
        margin: 40px 0;
      }
      .textbook-theme h3 {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: 1.4rem;
        color: #2563eb;
        margin-top: 30px;
        margin-bottom: 15px;
        font-weight: 600;
      }
      .textbook-theme p, .textbook-theme ul, .textbook-theme ol {
        font-size: 11pt;
        margin-bottom: 15px;
        color: #333333;
      }
      .textbook-theme pre {
        background: #f8fafc;
        color: #1e293b;
        padding: 15px;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        overflow-x: auto;
        font-family: 'Courier New', Courier, monospace;
        font-size: 10pt;
        margin-bottom: 20px;
      }
      .textbook-theme code {
        font-family: 'Courier New', Courier, monospace;
        background: #f1f5f9;
        padding: 2px 6px;
        border-radius: 4px;
        color: #0f172a;
        font-weight: 500;
      }
      .textbook-theme table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      .textbook-theme th, .textbook-theme td {
        border: 1px solid #e2e8f0;
        padding: 14px;
        text-align: left;
      }
      .textbook-theme th {
        background: #2563eb;
        color: white;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.9rem;
        letter-spacing: 0.05em;
      }
      .textbook-theme blockquote {
        background: #f0fdf4;
        border-left: 5px solid #22c55e;
        padding: 15px 20px;
        margin: 20px 0;
        color: #166534;
        border-radius: 0 4px 4px 0;
      }
    </style>
</head>
<body>
    <div class="textbook-theme">
        ${htmlContent}
    </div>
</body>
</html>`;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Module_${moduleNum}_${stream}_Notes.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <FloatingSymbols />
      <header className="hero" style={{ position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.35rem 1rem', borderRadius: '20px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.5rem', boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)' }}>
          <Sparkles size={16} /> AI Powered
        </div>
        <h1>Note Sphere</h1>
        <p>Premium engineering notes at zero cost. Paste your syllabus topics and generate textbook-quality study materials instantly.</p>
      </header>

      <div className="glass-panel">
        <form onSubmit={handleGenerate}>
          <div className="form-grid">
            <div className="form-group">
              <label><Book size={16} /> Engineering Stream</label>
              <select value={stream} onChange={(e) => setStream(e.target.value)}>
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Electrical">Electrical</option>
                <option value="Electronics">Electronics</option>
                <option value="Information Technology">Information Technology</option>
              </select>
            </div>

            <div className="form-group">
              <label><GraduationCap size={16} /> Semester</label>
              <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                <option value="1">Semester 1</option>
                <option value="2">Semester 2</option>
                <option value="3">Semester 3</option>
                <option value="4">Semester 4</option>
                <option value="5">Semester 5</option>
                <option value="6">Semester 6</option>
                <option value="7">Semester 7</option>
                <option value="8">Semester 8</option>
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label><BookOpen size={16} /> Subject Name</label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Data Structures and Algorithms"
              />
            </div>

            <div className="form-group">
              <label><Layers size={16} /> Module Number</label>
              <select value={moduleNum} onChange={(e) => setModuleNum(e.target.value)}>
                <option value="1">Module 1</option>
                <option value="2">Module 2</option>
                <option value="3">Module 3</option>
                <option value="4">Module 4</option>
                <option value="5">Module 5</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label><Target size={16} /> Module Topics</label>
            <div className="textarea-wrapper">
              <textarea 
                rows="4" 
                value={topics} 
                onChange={(e) => setTopics(e.target.value)}
                placeholder="List your syllabus topics here (e.g., Arrays, Linked Lists, Binary Trees...)"
              ></textarea>
              <span className="char-count">{topics.length} chars</span>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label><Settings2 size={16} /> Focus & Depth</label>
              <div className="segmented-control">
                <button 
                  type="button" 
                  className={`segment-btn ${depth === 'exam' ? 'active' : ''}`}
                  onClick={() => setDepth('exam')}
                >
                  Exam Oriented
                </button>
                <button 
                  type="button" 
                  className={`segment-btn ${depth === 'indepth' ? 'active' : ''}`}
                  onClick={() => setDepth('indepth')}
                >
                  In-Depth Learning
                </button>
              </div>
            </div>

            <div className="form-group">
              <label><Lightbulb size={16} /> Enhancements</label>
              <div className="toggle-card-group">
                <div 
                  className={`toggle-card ${includeExamples ? 'active' : ''}`}
                  onClick={() => setIncludeExamples(!includeExamples)}
                >
                  <div className="toggle-card-icon">
                    {includeExamples ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  <div className="toggle-card-content">
                    <span className="toggle-card-title">Examples</span>
                    <span className="toggle-card-desc">Add code/scenarios</span>
                  </div>
                </div>
                <div 
                  className={`toggle-card ${includeTips ? 'active' : ''}`}
                  onClick={() => setIncludeTips(!includeTips)}
                >
                  <div className="toggle-card-icon">
                    {includeTips ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </div>
                  <div className="toggle-card-content">
                    <span className="toggle-card-title">Exam Tips</span>
                    <span className="toggle-card-desc">Add common questions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && <div style={{color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px'}}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={isGenerating} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            {isGenerating ? (
              <><span className="loader"></span> Generating Notes... This may take a few minutes.</>
            ) : (
              <><FileText size={20} /> Generate Professional Notes</>
            )}
          </button>
          {generatedNotes && !isGenerating && (
            <div style={{ marginTop: '1rem', textAlign: 'center', color: '#10b981', fontWeight: '500' }}>
              ✅ Notes generated successfully! Scroll down to view them.
            </div>
          )}
        </form>
      </div>

      {generatedNotes && (
        <div className="results-container">
          <div className="results-header">
            <h2>Your Generated Notes</h2>
            <button className="btn btn-secondary" onClick={handleDownloadHTML} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={16} /> Download HTML
            </button>
          </div>
          <div className="glass-panel" style={{ padding: '0' }}>
            <div 
              className="markdown-body textbook-theme" 
              ref={notesRef}
            >
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-([\w-]+)/.exec(className || '')
                    if (!inline && match && match[1] === 'diagram-json') {
                      return <ReactFlowDiagram data={String(children).replace(/\n$/, '')} />
                    }
                    return <code className={className} {...props}>{children}</code>
                  }
                }}
              >
                {generatedNotes}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
