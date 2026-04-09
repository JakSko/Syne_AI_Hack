import { useState, useCallback, useEffect } from 'react';

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

function scoreLabel(score) {
  if (score >= 75) return 'Complete';
  if (score >= 40) return 'Partial';
  return 'Missing';
}

function scoreBadgeClass(score) {
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 40) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200';
}

function scoreBarClass(score) {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function Icon({ name, className = '', filled = false }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-24 md:bottom-8 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold flex items-center gap-2 animate-[slideUp_0.3s_ease-out] ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
      <Icon name={type === 'success' ? 'check_circle' : 'error'} className="text-lg" filled />
      {message}
    </div>
  );
}

/* ─── Sidebar (Desktop) ─── */
function Sidebar({ screen, setScreen, results }) {
  const navItems = [
    { id: 'home', icon: 'dashboard', label: 'Dashboard' },
    { id: 'input', icon: 'add_circle', label: 'New Analysis' },
    ...(results ? [{ id: 'results', icon: 'description', label: 'Results' }] : []),
  ];
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-[60] w-72 flex-col p-6 bg-slate-50 border-r border-outline-variant/10">
      <div className="mb-10 mt-2 flex items-center gap-3">
        <Icon name="analytics" className="text-blue-700 text-3xl" />
        <span className="font-headline font-extrabold text-xl tracking-tighter text-on-surface">Analyzer</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left w-full ${
              screen === item.id
                ? 'text-blue-700 font-bold bg-white shadow-sm'
                : 'text-slate-500 hover:bg-blue-50 hover:translate-x-1'
            }`}
          >
            <Icon name={item.icon} filled={screen === item.id} />
            <span className="font-headline">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto p-5 bg-gradient-to-br from-slate-200/50 to-slate-100/50 rounded-2xl relative overflow-hidden">
        <Icon name="bolt" className="absolute -right-3 -bottom-3 text-7xl text-primary/10" />
        <p className="font-headline font-bold text-on-surface text-sm relative z-10">AI-Powered Analysis</p>
        <p className="text-xs text-on-surface-variant mt-1 relative z-10">GPT-4o brief analysis with structured scoring.</p>
      </div>
    </aside>
  );
}

/* ─── TopBar ─── */
function TopBar() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl flex justify-between items-center px-6 h-16 shadow-sm shadow-slate-200/50 md:pl-[19.5rem]">
      <div className="flex items-center gap-3 md:hidden">
        <Icon name="analytics" className="text-blue-700" />
        <span className="text-xl font-extrabold text-slate-900 tracking-tighter font-headline">Analyzer</span>
      </div>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors active:scale-95">
          <Icon name="notifications" className="text-slate-500" />
        </button>
        <div className="h-8 w-8 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-xs">PM</div>
      </div>
    </header>
  );
}

/* ─── BottomNav (Mobile) ─── */
function BottomNav({ screen, setScreen, results }) {
  const items = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'input', icon: 'add_circle', label: 'New' },
    ...(results ? [{ id: 'results', icon: 'folder_open', label: 'Results' }] : []),
  ];
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-2xl bg-white flex justify-around items-center h-20 px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] border-t border-slate-100">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id)}
          className={`flex flex-col items-center justify-center px-3 py-1 transition-all active:translate-y-0.5 ${
            screen === item.id
              ? 'text-blue-600 bg-blue-50 rounded-xl'
              : 'text-slate-400 hover:text-blue-500'
          }`}
        >
          <Icon name={item.icon} filled={screen === item.id} />
          <span className="font-headline text-[11px] font-semibold tracking-wide">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ─── Dashboard Screen ─── */
function DashboardScreen({ setScreen, analysisHistory }) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">
              Hello, PM.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
              Your analytical workspace is ready. Paste a role brief and get an instant completeness analysis.
            </p>
          </div>
          <p className="text-sm font-medium text-on-surface-variant uppercase tracking-widest bg-surface-container-low px-4 py-2 rounded-full hidden md:block">
            {today}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hero Card */}
        <div
          onClick={() => setScreen('input')}
          className="lg:col-span-8 group cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-container p-8 text-white shadow-xl shadow-blue-200/50 transition-all active:scale-[0.98] hover:shadow-2xl"
        >
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[240px]">
            <div>
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md mb-6">
                <Icon name="add_circle" className="text-white text-2xl" filled />
              </span>
              <h2 className="text-3xl font-bold mb-3 tracking-tight font-headline">Analyze New Brief</h2>
              <p className="text-blue-100 max-w-md text-lg font-medium leading-snug">
                Paste your role requirements and let AI evaluate completeness across 10 key sections in seconds.
              </p>
            </div>
            <div className="flex items-center gap-3 mt-8">
              <span className="text-sm font-bold uppercase tracking-wider">Get Started</span>
              <Icon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
        </div>

        {/* Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/10">
            <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest mb-4">Total Analyses</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-on-surface tracking-tighter font-headline">{analysisHistory.length}</span>
              <span className="text-primary font-bold">briefs</span>
            </div>
          </div>
          <div className="flex-1 bg-tertiary-fixed p-6 rounded-3xl">
            <p className="text-on-tertiary-fixed-variant text-xs font-bold uppercase tracking-widest mb-4">AI Engine</p>
            <div className="flex items-center gap-3">
              <Icon name="bolt" className="text-tertiary text-3xl" filled />
              <span className="text-2xl font-bold text-on-tertiary-fixed font-headline">GPT-4o</span>
            </div>
          </div>
        </div>

        {/* Recent analyses */}
        {analysisHistory.length > 0 && (
          <div className="lg:col-span-12">
            <h3 className="text-2xl font-bold tracking-tight font-headline mb-6">Recent Analyses</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysisHistory.slice(0, 3).map((item, i) => (
                <div key={i} className="bg-surface-container-lowest p-6 rounded-xl hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer border border-outline-variant/5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Icon name="description" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-black uppercase tracking-widest">
                      {item.score}%
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-on-surface mb-1 font-headline">{item.title}</h4>
                  <p className="text-on-surface-variant text-sm">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Input Screen ─── */
function InputScreen({ brief, setBrief, loading, error, onAnalyze }) {
  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">New Analysis</h1>
        <p className="text-on-surface-variant text-lg max-w-2xl">
          Paste your role brief text to initiate the AI-driven structural analysis.
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-12 flex items-center justify-between max-w-md mx-auto">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm ring-4 ring-primary-fixed">1</div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Input</span>
        </div>
        <div className="h-0.5 flex-1 bg-surface-container-highest mx-4" />
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-sm">2</div>
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Analyze</span>
        </div>
        <div className="h-0.5 flex-1 bg-surface-container-highest mx-4" />
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-sm">3</div>
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Results</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Textarea */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-6">
              <Icon name="notes" className="text-secondary" />
              <h3 className="text-lg font-bold font-headline">Paste brief text</h3>
            </div>
            <textarea
              className="w-full h-72 bg-surface-container-low border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 resize-none shadow-inner font-body"
              placeholder="Paste your role brief requirements here..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60">
                {brief.length} characters
              </span>
              {brief && (
                <button onClick={() => setBrief('')} className="text-primary font-bold text-sm hover:underline">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <button
            onClick={() => setBrief(EXAMPLE_BRIEF)}
            className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm border-2 border-dashed border-outline-variant hover:border-primary/40 transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Icon name="science" className="text-primary text-3xl" />
            </div>
            <h3 className="text-base font-bold mb-1 font-headline">Load Example Brief</h3>
            <p className="text-on-surface-variant text-sm">Try with a sample role brief to see how the analysis works.</p>
          </button>

          <div className="bg-tertiary-fixed/30 p-6 rounded-2xl border border-tertiary-fixed-dim/20">
            <div className="flex items-start gap-4">
              <Icon name="info" className="text-tertiary" />
              <div>
                <h4 className="font-bold text-tertiary mb-1 font-headline">Analysis Tip</h4>
                <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed">
                  For best results, include as much detail as possible about the role — job title, responsibilities, requirements, project context, and cooperation model.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 p-5 bg-error-container/20 border border-error/20 rounded-2xl flex items-start gap-3 animate-[fadeIn_0.3s_ease-out]">
          <Icon name="error" className="text-error mt-0.5" />
          <div>
            <p className="font-bold text-error text-sm mb-1">Analysis Failed</p>
            <p className="text-xs text-on-error-container">{error}</p>
          </div>
        </div>
      )}

      {/* Bottom buttons */}
      <div className="mt-12 flex items-center justify-between py-6">
        <div />
        <button
          onClick={onAnalyze}
          disabled={loading || !brief.trim()}
          className="flex items-center gap-3 bg-primary text-on-primary px-10 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-xl shadow-primary/25 hover:shadow-primary/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyzing...
            </>
          ) : (
            <>
              Analyze Brief
              <Icon name="arrow_forward" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Results Screen ─── */
function ResultsScreen({ results, unchecked, toggleCheck, copyAllQuestions, copyPulse }) {
  const sectionsWithQuestions = results.sections.filter((s) => s.questions.length > 0);
  const highSections = results.sections.filter((s) => s.score >= 75);
  const lowSections = results.sections.filter((s) => s.score < 75);

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-widest rounded">Analysis Complete</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold font-headline text-on-surface tracking-tight leading-tight">
          Brief <span className="text-primary">Results</span>
        </h2>
        <p className="mt-3 text-on-surface-variant max-w-2xl text-lg leading-relaxed">{results.summary}</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Overall Score Card */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/10 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-white/20 rounded-xl">
                <Icon name="auto_awesome" filled />
              </div>
              <h3 className="font-headline font-bold text-xl">Overall Score</h3>
            </div>
            <div className="relative z-10 text-center py-4">
              <span className="text-7xl font-black tracking-tighter font-headline">{results.overall_score}</span>
              <span className="text-3xl font-bold">%</span>
            </div>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mt-4 relative z-10">
              <div className="bg-white h-full rounded-full transition-all" style={{ width: `${results.overall_score}%` }} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-sm border border-outline-variant/10">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2 mb-4">
              <Icon name="pie_chart" className="text-primary" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Complete sections</span>
                <span className="text-sm font-bold text-emerald-600">{highSections.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Needs improvement</span>
                <span className="text-sm font-bold text-amber-600">{lowSections.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-on-surface-variant">Follow-up questions</span>
                <span className="text-sm font-bold text-primary">{results.sections.reduce((a, s) => a + s.questions.length, 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Column */}
        <div className="md:col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Section Scores */}
          <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm border border-outline-variant/10">
            <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2 mb-6">
              <Icon name="assessment" className="text-primary" />
              Section Scores
            </h3>
            <div className="space-y-5">
              {results.sections.map((section, idx) => (
                <div key={section.id} className="animate-[fadeIn_0.4s_ease-out]" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-on-surface">{section.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${scoreBadgeClass(section.score)}`}>
                        {scoreLabel(section.score)}
                      </span>
                      <span className="text-sm font-black w-10 text-right" style={{ color: scoreColor(section.score) }}>
                        {section.score}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2.5 rounded-full bg-surface-container-low">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${scoreBarClass(section.score)}`}
                      style={{ width: `${section.score}%`, animationDelay: `${idx * 50 + 200}ms` }}
                    />
                  </div>
                  {section.found && (
                    <p className="text-xs text-on-surface-variant mt-1.5 italic flex items-center gap-1">
                      <Icon name="search" className="text-xs" /> {section.found}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Follow-up Questions */}
          {sectionsWithQuestions.length > 0 && (
            <div className="p-8 rounded-3xl bg-surface-container-lowest shadow-sm border border-outline-variant/10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-headline font-bold text-xl text-on-surface flex items-center gap-2">
                  <Icon name="help_outline" className="text-primary" />
                  Follow-up Questions
                </h3>
                <button
                  onClick={copyAllQuestions}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-outline-variant/30 text-on-surface hover:bg-surface-container-low transition-all active:scale-95 ${copyPulse ? 'ring-2 ring-primary/30' : ''}`}
                >
                  <Icon name="content_copy" className="text-base" />
                  Copy Checked
                </button>
              </div>

              <div className="space-y-5">
                {sectionsWithQuestions.map((section) => (
                  <div key={section.id} className="p-5 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: scoreColor(section.score) }} />
                      <h4 className="font-headline font-bold text-sm text-on-surface">{section.label}</h4>
                      <span className="text-xs font-bold ml-auto" style={{ color: scoreColor(section.score) }}>
                        {section.score}%
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {section.questions.map((q, qIdx) => {
                        const isChecked = !unchecked.has(q);
                        return (
                          <li
                            key={q}
                            className="flex items-start gap-3 p-2 rounded-xl hover:bg-surface-container-lowest transition-colors cursor-pointer group"
                            onClick={() => toggleCheck(q)}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="mt-0.5 h-4 w-4 rounded border-outline-variant accent-primary pointer-events-none"
                            />
                            <span className="text-sm text-on-surface-variant font-mono w-5 shrink-0">{qIdx + 1}.</span>
                            <span className={`text-sm transition-all ${isChecked ? 'text-on-surface' : 'line-through text-on-surface-variant/40'}`}>
                              {q}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={copyAllQuestions}
                  className={`flex items-center gap-3 bg-primary text-on-primary px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20 hover:shadow-primary/40 ${copyPulse ? 'animate-[popIn_0.3s_ease-out]' : ''}`}
                >
                  <Icon name="content_copy" />
                  Copy Checked Questions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [unchecked, setUnchecked] = useState(new Set());
  const [screen, setScreen] = useState('home');
  const [toast, setToast] = useState(null);
  const [copyPulse, setCopyPulse] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  const analyzeBrief = useCallback(async () => {
    if (!brief.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setUnchecked(new Set());

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
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
      setAnalysisHistory((prev) => [
        { title: brief.slice(0, 60) + (brief.length > 60 ? '...' : ''), score: parsed.overall_score, summary: parsed.summary },
        ...prev,
      ]);
      setScreen('results');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [brief]);

  const toggleCheck = (q) => {
    setUnchecked((prev) => {
      const next = new Set(prev);
      if (next.has(q)) next.delete(q);
      else next.add(q);
      return next;
    });
  };

  const formatQuestionsForCopy = () => {
    if (!results) return '';
    return results.sections
      .filter((s) => s.questions.length > 0)
      .map((s) => {
        const questions = s.questions
          .filter((q) => !unchecked.has(q))
          .map((q, i) => `${i + 1}. ${q}`);
        if (questions.length === 0) return null;
        return `${s.label}\n${questions.join('\n')}`;
      })
      .filter(Boolean)
      .join('\n\n');
  };

  const copyAllQuestions = async () => {
    const text = formatQuestionsForCopy();
    if (!text) {
      setToast({ message: 'No checked questions to copy', type: 'error' });
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopyPulse(true);
      setTimeout(() => setCopyPulse(false), 400);
      setToast({ message: 'Questions copied to clipboard!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to copy — please try again', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0% { transform: scale(0.95); }
          60% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Sidebar screen={screen} setScreen={setScreen} results={results} />
      <TopBar />
      <BottomNav screen={screen} setScreen={setScreen} results={results} />

      <main className="md:pl-72 pt-24 px-4 md:px-8 max-w-7xl mx-auto">
        {screen === 'home' && (
          <DashboardScreen setScreen={setScreen} analysisHistory={analysisHistory} />
        )}
        {screen === 'input' && (
          <InputScreen
            brief={brief}
            setBrief={setBrief}
            loading={loading}
            error={error}
            onAnalyze={analyzeBrief}
          />
        )}
        {screen === 'results' && results && (
          <ResultsScreen
            results={results}
            unchecked={unchecked}
            toggleCheck={toggleCheck}
            copyAllQuestions={copyAllQuestions}
            copyPulse={copyPulse}
          />
        )}
      </main>
    </div>
  );
}
