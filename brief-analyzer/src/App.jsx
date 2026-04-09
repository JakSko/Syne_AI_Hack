import { useState, useCallback } from 'react';

const SYSTEM_PROMPT = `You are an IT Role Requirements Analyst. Analyze the role brief and evaluate completeness across 10 sections. Return ONLY valid JSON, no markdown, no preamble.

JSON structure:
{
  "overall_score": 0-100,
  "summary": "one sentence assessment",
  "sections": [
    { "id": "job_title", "label": "Job Title / Role / Profile", "score": 0-100, "found": "string or null", "questions": ["q1","q2"] },
    { "id": "summary", "label": "Summary — We are looking for", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "cooperation", "label": "Form of Cooperation", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "competency", "label": "Key Competency", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "project", "label": "Project Description", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "role_description", "label": "Role Description", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "responsibilities", "label": "Main Responsibilities", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "must_have", "label": "Must Have Requirements", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "nice_to_have", "label": "Nice to Have", "score": 0-100, "found": "string or null", "questions": [] },
    { "id": "tech_stack", "label": "Tech Stack & Additional Info", "score": 0-100, "found": "string or null", "questions": [] }
  ]
}

SCORING: 0=not mentioned, 25=vaguely implied, 50=partial, 75=mostly complete, 100=fully specified.
Generate 2-4 questions for sections scoring below 75. Generate 0-1 for sections 75+.`;

const EXAMPLE_BRIEF =
  'We need a senior backend developer for a fintech project. Must know Java and Spring Boot. Nice to have Kafka experience. The team is 6 people, working in sprints. B2B contract, long term. Start ASAP.';

function scoreColor(score) {
  if (score >= 75) return '#059669';
  if (score >= 40) return '#D97706';
  return '#DC2626';
}

function scoreBg(score) {
  if (score >= 75) return 'bg-emerald-600';
  if (score >= 40) return 'bg-yellow-600';
  return 'bg-red-600';
}

export default function App() {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [screen, setScreen] = useState('input');

  const analyzeBrief = useCallback(async () => {
    if (!brief.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setChecked(new Set());

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: 'Analyze this role brief:\n\n' + brief },
          ],
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`API error ${res.status}: ${errBody}`);
      }

      const data = await res.json();
      let text = data.choices[0].message.content.trim();
      text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
      const parsed = JSON.parse(text);
      setResults(parsed);
      setScreen('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [brief]);

  const toggleCheck = (q) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(q)) next.delete(q);
      else next.add(q);
      return next;
    });
  };

  const copyAllQuestions = () => {
    if (!results) return;
    const allQ = results.sections
      .flatMap((s) => s.questions.map((q) => `[${s.label}] ${q}`))
      .join('\n');
    navigator.clipboard.writeText(allQ);
  };

  const sectionsWithQuestions = results
    ? results.sections.filter((s) => s.questions.length > 0)
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAV */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => setScreen(results ? 'dashboard' : 'input')}
        >
          Brief Analyzer
        </h1>
        {results && (
          <div className="flex gap-2">
            <button
              onClick={() => setScreen('dashboard')}
              className={`px-3 py-1 rounded text-sm ${screen === 'dashboard' ? 'bg-white text-gray-900 font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setScreen('checklist')}
              className={`px-3 py-1 rounded text-sm ${screen === 'checklist' ? 'bg-white text-gray-900 font-semibold' : 'bg-gray-700 hover:bg-gray-600'}`}
            >
              Checklist
            </button>
            <button
              onClick={() => {
                setResults(null);
                setScreen('input');
                setError(null);
              }}
              className="px-3 py-1 rounded text-sm bg-gray-700 hover:bg-gray-600"
            >
              New Analysis
            </button>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-6">
        {/* INPUT SCREEN */}
        {screen === 'input' && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              IT Role Requirements Analyzer
            </h2>
            <p className="text-gray-500 mb-6">
              Paste a role brief below and get an instant completeness analysis
              with follow-up questions.
            </p>

            <textarea
              className="w-full h-64 p-4 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder="Paste your role brief here..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={analyzeBrief}
                disabled={loading || !brief.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Brief'
                )}
              </button>

              <button
                onClick={() => setBrief(EXAMPLE_BRIEF)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Load Example
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD SCREEN */}
        {screen === 'dashboard' && results && (
          <div className="mt-8">
            <div className="text-center mb-10">
              <div
                className="text-8xl font-black"
                style={{ color: scoreColor(results.overall_score) }}
              >
                {results.overall_score}%
              </div>
              <p className="text-gray-600 mt-2 text-lg">{results.summary}</p>
            </div>

            <div className="space-y-4">
              {results.sections.map((section) => (
                <div key={section.id}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {section.label}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: scoreColor(section.score) }}
                    >
                      {section.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${scoreBg(section.score)}`}
                      style={{ width: `${section.score}%` }}
                    />
                  </div>
                  {section.found && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Found: {section.found}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHECKLIST SCREEN */}
        {screen === 'checklist' && results && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Follow-up Questions
              </h2>
              <button
                onClick={copyAllQuestions}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700"
              >
                Copy All Questions
              </button>
            </div>

            {sectionsWithQuestions.length === 0 ? (
              <p className="text-gray-500">
                No follow-up questions — the brief looks complete!
              </p>
            ) : (
              <div className="space-y-6">
                {sectionsWithQuestions.map((section) => (
                  <div
                    key={section.id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: scoreColor(section.score) }}
                      />
                      <h3 className="font-semibold text-gray-800">
                        {section.label}
                      </h3>
                      <span
                        className="text-sm font-bold ml-auto"
                        style={{ color: scoreColor(section.score) }}
                      >
                        {section.score}%
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {section.questions.map((q) => (
                        <li key={q} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={checked.has(q)}
                            onChange={() => toggleCheck(q)}
                            className="mt-1 h-4 w-4 rounded border-gray-300"
                          />
                          <span
                            className={`text-sm ${checked.has(q) ? 'line-through text-gray-400' : 'text-gray-700'}`}
                          >
                            {q}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
