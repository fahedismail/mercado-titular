"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowLeft, CheckCircle2, ChevronRight, ClipboardList, Download,
  FileText, FolderOpen, LayoutDashboard, Lock, LogOut, Menu, MessageSquare,
  RefreshCw, Settings, ShieldCheck, Sparkles, Star, UserPlus, UserRound, Users,
  Instagram, Globe, Megaphone, CalendarDays, Film, BookOpen,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { questionById, requiredQuestionIds, sections, type Question } from "@/lib/questionnaire";
import { referenceSections, refRequiredQuestionIds, refQuestionById, type RefQuestion } from "@/lib/references";
import { syncUpload, syncDownload, syncListen } from "@/lib/firebase";

type Role = "admin" | "client";
type Answers = Record<string, string | string[]>;
type AppUser = { id: string; name: string; email: string; password: string; role: Role };
type Log = { id: string; at: string; user: string; action: string };
type Notification = { id: string; at: string; message: string; read: boolean };
type DocumentRecord = { id: string; name: string; createdAt: string; progress: number; dataUri: string; category?: string };

type View = "dashboard" | "form" | "refForm" | "library" | "reports" | "project" | "admin" | "projects" | "projectsDetail";

const ETAPAS = [
  { id: "briefing", name: "Briefing", available: true },
  { id: "referencia", name: "Referência", available: true },
  { id: "benchmark", name: "Benchmark", available: false },
  { id: "diagnostico", name: "Diagnóstico", available: false },
  { id: "estrategia", name: "Estratégia de Marca", available: false },
  { id: "identidade", name: "Identidade Visual", available: false },
  { id: "conteudos", name: "Conteúdos", available: false },
  { id: "site", name: "Site", available: false },
  { id: "producao", name: "Produção", available: false },
  { id: "aprovacao", name: "Aprovação", available: false },
];

const PROJECT_SECTIONS = [
  { id: "instagram", name: "Instagram", icon: <Instagram size={22}/> },
  { id: "facebook", name: "Facebook", icon: <Globe size={22}/> },
  { id: "site", name: "Site", icon: <Globe size={22}/> },
  { id: "publicidade", name: "Publicidade", icon: <Megaphone size={22}/> },
  { id: "whatsapp", name: "WhatsApp / Delivery", icon: <MessageSquare size={22}/> },
  { id: "edicao", name: "Edição", icon: <Film size={22}/> },
];

const DEFAULT_USERS: AppUser[] = [
  { id: "u1", name: "Fahed", email: "fahed@projeto.com", password: "admin123", role: "admin" },
  { id: "u2", name: "Sara", email: "sara@projeto.com", password: "canidia771", role: "client" },
];

function filled(value: string | string[] | undefined) { return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim()); }
function now() { return new Date().toLocaleString("pt-BR"); }

export default function HomePage() {
  const [users, setUsers] = useState<AppUser[]>(DEFAULT_USERS);
  const [session, setSession] = useState<{ id: string; role: Role; name: string; email: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("dashboard");
  const [sectionIndex, setSectionIndex] = useState(0);
  const [refSectionIndex, setRefSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [refAnswers, setRefAnswers] = useState<Answers>({});
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [saveState, setSaveState] = useState("Todas as alterações estão salvas");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [showMissing, setShowMissing] = useState(false);
  const [missingSource, setMissingSource] = useState<"briefing"|"ref">("briefing");
  const [libraryTab, setLibraryTab] = useState("briefing");
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  // Helper to read from localStorage (cache)
  const read = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; } };
  // Helper to save to localStorage (cache)
  const cache = (key: string, value: any) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };

  useEffect(() => {
    try { const s = sessionStorage.getItem("mercado-session"); if (s) setSession(JSON.parse(s)); } catch {}
    // Load from localStorage FIRST (instant, offline-safe)
    setAnswers(read("mercado-answers", {}));
    setRefAnswers(read("mercado-ref-answers", {}));
    setDocuments(read("mercado-documents", []));
    setLogs(read("mercado-logs", []));
    setNotifications(read("mercado-notifications", []));
    setUsers(read("mercado-users", DEFAULT_USERS));
    // Then sync from Firebase (source of truth — overwrites local cache)
    syncDownload().then(remote => {
      if (remote) {
        if (remote.answers && Object.keys(remote.answers).length > 0) { setAnswers(remote.answers); cache("mercado-answers", remote.answers); }
        if (remote.refAnswers && Object.keys(remote.refAnswers).length > 0) { setRefAnswers(remote.refAnswers); cache("mercado-ref-answers", remote.refAnswers); }
        if (remote.documents) { setDocuments(remote.documents); cache("mercado-documents", remote.documents); }
        if (remote.logs) { setLogs(remote.logs); cache("mercado-logs", remote.logs); }
        if (remote.notifications) { setNotifications(remote.notifications); cache("mercado-notifications", remote.notifications); }
        if (remote.users && remote.users.length > 0) { setUsers(remote.users); cache("mercado-users", remote.users); }
      }
    }).catch(() => {});
  }, []);

  // Track whether a state change came from local user action or remote sync
  const isRemoteUpdate = useRef(false);
  const uploadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialLoad = useRef(true);

  // --- Auto-upload to Firebase + cache locally whenever LOCAL data changes ---
  useEffect(() => {
    if (isInitialLoad.current) { isInitialLoad.current = false; return; }
    // Always cache locally for instant reload
    cache("mercado-answers", answers);
    cache("mercado-ref-answers", refAnswers);
    cache("mercado-documents", documents);
    cache("mercado-logs", logs);
    cache("mercado-notifications", notifications);
    cache("mercado-users", users);
    if (isRemoteUpdate.current) { isRemoteUpdate.current = false; return; }
    // Upload to Firebase (debounced)
    if (uploadTimer.current) clearTimeout(uploadTimer.current);
    uploadTimer.current = setTimeout(() => {
      syncUpload({ answers, refAnswers, documents, logs, notifications, users }).then(() => {
        setSaveState("Salvo na nuvem ✓");
      }).catch(() => {
        setSaveState("Erro ao salvar na nuvem");
      });
    }, 1500);
    return () => { if (uploadTimer.current) clearTimeout(uploadTimer.current); };
  }, [answers, refAnswers, documents, logs, notifications, users]);

  // --- Real-time listener: receive changes from Firebase instantly ---
  useEffect(() => {
    let firstSnapshot = true;
    const unsub = syncListen((remote) => {
      if (firstSnapshot) { firstSnapshot = false; return; }
      isRemoteUpdate.current = true;
      if (remote.answers) { setAnswers(remote.answers); cache("mercado-answers", remote.answers); }
      if (remote.refAnswers) { setRefAnswers(remote.refAnswers); cache("mercado-ref-answers", remote.refAnswers); }
      if (remote.documents) { setDocuments(remote.documents); cache("mercado-documents", remote.documents); }
      if (remote.logs) { setLogs(remote.logs); cache("mercado-logs", remote.logs); }
      if (remote.notifications) { setNotifications(remote.notifications); cache("mercado-notifications", remote.notifications); }
      if (remote.users && remote.users.length > 0) { setUsers(remote.users); cache("mercado-users", remote.users); }
      setSaveState("Atualizado ao vivo ✓");
    });
    return () => unsub();
  }, []);

  const doneCount = useMemo(() => requiredQuestionIds.filter(id => filled(answers[id])).length, [answers]);
  const progress = Math.round((doneCount / requiredQuestionIds.length) * 100);

  const refDoneCount = useMemo(() => refRequiredQuestionIds.filter(id => filled(refAnswers[id])).length, [refAnswers]);
  const refProgress = Math.round((refDoneCount / (refRequiredQuestionIds.length || 1)) * 100);

  const currentEtapa = progress === 100 ? (refProgress === 100 ? 2 : 1) : 0;

  const currentSection = sections[sectionIndex];
  const currentRefSection = referenceSections[refSectionIndex];
  const sectionMissing = (index: number) => sections[index].questions.filter(q => q.required && !filled(answers[q.id]));
  const sectionDone = (section: typeof sections[number]) => section.questions.filter(q => q.required).every(q => filled(answers[q.id]));
  const refSectionDone = (section: typeof referenceSections[number]) => section.questions.filter(q => q.required).every(q => filled(refAnswers[q.id]));

  function addLog(action: string, actor = session?.name || "Sistema") {
    const next = [{ id: crypto.randomUUID(), at: now(), user: actor, action }, ...logs].slice(0, 200);
    setLogs(next);
  }

  function addNotification(message: string) {
    const next = [{ id: crypto.randomUUID(), at: now(), message, read: false }, ...notifications].slice(0, 100);
    setNotifications(next);
  }

  function login(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser) return;
    if (selectedUser.password !== password) return setError("Senha incorreta.");
    const next = { id: selectedUser.id, role: selectedUser.role, name: selectedUser.name, email: selectedUser.email };
    setSession(next); sessionStorage.setItem("mercado-session", JSON.stringify(next)); setError(""); setPassword("");
    setTimeout(() => addLog("Fez login no portal", selectedUser.name), 0);
  }

  function logout() { addLog("Saiu do portal"); setSession(null); setSelectedUser(null); setPassword(""); sessionStorage.removeItem("mercado-session"); setView("dashboard"); }

  function updateAnswer(question: Question, value: string | string[]) {
    setAnswers(prev => {
      const next = { ...prev, [question.id]: value };
      setSaveState("Salvando...");
      return next;
    });
  }

  function updateRefAnswer(questionId: string, value: string | string[]) {
    setRefAnswers(prev => {
      const next = { ...prev, [questionId]: value };
      setSaveState("Salvando...");
      return next;
    });
  }

  function validateAndContinue() {
    const miss = sectionMissing(sectionIndex);
    if (miss.length) { setMissing(miss.map(q => q.id)); setMissingSource("briefing"); setShowMissing(true); addLog(`Tentou avançar com ${miss.length} pergunta(s) obrigatória(s) pendente(s) na seção "${currentSection.title}"`); return; }
    setMissing([]); addLog(`Concluiu a seção "${currentSection.title}"`); setSectionIndex(i => Math.min(i + 1, sections.length - 1));
  }

  function refValidateAndContinue() {
    const miss = currentRefSection.questions.filter(q => q.required && !filled(refAnswers[q.id]));
    if (miss.length) { setMissing(miss.map(q => q.id)); setMissingSource("ref"); setShowMissing(true); addLog(`Tentou avançar com ${miss.length} pergunta(s) obrigatória(s) pendente(s) na seção "${currentRefSection.title}"`); return; }
    setMissing([]); addLog(`Concluiu a seção de referência "${currentRefSection.title}"`);
    if (refSectionIndex < referenceSections.length - 1) {
      setRefSectionIndex(i => i + 1);
    } else {
      addNotification(`Sara concluiu o formulário de Referência (${refProgress}%)`);
      addLog("Concluiu o formulário de Referência");
    }
  }

  function validateFinal() {
    const ids = requiredQuestionIds.filter(id => !filled(answers[id]));
    if (ids.length) { setMissing(ids); setMissingSource("briefing"); setShowMissing(true); addLog(`Tentou gerar o PDF com ${ids.length} campo(s) obrigatório(s) pendente(s)`); return false; }
    return true;
  }

  function jumpToMissing(id: string) {
    if (missingSource === "ref") {
      const idx = referenceSections.findIndex(s => s.questions.some(q => q.id === id));
      if (idx >= 0) { setRefSectionIndex(idx); setView("refForm"); setShowMissing(false); setTimeout(() => document.getElementById(`field-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); }
    } else {
      const idx = sections.findIndex(s => s.questions.some(q => q.id === id));
      if (idx >= 0) { setSectionIndex(idx); setView("form"); setShowMissing(false); setTimeout(() => document.getElementById(`field-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100); }
    }
  }

  function buildPdf(): { name: string; dataUri: string } {
    const doc = new jsPDF({ unit: "mm", format: "a4" }); let y = 20;
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.text("Briefing de Mercado — Mercado Titular", 18, y);
    y += 9; doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(`Gerado em ${now()}`, 18, y); y += 10;
    sections.forEach(section => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.text(section.title, 18, y); y += 7;
      section.questions.forEach(q => {
        if (y > 265) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); const qLines = doc.splitTextToSize(q.label, 174); doc.text(qLines, 18, y); y += qLines.length * 5;
        const raw = answers[q.id]; let response = Array.isArray(raw) ? raw.join(", ") : raw || "Não informado";
        if (q.type === "image" && typeof response === "string" && response.startsWith("data:")) response = "Imagem enviada e armazenada no portal";
        doc.setFont("helvetica", "normal"); const lines = doc.splitTextToSize(response, 174); doc.text(lines, 18, y); y += lines.length * 5 + 4;
      }); y += 3;
    });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19); const name = `briefing-mercado-${stamp}.pdf`;
    return { name, dataUri: doc.output("datauristring") };
  }

  function generatePdf() {
    if (!validateFinal()) return;
    const built = buildPdf();
    const record: DocumentRecord = { id: crypto.randomUUID(), name: built.name, createdAt: now(), progress, dataUri: built.dataUri, category: "briefing" };
    const nextDocs = [record, ...documents]; setDocuments(nextDocs);
    addLog(`Gerou uma nova versão do briefing: ${built.name}`);
    addNotification(`Sara gerou o briefing (${progress}% completo)`);
    downloadDocument(record); setView("library");
  }

  function downloadDocument(d: DocumentRecord) { const a = document.createElement("a"); a.href = d.dataUri; a.download = d.name; a.click(); addLog(`Baixou o documento ${d.name}`); }

  function saveUsers(next: AppUser[]) { setUsers(next); }

  async function handleSync() {
    setSyncing(true); setSyncMsg("");
    try {
      await syncUpload({ answers, refAnswers, documents, logs, notifications, users });
      const remote = await syncDownload();
      if (remote) {
        if (remote.answers && Object.keys(remote.answers).length > 0) setAnswers(remote.answers);
        if (remote.refAnswers && Object.keys(remote.refAnswers).length > 0) setRefAnswers(remote.refAnswers);
        if (remote.documents) setDocuments(remote.documents);
        if (remote.logs) setLogs(remote.logs);
        if (remote.notifications) setNotifications(remote.notifications);
        if (remote.users && remote.users.length > 0) setUsers(remote.users);
      }
      setSyncMsg("Sincronizado!"); addLog("Sincronizou os dados com a nuvem");
    } catch (err) {
      console.error(err);
      setSyncMsg("Erro ao sincronizar");
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(""), 3000);
  }

  // --- LOGIN ---
  if (!session) {
    if (!selectedUser) {
      return <LoginSelect users={users} onSelect={(u: AppUser) => { setSelectedUser(u); setError(""); }} />;
    }
    return <LoginPassword user={selectedUser} password={password} setPassword={setPassword} error={error} login={login} goBack={() => { setSelectedUser(null); setError(""); setPassword(""); }} />;
  }

  const isAdmin = session.role === "admin";
  const titleMap: Record<View,string> = {
    dashboard: "Visão geral", form: "Briefing estratégico", refForm: "Referência",
    library: "Biblioteca", reports: "Relatório de atividades",
    project: "Situação do projeto", admin: "Administração",
    projects: "Projetos", projectsDetail: "Projetos",
  };

  const nav = (v: View) => { setView(v); setMobileMenu(false); };

  return <div className="app-shell">
    {mobileMenu && <div className="sidebar-overlay" onClick={() => setMobileMenu(false)}/>}
    <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
      <div className="sidebar-head"><div className="brand-mark small">A</div><div><strong>Mercado Titular</strong><span>{isAdmin ? "Painel administrativo" : "Portal da cliente"}</span></div></div>
      <nav>
        <Nav active={view==="dashboard"} onClick={()=>nav("dashboard")} icon={<LayoutDashboard size={19}/>} label="Visão geral"/>
        {!isAdmin && <>
          <Nav active={view==="form"} onClick={()=>nav("form")} icon={<ClipboardList size={19}/>} label="Briefing"/>
          <Nav active={view==="refForm"} onClick={()=>nav("refForm")} icon={<BookOpen size={19}/>} label="Referência"/>
          <Nav active={view==="projects"||view==="projectsDetail"} onClick={()=>nav("projects")} icon={<Sparkles size={19}/>} label="Projetos"/>
          <Nav active={view==="library"} onClick={()=>nav("library")} icon={<FolderOpen size={19}/>} label="Biblioteca"/>
        </>}
        {isAdmin && <>
          <Nav active={view==="form"} onClick={()=>nav("form")} icon={<ClipboardList size={19}/>} label="Ver Briefing"/>
          <Nav active={view==="refForm"} onClick={()=>nav("refForm")} icon={<BookOpen size={19}/>} label="Referência"/>
          <Nav active={view==="projects"||view==="projectsDetail"} onClick={()=>nav("projects")} icon={<Sparkles size={19}/>} label="Projetos"/>
          <Nav active={view==="library"} onClick={()=>nav("library")} icon={<FolderOpen size={19}/>} label="Biblioteca"/>
          <Nav active={view==="reports"} onClick={()=>nav("reports")} icon={<Activity size={19}/>} label="Relatórios"/>
          <Nav active={view==="project"} onClick={()=>nav("project")} icon={<Sparkles size={19}/>} label="Situação do projeto"/>
          <Nav active={view==="admin"} onClick={()=>nav("admin")} icon={<Settings size={19}/>} label="Administração"/>
        </>}
      </nav>
      <div className="sidebar-user"><div className="avatar"><UserRound size={18}/></div><div><strong>{session.name}</strong><span>{isAdmin ? "Administrador" : "Cliente"}</span></div><button onClick={logout}><LogOut size={18}/></button></div>
    </aside>
    <main className="content">
      <header className="topbar">
        <button className="menu-button" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button>
        <div><p className="eyebrow">Projeto de marca</p><h2>{titleMap[view]}</h2></div>
        <div className="topbar-actions">
          <button className={`sync-btn ${syncing ? "spinning" : ""}`} onClick={handleSync} disabled={syncing} title="Sincronizar dados">
            <RefreshCw size={18}/>{syncMsg && <span className="sync-msg">{syncMsg}</span>}
          </button>
          <div className="save-status"><span></span>{saveState}</div>
        </div>
      </header>

      {view === "dashboard" && !isAdmin && <ClientDashboard name={session.name} progress={progress} refProgress={refProgress} currentEtapa={currentEtapa} setView={setView}/>}
      {view === "dashboard" && isAdmin && <AdminDashboard progress={progress} refProgress={refProgress} notifications={notifications} setNotifications={setNotifications} setView={setView} logs={logs}/>}
      {view === "form" && <FormView progress={progress} sectionIndex={sectionIndex} setSectionIndex={setSectionIndex} currentSection={currentSection} answers={answers} updateAnswer={updateAnswer} sectionDone={sectionDone} validateAndContinue={validateAndContinue} generatePdf={generatePdf} setView={setView} missing={missing}/>}
      {view === "refForm" && <RefFormView refProgress={refProgress} refSectionIndex={refSectionIndex} setRefSectionIndex={setRefSectionIndex} currentRefSection={currentRefSection} refAnswers={refAnswers} updateRefAnswer={updateRefAnswer} refSectionDone={refSectionDone} refValidateAndContinue={refValidateAndContinue} setView={setView} missing={missing}/>}
      {view === "library" && <Library documents={documents} progress={progress} generatePdf={generatePdf} downloadDocument={downloadDocument} libraryTab={libraryTab} setLibraryTab={setLibraryTab}/>}
      {view === "reports" && isAdmin && <Reports logs={logs}/>}
      {view === "project" && isAdmin && <ProjectStatus progress={progress} refProgress={refProgress} doneCount={doneCount} documents={documents} logs={logs}/>}
      {view === "admin" && isAdmin && <AdminPanel users={users} saveUsers={saveUsers} currentUserId={session.id} addLog={addLog}/>}
      {view === "projects" && <ProjectsPage setView={setView}/>}
      {view === "projectsDetail" && <ProjectsDetailPage setView={setView}/>}
    </main>
    {showMissing && <MissingModal ids={missing} close={()=>setShowMissing(false)} jump={jumpToMissing} source={missingSource}/>}
  </div>;
}

/* ─── LOGIN: Seleção de usuário ─── */
function LoginSelect({ users, onSelect }: { users: AppUser[]; onSelect: (u: AppUser) => void }) {
  return <main className="login-shell">
    <section className="login-brand"><div className="brand-mark">A</div><div><p className="eyebrow">Portal privado</p><h1>Mercado Titular</h1></div></section>
    <section className="login-panel"><div className="login-card">
      <div className="user-select-grid">
        {users.map(u => <button key={u.id} className="user-select-btn" onClick={() => onSelect(u)}>
          <div className="avatar-large"><UserRound size={32}/></div>
          <strong>{u.name}</strong>
        </button>)}
      </div>
    </div></section>
  </main>;
}

/* ─── LOGIN: Senha ─── */
function LoginPassword({ user, password, setPassword, error, login, goBack }: any) {
  const [showPw, setShowPw] = useState(false);
  return <main className="login-shell">
    <section className="login-brand"><div className="brand-mark">A</div><div><p className="eyebrow">Portal privado</p><h1>Mercado Titular</h1></div></section>
    <section className="login-panel"><form className="login-card" onSubmit={login}>
      <button type="button" className="back-link" onClick={goBack}><ArrowLeft size={17}/>Voltar</button>
      <h2>Olá, {user.name}</h2>
      <label>Senha
        <div className="password-field">
          <input value={password} onChange={(e: any) => setPassword(e.target.value)} type={showPw ? "text" : "password"} required autoFocus/>
          <button type="button" className="toggle-pw" onClick={() => setShowPw(!showPw)}>{showPw ? "Esconder" : "Mostrar"}</button>
        </div>
      </label>
      {error && <p className="error">{error}</p>}
      <button className="primary" type="submit">Entrar no portal <ChevronRight size={18}/></button>
    </form></section>
  </main>;
}

function Nav({ active, onClick, icon, label }: any) { return <button className={active ? "active" : ""} onClick={onClick}>{icon}{label}</button>; }

/* ─── DASHBOARD CLIENTE (Sara) ─── */
function ClientDashboard({ name, progress, refProgress, currentEtapa, setView }: any) {
  return <section className="page">
    <div className="hero-card">
      <div>
        <span className="status-pill">Projeto ativo</span>
        <h1>Olá, {name}.</h1>
        <p>Acompanhe o progresso das etapas do seu projeto de mercado.</p>
      </div>
      <div className="hero-progress">
        <strong>Etapa {currentEtapa + 1}/10</strong>
        <span>{ETAPAS[currentEtapa]?.name}</span>
        <div className="progress"><i style={{ width: `${(currentEtapa + 1) * 10}%` }}/></div>
      </div>
    </div>

    <div className="section-heading" style={{ marginTop: 32 }}><h2>Etapas</h2></div>
    <div className="etapas-grid">
      {ETAPAS.map((etapa, i) => {
        const done = (i === 0 && progress === 100) || (i === 1 && refProgress === 100);
        const inProgress = (i === 0 && progress > 0 && progress < 100) || (i === 1 && refProgress > 0 && refProgress < 100);
        const pct = i === 0 ? progress : i === 1 ? refProgress : 0;
        return <article key={etapa.id} className={`etapa-card ${!etapa.available ? "locked" : ""} ${done ? "done" : ""}`}>
          <div className="etapa-number">{done ? <CheckCircle2 size={20}/> : !etapa.available ? <Lock size={16}/> : i + 1}</div>
          <div className="etapa-info">
            <strong>{etapa.name}</strong>
            {etapa.available && <div className="progress" style={{ marginTop: 6 }}><i style={{ width: `${pct}%` }}/></div>}
            {!etapa.available && <span className="muted" style={{ fontSize: 12 }}>Em breve</span>}
            {etapa.available && inProgress && <span className="muted" style={{ fontSize: 12 }}>{pct}% concluído</span>}
            {etapa.available && done && <span style={{ fontSize: 12, color: "var(--success)" }}>Concluída</span>}
          </div>
          {etapa.available && <button className="secondary small-btn" onClick={() => {
            if (i === 0) setView("form");
            if (i === 1) setView("refForm");
          }}>{done ? "Revisar" : pct > 0 ? "Continuar" : "Começar"} <ChevronRight size={15}/></button>}
        </article>;
      })}
    </div>

    <div className="project-grid" style={{ marginTop: 32 }}>
      <Card title="Projetos" text="Instagram, Facebook, Site, Publicidade, WhatsApp e Edição." icon={<Sparkles/>} action={() => setView("projects")} button="Abrir projetos"/>
      <Card title="Biblioteca" text="Documentos do projeto organizados por etapa." icon={<FolderOpen/>} action={() => setView("library")} button="Abrir biblioteca"/>
    </div>
  </section>;
}

/* ─── DASHBOARD ADMIN (Fahed) ─── */
function AdminDashboard({ progress, refProgress, notifications, setNotifications, setView, logs }: any) {
  function markAllRead() {
    const next = notifications.map((n: Notification) => ({ ...n, read: true }));
    setNotifications(next);
  }
  const unread = notifications.filter((n: Notification) => !n.read).length;
  const currentEtapa = progress === 100 ? (refProgress === 100 ? 2 : 1) : 0;

  return <section className="page">
    <div className="hero-card">
      <div>
        <span className="status-pill">Acompanhe o progresso</span>
        <h1>Painel administrativo</h1>
        <p>Veja o status do projeto e receba notificações.</p>
      </div>
      <div className="hero-progress">
        <div style={{ display: "grid", gap: 12 }}>
          <div><strong style={{ fontSize: 16 }}>Briefing</strong><div className="progress" style={{ marginTop: 4 }}><i style={{ width: `${progress}%` }}/></div><span className="muted" style={{ fontSize: 12 }}>{progress}%</span></div>
          <div><strong style={{ fontSize: 16 }}>Referência</strong><div className="progress" style={{ marginTop: 4 }}><i style={{ width: `${refProgress}%` }}/></div><span className="muted" style={{ fontSize: 12 }}>{refProgress}%</span></div>
        </div>
      </div>
    </div>

    {/* Etapas - todas desbloqueadas para admin */}
    <div className="section-heading" style={{ marginTop: 32 }}><h2>Etapas</h2></div>
    <div className="etapas-grid">
      {ETAPAS.map((etapa, i) => {
        const done = (i === 0 && progress === 100) || (i === 1 && refProgress === 100);
        const inProgress = (i === 0 && progress > 0 && progress < 100) || (i === 1 && refProgress > 0 && refProgress < 100);
        const pct = i === 0 ? progress : i === 1 ? refProgress : 0;
        return <article key={etapa.id} className={`etapa-card ${done ? "done" : ""}`}>
          <div className="etapa-number">{done ? <CheckCircle2 size={20}/> : i + 1}</div>
          <div className="etapa-info">
            <strong>{etapa.name}</strong>
            {(i === 0 || i === 1) && <div className="progress" style={{ marginTop: 6 }}><i style={{ width: `${pct}%` }}/></div>}
            {(i === 0 || i === 1) && inProgress && <span className="muted" style={{ fontSize: 12 }}>{pct}% concluído</span>}
            {(i === 0 || i === 1) && done && <span style={{ fontSize: 12, color: "var(--success)" }}>Concluída</span>}
            {i > 1 && <span className="muted" style={{ fontSize: 12 }}>Pendente</span>}
          </div>
          {(i === 0 || i === 1) && <button className="secondary small-btn" onClick={() => {
            if (i === 0) setView("form");
            if (i === 1) setView("refForm");
          }}>{done ? "Revisar" : pct > 0 ? "Continuar" : "Começar"} <ChevronRight size={15}/></button>}
        </article>;
      })}
    </div>

    {/* Mensagens */}
    <div className="project-card" style={{ marginTop: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}><MessageSquare size={20}/> Mensagens {unread > 0 && <span className="status-pill" style={{ fontSize: 10 }}>{unread} nova(s)</span>}</h3>
        {unread > 0 && <button className="secondary small-btn" onClick={markAllRead}>Marcar como lidas</button>}
      </div>
      {notifications.length === 0
        ? <p className="muted">Nenhuma notificação ainda.</p>
        : <div className="activity-list">{notifications.slice(0, 10).map((n: Notification) => <article key={n.id} style={{ opacity: n.read ? 0.6 : 1 }}><div className="doc-icon"><MessageSquare/></div><div><span>{n.message}</span></div><time>{n.at}</time></article>)}</div>
      }
    </div>

    {/* Cards Projetos e Biblioteca */}
    <div className="project-grid" style={{ marginTop: 24 }}>
      <Card title="Projetos" text="Instagram, Site, Publicidade, Planejamento e Edição." icon={<Sparkles/>} action={() => setView("projects")} button="Abrir projetos"/>
      <Card title="Biblioteca" text="Documentos do projeto organizados por etapa." icon={<FolderOpen/>} action={() => setView("library")} button="Abrir biblioteca"/>
    </div>

    {/* Botões admin */}
    <div className="admin-btn-grid" style={{ marginTop: 24 }}>
      <button className="admin-action-btn" onClick={() => setView("form")}><ClipboardList size={20}/> Ver Briefing</button>
      <button className="admin-action-btn" onClick={() => setView("reports")}><Activity size={20}/> Relatórios</button>
      <button className="admin-action-btn" onClick={() => setView("project")}><Sparkles size={20}/> Situação do Projeto</button>
      <button className="admin-action-btn" onClick={() => setView("admin")}><Settings size={20}/> Painel de Administração</button>
    </div>
  </section>;
}

function Card({ title, text, icon, action, button }: any) {
  return <article className="project-card featured"><div className="project-icon">{icon}</div><h3>{title}</h3><p>{text}</p><div className="card-footer"><button onClick={action}>{button}<ChevronRight size={17}/></button></div></article>;
}

/* ─── PROJETOS (Sara) ─── */
function ProjectsPage({ setView }: any) {
  return <section className="page">
    <div className="hero-card compact"><div><p className="eyebrow">Seus projetos</p><h1>Projetos</h1><p>Acesse as áreas do seu projeto de marca.</p></div></div>
    <div className="project-grid" style={{ marginTop: 20 }}>
      {PROJECT_SECTIONS.map(s => <article key={s.id} className="project-card featured">
        <div className="project-icon">{s.icon}</div>
        <h3>{s.name}</h3>
        <p>Seção de {s.name.toLowerCase()} do projeto.</p>
        <div className="card-footer"><button onClick={() => setView("projectsDetail")}>Acessar <ChevronRight size={17}/></button></div>
      </article>)}
    </div>
  </section>;
}

function ProjectsDetailPage({ setView }: any) {
  return <section className="page">
    <button className="back-link" onClick={() => setView("projects")}><ArrowLeft size={17}/>Voltar aos projetos</button>
    <div className="empty"><h3>Em breve</h3><p>Esta seção estará disponível nas próximas etapas do projeto.</p></div>
  </section>;
}

/* ─── FORMULÁRIO BRIEFING ─── */
function FormView({ progress, sectionIndex, setSectionIndex, currentSection, answers, updateAnswer, sectionDone, validateAndContinue, generatePdf, setView, missing }: any) {
  return <section className="page form-page"><div className="form-layout">
    <aside className="form-nav"><div><p className="eyebrow">Progresso</p><strong>{progress}% completo</strong><div className="progress"><i style={{ width: `${progress}%` }}/></div></div>{sections.map((s, i) => <button key={s.id} className={i === sectionIndex ? "active" : ""} onClick={() => setSectionIndex(i)}><span>{sectionDone(s) ? <CheckCircle2 size={17}/> : i + 1}</span><div><strong>{s.title}</strong><small>{sectionDone(s) ? "Concluída" : `${s.questions.filter((q: Question) => q.required && !filled(answers[q.id])).length} obrigatória(s) pendente(s)`}</small></div></button>)}</aside>
    <div className="form-card"><div className="form-header"><button className="back-link" onClick={() => setView("dashboard")}><ArrowLeft size={17}/>Voltar</button><p className="eyebrow">Etapa {sectionIndex + 1} de {sections.length}</p><h1>{currentSection.title}</h1><p>{currentSection.description}</p></div><div className="questions">{currentSection.questions.map((q: Question) => <QuestionField key={q.id} question={q} value={answers[q.id]} onChange={(v: any) => updateAnswer(q, v)} invalid={missing.includes(q.id)}/>)}</div><div className="form-actions"><button className="secondary" disabled={sectionIndex === 0} onClick={() => setSectionIndex((i: number) => i - 1)}>Anterior</button>{sectionIndex < sections.length - 1 ? <button className="primary" onClick={validateAndContinue}>Salvar e continuar <ChevronRight size={18}/></button> : <button className="primary" onClick={generatePdf}><Download size={18}/>Verificar e gerar PDF</button>}</div></div>
  </div></section>;
}

/* ─── FORMULÁRIO REFERÊNCIA ─── */
function RefFormView({ refProgress, refSectionIndex, setRefSectionIndex, currentRefSection, refAnswers, updateRefAnswer, refSectionDone, refValidateAndContinue, setView, missing }: any) {
  return <section className="page form-page"><div className="form-layout">
    <aside className="form-nav"><div><p className="eyebrow">Progresso</p><strong>{refProgress}% completo</strong><div className="progress"><i style={{ width: `${refProgress}%` }}/></div></div>{referenceSections.map((s, i) => <button key={s.id} className={i === refSectionIndex ? "active" : ""} onClick={() => setRefSectionIndex(i)}><span>{refSectionDone(s) ? <CheckCircle2 size={17}/> : i + 1}</span><div><strong>{s.title}</strong><small>{refSectionDone(s) ? "Concluída" : `${s.questions.filter((q: RefQuestion) => q.required && !filled(refAnswers[q.id])).length} obrigatória(s) pendente(s)`}</small></div></button>)}</aside>
    <div className="form-card"><div className="form-header"><button className="back-link" onClick={() => setView("dashboard")}><ArrowLeft size={17}/>Voltar</button><p className="eyebrow">Seção {refSectionIndex + 1} de {referenceSections.length}</p><h1>{currentRefSection.title}</h1><p>{currentRefSection.description}</p></div>
      <div className="questions">{currentRefSection.questions.map((q: RefQuestion) => <RefQuestionField key={q.id} question={q} value={refAnswers[q.id]} onChange={(v: any) => updateRefAnswer(q.id, v)} invalid={missing.includes(q.id)}/>)}</div>
      <div className="form-actions"><button className="secondary" disabled={refSectionIndex === 0} onClick={() => setRefSectionIndex((i: number) => i - 1)}>Anterior</button><button className="primary" onClick={refValidateAndContinue}>{refSectionIndex < referenceSections.length - 1 ? <>Salvar e continuar <ChevronRight size={18}/></> : "Finalizar referência"}</button></div>
    </div>
  </div></section>;
}

/* ─── CAMPOS DO FORMULÁRIO ─── */
function QuestionField({ question, value, onChange, invalid }: { question: Question; value: string | string[] | undefined; onChange: (v: string | string[]) => void; invalid: boolean }) {
  const cls = `field ${invalid ? "invalid" : ""}`;
  if (question.type === "textarea") return <label id={`field-${question.id}`} className={cls}><span>{question.label}{question.required && <b>*</b>}</span>{question.help && <small>{question.help}</small>}<textarea value={(value as string) || ""} placeholder={question.placeholder} onChange={e => onChange(e.target.value)} rows={5}/>{invalid && <em>Esta pergunta obrigatória precisa ser preenchida.</em>}</label>;
  if (question.type === "select") return <label id={`field-${question.id}`} className={cls}><span>{question.label}{question.required && <b>*</b>}</span><select value={(value as string) || ""} onChange={e => onChange(e.target.value)}><option value="">Selecione uma opção</option>{question.options?.map(o => <option key={o}>{o}</option>)}</select>{invalid && <em>Selecione uma opção.</em>}</label>;
  if (question.type === "multiselect") { const selected = Array.isArray(value) ? value : []; return <fieldset id={`field-${question.id}`} className={`${cls} choices`}><legend>{question.label}{question.required && <b>*</b>}</legend><div>{question.options?.map(o => <label key={o}><input type="checkbox" checked={selected.includes(o)} onChange={e => onChange(e.target.checked ? [...selected, o] : selected.filter(x => x !== o))}/><span>{o}</span></label>)}</div>{invalid && <em>Marque pelo menos uma opção.</em>}</fieldset>; }
  if (question.type === "image") return <label id={`field-${question.id}`} className={`${cls} upload-field`}><span>{question.label}{question.required && <b>*</b>}</span>{question.help && <small>{question.help}</small>}<input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 2_000_000) { alert("Use uma imagem com até 2 MB nesta versão local."); return; } const r = new FileReader(); r.onload = () => onChange(String(r.result)); r.readAsDataURL(f); }}/>{typeof value === "string" && value.startsWith("data:image") && <img src={value} alt="Prévia da referência"/>}</label>;
  return <label id={`field-${question.id}`} className={cls}><span>{question.label}{question.required && <b>*</b>}</span>{question.help && <small>{question.help}</small>}<input type={question.type === "url" ? "url" : "text"} value={(value as string) || ""} placeholder={question.placeholder} onChange={e => onChange(e.target.value)}/>{invalid && <em>Esta pergunta obrigatória precisa ser preenchida.</em>}</label>;
}

/* ─── CAMPOS DO FORMULÁRIO DE REFERÊNCIA ─── */
function RefQuestionField({ question, value, onChange, invalid }: { question: RefQuestion; value: string | string[] | undefined; onChange: (v: string | string[]) => void; invalid: boolean }) {
  const cls = `field ${invalid ? "invalid" : ""}`;

  if (question.type === "rating") {
    const rating = parseInt((value as string) || "0", 10);
    return <div id={`field-${question.id}`} className={cls}>
      <span>{question.label}{question.required && <b>*</b>}</span>
      <div className="star-rating">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" className={`star-btn ${n <= rating ? "active" : ""}`} onClick={() => onChange(String(n))}><Star size={24}/></button>)}</div>
      {invalid && <em>Dê uma nota.</em>}
    </div>;
  }

  if (question.type === "textarea") return <label id={`field-${question.id}`} className={cls}><span>{question.label}{question.required && <b>*</b>}</span>{question.help && <small>{question.help}</small>}<textarea value={(value as string) || ""} placeholder={question.placeholder} onChange={e => onChange(e.target.value)} rows={4}/>{invalid && <em>Esta pergunta obrigatória precisa ser preenchida.</em>}</label>;
  if (question.type === "multiselect") { const selected = Array.isArray(value) ? value : []; return <fieldset id={`field-${question.id}`} className={`${cls} choices`}><legend>{question.label}{question.required && <b>*</b>}</legend><div>{question.options?.map(o => <label key={o}><input type="checkbox" checked={selected.includes(o)} onChange={e => onChange(e.target.checked ? [...selected, o] : selected.filter(x => x !== o))}/><span>{o}</span></label>)}</div>{invalid && <em>Marque pelo menos uma opção.</em>}</fieldset>; }
  if (question.type === "image") return <label id={`field-${question.id}`} className={`${cls} upload-field`}><span>{question.label}{question.required && <b>*</b>}</span>{question.help && <small>{question.help}</small>}<input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 2_000_000) { alert("Use uma imagem com até 2 MB."); return; } const r = new FileReader(); r.onload = () => onChange(String(r.result)); r.readAsDataURL(f); }}/>{typeof value === "string" && value.startsWith("data:image") && <img src={value} alt="Prévia"/>}</label>;
  if (question.type === "url") return <label id={`field-${question.id}`} className={cls}><span>{question.label}{question.required && <b>*</b>}</span><input type="url" value={(value as string) || ""} placeholder={question.placeholder} onChange={e => onChange(e.target.value)}/>{invalid && <em>Preencha este campo.</em>}</label>;

  return <label id={`field-${question.id}`} className={cls}><span>{question.label}{question.required && <b>*</b>}</span><input type="text" value={(value as string) || ""} placeholder={question.placeholder} onChange={e => onChange(e.target.value)}/>{invalid && <em>Preencha este campo.</em>}</label>;
}

/* ─── BIBLIOTECA ─── */
function Library({ documents, progress, generatePdf, downloadDocument, libraryTab, setLibraryTab }: any) {
  const TABS = [
    { id: "briefing", label: "Briefing" },
    { id: "referencia", label: "Referência" },
    { id: "benchmark", label: "Benchmark" },
    { id: "diagnostico", label: "Diagnóstico" },
    { id: "estrategia", label: "Estratégia" },
    { id: "identidade", label: "Identidade Visual" },
  ];
  const filtered = documents.filter((d: DocumentRecord) => (d.category || "briefing") === libraryTab);

  return <section className="page">
    <div className="hero-card compact"><div><p className="eyebrow">Biblioteca</p><h1>Documentos do projeto</h1><p>Documentos organizados por etapa do projeto.</p></div><button className="primary" onClick={generatePdf}><Download size={18}/>Gerar briefing PDF</button></div>
    <div className="library-tabs">{TABS.map(t => <button key={t.id} className={`tab-btn ${libraryTab === t.id ? "active" : ""}`} onClick={() => setLibraryTab(t.id)}>{t.label}</button>)}</div>
    <div className="document-list">{filtered.length === 0 ? <div className="empty"><FileText size={42}/><h3>Nenhum documento nesta categoria</h3><p>Os documentos aparecerão aqui conforme forem gerados.</p></div> : filtered.map((d: any, index: number) => <article key={d.id}><div className="doc-icon"><FileText/></div><div><strong>{d.name}</strong><span>Gerado em {d.createdAt} · {d.progress}% preenchido</span></div><span className="version">Versão {filtered.length - index}</span><button className="secondary small-btn" onClick={() => downloadDocument(d)}><Download size={16}/>Baixar</button></article>)}</div>
    {progress < 100 && libraryTab === "briefing" && <p className="warning" style={{ marginTop: 16 }}>Ainda existem campos obrigatórios pendentes no briefing.</p>}
  </section>;
}

function Reports({ logs }: any) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? logs : logs.filter((l: any) => l.user.toLowerCase() === filter.toLowerCase());
  return <section className="page">
    <div className="hero-card compact"><div><p className="eyebrow">Auditoria</p><h1>Relatório de atividades</h1><p>Histórico de logins, conclusão de seções, geração e download de documentos.</p></div></div>
    <div className="library-tabs" style={{ marginTop: 16 }}>
      <button className={`tab-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>Todos</button>
      <button className={`tab-btn ${filter === "sara" ? "active" : ""}`} onClick={() => setFilter("sara")}>Sara</button>
      <button className={`tab-btn ${filter === "fahed" ? "active" : ""}`} onClick={() => setFilter("fahed")}>Fahed</button>
    </div>
    <div className="activity-list">{filtered.length === 0 ? <div className="empty"><Activity size={42}/><h3>Sem atividades registradas</h3></div> : filtered.map((l: any) => <article key={l.id}><div className="doc-icon"><Activity/></div><div><strong>{l.user}</strong><span>{l.action}</span></div><time>{l.at}</time></article>)}</div>
  </section>;
}

function ProjectStatus({ progress, refProgress, doneCount, documents, logs }: any) {
  return <section className="page">
    <div className="hero-card"><div><span className="status-pill">{progress === 100 && refProgress === 100 ? "Etapas iniciais completas" : "Em andamento"}</span><h1>Situação do projeto</h1><p>Resumo executivo para saber o que já foi feito e o que ainda falta.</p></div>
      <div className="hero-progress"><div style={{ display: "grid", gap: 12 }}>
        <div><strong style={{ fontSize: 16 }}>Briefing</strong><div className="progress" style={{ marginTop: 4 }}><i style={{ width: `${progress}%` }}/></div><span className="muted" style={{ fontSize: 12 }}>{progress}%</span></div>
        <div><strong style={{ fontSize: 16 }}>Referência</strong><div className="progress" style={{ marginTop: 4 }}><i style={{ width: `${refProgress}%` }}/></div><span className="muted" style={{ fontSize: 12 }}>{refProgress}%</span></div>
      </div></div>
    </div>
    <div className="stats"><article><span>Briefing</span><strong>{progress}%</strong><small>{doneCount} campos preenchidos</small></article><article><span>Referência</span><strong>{refProgress}%</strong><small>formulário de referências</small></article><article><span>Versões PDF</span><strong>{documents.length}</strong><small>documentos gerados</small></article></div>
    <div className="project-card"><h3>Próximo passo recomendado</h3><p>{progress < 100 ? "Concluir o briefing e revisar as referências visuais enviadas." : refProgress < 100 ? "Concluir o formulário de referências." : documents.length === 0 ? "Gerar a primeira versão oficial do briefing." : "Iniciar o benchmark e o dossiê estratégico."}</p><small>Última atividade: {logs[0]?.at || "nenhuma"}</small></div>
  </section>;
}

function AdminPanel({ users, saveUsers, currentUserId, addLog }: any) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [role, setRole] = useState<Role>("client");
  const [visiblePw, setVisiblePw] = useState<Record<string, boolean>>({});
  function create(e: React.FormEvent) { e.preventDefault(); if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) return alert("Já existe um usuário com este e-mail."); const next = [...users, { id: crypto.randomUUID(), name, email, password, role }]; saveUsers(next); addLog(`Cadastrou o usuário ${name} (${email})`); setName(""); setEmail(""); setPassword(""); }
  function changePassword(id: string) { const p = prompt("Digite a nova senha (mínimo 6 caracteres):"); if (!p) return; if (p.length < 6) return alert("A senha precisa ter ao menos 6 caracteres."); saveUsers(users.map((u: any) => u.id === id ? { ...u, password: p } : u)); addLog(`Alterou a senha do usuário ${users.find((u: any) => u.id === id)?.name}`); }
  function togglePw(id: string) { setVisiblePw(prev => ({ ...prev, [id]: !prev[id] })); }
  return <section className="page"><div className="hero-card compact"><div><p className="eyebrow">Controle de acesso</p><h1>Painel de administração</h1><p>Cadastre usuários e gerencie senhas.</p></div></div><div className="admin-grid"><form className="project-card admin-form" onSubmit={create}><div className="project-icon"><UserPlus/></div><h3>Novo usuário</h3><label>Nome<input value={name} onChange={e => setName(e.target.value)} required/></label><label>Login (e-mail)<input type="email" value={email} onChange={e => setEmail(e.target.value)} required/></label><label>Senha<input value={password} minLength={6} onChange={e => setPassword(e.target.value)} required/></label><label>Permissão<select value={role} onChange={e => setRole(e.target.value as Role)}><option value="client">Cliente</option><option value="admin">Administrador</option></select></label><button className="primary" type="submit"><UserPlus size={17}/>Cadastrar usuário</button></form><div className="project-card"><div className="project-icon"><Users/></div><h3>Usuários cadastrados</h3><div className="user-list">{users.map((u: any) => <article key={u.id}><div><strong>{u.name}</strong><span>{u.email} · {u.role === "admin" ? "Administrador" : "Cliente"}</span><span className="user-pw">Senha: {visiblePw[u.id] ? u.password : "••••••••"} <button type="button" className="toggle-pw-inline" onClick={() => togglePw(u.id)}>{visiblePw[u.id] ? "Esconder" : "Ver"}</button></span></div><button className="secondary small-btn" onClick={() => changePassword(u.id)}>Alterar senha</button>{u.id !== currentUserId && users.length > 2 && <button className="danger-link" onClick={() => { if (confirm(`Excluir ${u.name}?`)) { saveUsers(users.filter((x: any) => x.id !== u.id)); addLog(`Excluiu o usuário ${u.name}`); } }}>Excluir</button>}</article>)}</div></div></div></section>;
}

function MissingModal({ ids, close, jump, source }: any) {
  const labelMap = source === "ref" ? refQuestionById : questionById;
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal"><div className="icon-badge"><ClipboardList/></div><h2>Faltam {ids.length} resposta(s) obrigatória(s)</h2><p>Preencha as perguntas abaixo antes de continuar.</p><div className="missing-list">{ids.map((id: string) => <button key={id} onClick={() => jump(id)}><span>{labelMap[id]?.label || id}</span><ChevronRight size={17}/></button>)}</div><button className="secondary" onClick={close}>Fechar</button></div></div>;
}
