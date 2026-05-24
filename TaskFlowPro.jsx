import { useState, useEffect, useRef, useCallback } from "react";

// ─── Utilities ────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const isOverdue = (d, status) => d && status !== "completed" && new Date(d) < new Date();
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const STATUS_COLS = ["pending", "in-progress", "completed"];

const PRIORITY_COLORS = {
  high:   { bg: "#fee2e2", text: "#dc2626", dot: "#ef4444" },
  medium: { bg: "#fef3c7", text: "#b45309", dot: "#f59e0b" },
  low:    { bg: "#dcfce7", text: "#16a34a", dot: "#22c55e" },
};

const DEMO_TASKS = [
  { id: uid(), title: "Design landing page mockup", description: "Create Figma wireframes for the new marketing site", priority: "high", status: "in-progress", dueDate: "2026-05-28", category: "Design", createdAt: now(), userId: "u1" },
  { id: uid(), title: "Implement JWT auth", description: "Add token refresh logic and secure cookie storage", priority: "high", status: "pending", dueDate: "2026-05-25", category: "Backend", createdAt: now(), userId: "u1" },
  { id: uid(), title: "Write unit tests", description: "Achieve 80% coverage on core modules", priority: "medium", status: "pending", dueDate: "2026-06-01", category: "QA", createdAt: now(), userId: "u1" },
  { id: uid(), title: "Update dependencies", description: "Bump React to 19 and audit security advisories", priority: "low", status: "completed", dueDate: "2026-05-20", category: "DevOps", createdAt: now(), userId: "u1" },
  { id: uid(), title: "API rate limiting", description: "Add Redis-based rate limiter middleware", priority: "medium", status: "completed", dueDate: "2026-05-18", category: "Backend", createdAt: now(), userId: "u1" },
  { id: uid(), title: "Mobile responsive nav", description: "Fix hamburger menu on iOS Safari", priority: "medium", status: "in-progress", dueDate: "2026-05-30", category: "Frontend", createdAt: now(), userId: "u1" },
  { id: uid(), title: "Set up CI/CD pipeline", description: "GitHub Actions → Vercel deploy on merge to main", priority: "high", status: "pending", dueDate: "2026-05-23", category: "DevOps", createdAt: now(), userId: "u1" },
  { id: uid(), title: "Write API documentation", description: "Swagger/OpenAPI spec for all endpoints", priority: "low", status: "pending", dueDate: "2026-06-10", category: "Docs", createdAt: now(), userId: "u1" },
];

const DEMO_USERS = [
  { id: "u1", name: "Alex Rivera", email: "alex@taskflow.io", avatar: "AR", password: "demo123" }
];

const CATEGORIES = ["Design", "Frontend", "Backend", "QA", "DevOps", "Docs", "Marketing", "Research", "Other"];

// ─── Toast System ─────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "info") => {
    const id = uid();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, add };
}

function Toasts({ toasts }) {
  const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  const colors = { success: "#22c55e", error: "#ef4444", info: "#3b82f6", warning: "#f59e0b" };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "12px 18px",
          background: "var(--surface)", border: `1px solid ${colors[t.type]}`,
          borderLeft: `4px solid ${colors[t.type]}`,
          borderRadius: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          color: "var(--text-primary)", fontSize: 14, fontWeight: 500,
          animation: "slideIn 0.3s ease", minWidth: 260, maxWidth: 360,
        }}>
          <span style={{ color: colors[t.type], fontSize: 16, flexShrink: 0 }}>{icons[t.type]}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── Auth Pages ───────────────────────────────────────────────────────────────
function AuthPage({ onLogin, toast }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "alex@taskflow.io", password: "demo123", remember: false });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === "login") {
        const u = DEMO_USERS.find(u => u.email === form.email && u.password === form.password);
        if (u) { toast("Welcome back, " + u.name.split(" ")[0] + "! 👋", "success"); onLogin(u); }
        else toast("Invalid credentials. Try alex@taskflow.io / demo123", "error");
      } else {
        if (!form.name || !form.email || !form.password) return toast("All fields required", "error");
        const u = { id: uid(), name: form.name, email: form.email, avatar: form.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(), password: form.password };
        DEMO_USERS.push(u);
        toast("Account created! Welcome, " + u.name.split(" ")[0] + " 🎉", "success");
        onLogin(u);
      }
    }, 800);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", overflow: "hidden" }}>
      {/* Background decoration */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)" }} />
      </div>

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, background: "linear-gradient(135deg, #6366f1, #0ea5e9)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
            <span style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "var(--text-primary)" }}>TaskFlow <span style={{ color: "#6366f1" }}>Pro</span></span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Your intelligent task command center</p>
        </div>

        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 36, boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "var(--bg)", borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "8px 0", borderRadius: 9, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s",
                background: mode === m ? "var(--surface)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: mode === m ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}>{m === "login" ? "Sign In" : "Create Account"}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "register" && <Input label="Full Name" value={form.name} onChange={set("name")} placeholder="Alex Rivera" icon="👤" />}
            <Input label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" icon="✉️" />
            <Input label="Password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" icon="🔒" />

            {mode === "login" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}>
                  <input type="checkbox" checked={form.remember} onChange={set("remember")} style={{ accentColor: "#6366f1" }} />
                  Remember me
                </label>
                <span style={{ fontSize: 13, color: "#6366f1", cursor: "pointer", fontWeight: 500 }}>Forgot password?</span>
              </div>
            )}

            <button onClick={submit} disabled={loading} style={{
              width: "100%", padding: "13px", background: loading ? "var(--border)" : "linear-gradient(135deg, #6366f1, #0ea5e9)",
              color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
              boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
              letterSpacing: "0.3px",
            }}>
              {loading ? "⏳ Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>

            <div style={{ textAlign: "center", padding: "8px 0", borderTop: "1px solid var(--border)", marginTop: 4 }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                Demo: <code style={{ background: "var(--bg)", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>alex@taskflow.io</code> / <code style={{ background: "var(--bg)", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>demo123</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", value, onChange, placeholder, icon }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>{icon}</span>
        <input
          type={type === "password" && show ? "text" : type}
          value={value} onChange={onChange} placeholder={placeholder}
          style={{
            width: "100%", padding: "11px 40px 11px 40px", background: "var(--bg)",
            border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14,
            color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={e => e.target.style.borderColor = "#6366f1"}
          onBlur={e => e.target.style.borderColor = "var(--border)"}
        />
        {type === "password" && (
          <span onClick={() => setShow(s => !s)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", cursor: "pointer", fontSize: 16 }}>
            {show ? "🙈" : "👁"}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main App Shell ───────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(DEMO_TASKS);
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, add: toast } = useToasts();

  const logout = () => { setUser(null); toast("Signed out successfully", "info"); };

  useEffect(() => {
    // Simulate real-time: random task update notification every 30s
    const timer = setInterval(() => {
      if (user) {
        const msgs = ["🔔 A task is due soon!", "✅ Daily sync complete", "⚡ 3 tasks updated"];
        toast(msgs[Math.floor(Math.random() * msgs.length)], "info");
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [user]);

  const cssVars = dark ? {
    "--bg": "#0f1117", "--surface": "#1a1d27", "--surface2": "#22263a",
    "--border": "#2d3148", "--text-primary": "#f1f5f9", "--text-secondary": "#94a3b8",
    "--text-muted": "#64748b", "--accent": "#6366f1", "--accent2": "#0ea5e9",
  } : {
    "--bg": "#f8fafc", "--surface": "#ffffff", "--surface2": "#f1f5f9",
    "--border": "#e2e8f0", "--text-primary": "#0f172a", "--text-secondary": "#475569",
    "--text-muted": "#94a3b8", "--accent": "#6366f1", "--accent2": "#0ea5e9",
  };

  if (!user) return (
    <div style={cssVars}>
      <Toasts toasts={toasts} />
      <AuthPage onLogin={setUser} toast={toast} />
    </div>
  );

  return (
    <div style={{ ...cssVars, fontFamily: "'DM Sans', sans-serif", background: "var(--bg)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .nav-btn:hover { background: var(--surface2) !important; }
        .task-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(0,0,0,0.12) !important; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
        .icon-btn:hover { background: var(--surface2) !important; }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); position: fixed !important; z-index: 200; transition: transform 0.3s ease !important; }
          .sidebar.open { transform: translateX(0) !important; }
          .main-content { margin-left: 0 !important; }
        }
      `}</style>
      <Toasts toasts={toasts} />

      {/* Mobile overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 150 }} />}

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar page={page} setPage={p => { setPage(p); setSidebarOpen(false); }} user={user} dark={dark} setDark={setDark} logout={logout} open={sidebarOpen} />
        <div className="main-content" style={{ flex: 1, marginLeft: 260, overflow: "auto" }}>
          <TopBar user={user} dark={dark} setDark={setDark} setSidebarOpen={setSidebarOpen} tasks={tasks} />
          <div style={{ padding: "24px 28px", animation: "fadeUp 0.4s ease" }}>
            {page === "dashboard" && <Dashboard tasks={tasks} setTasks={setTasks} toast={toast} setPage={setPage} />}
            {page === "tasks" && <TasksPage tasks={tasks} setTasks={setTasks} toast={toast} user={user} />}
            {page === "kanban" && <KanbanBoard tasks={tasks} setTasks={setTasks} toast={toast} />}
            {page === "profile" && <ProfilePage user={user} tasks={tasks} />}
            {page === "settings" && <SettingsPage dark={dark} setDark={setDark} toast={toast} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, user, dark, setDark, logout, open }) {
  const nav = [
    { id: "dashboard", icon: "▦", label: "Dashboard" },
    { id: "tasks", icon: "☰", label: "All Tasks" },
    { id: "kanban", icon: "⊞", label: "Kanban Board" },
    { id: "profile", icon: "◎", label: "Profile" },
    { id: "settings", icon: "⚙", label: "Settings" },
  ];

  return (
    <aside className={`sidebar${open ? " open" : ""}`} style={{
      width: 260, background: "var(--surface)", borderRight: "1px solid var(--border)",
      height: "100vh", position: "fixed", top: 0, left: 0, display: "flex",
      flexDirection: "column", padding: "20px 16px", overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 8 }}>
        <div style={{ width: 34, height: 34, background: "linear-gradient(135deg, #6366f1, #0ea5e9)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</div>
        <span style={{ fontSize: 20, fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "var(--text-primary)" }}>TaskFlow<span style={{ color: "#6366f1" }}>Pro</span></span>
      </div>

      {/* User card */}
      <div style={{ background: "var(--bg)", borderRadius: 14, padding: "12px 14px", marginBottom: 28, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{user.avatar}</div>
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Pro Member</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 6 }}>Menu</div>
        {nav.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} className="nav-btn" style={{
            display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
            borderRadius: 10, border: "none", cursor: "pointer", transition: "all 0.15s",
            background: page === n.id ? "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.1))" : "transparent",
            color: page === n.id ? "#6366f1" : "var(--text-secondary)",
            fontWeight: page === n.id ? 700 : 500, fontSize: 14, textAlign: "left",
            borderLeft: page === n.id ? "3px solid #6366f1" : "3px solid transparent",
          }}>
            <span style={{ fontSize: 17, width: 20, textAlign: "center" }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        <button onClick={() => setDark(d => !d)} className="nav-btn" style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
          border: "none", cursor: "pointer", background: "transparent", color: "var(--text-secondary)", fontSize: 14, fontWeight: 500,
        }}>
          <span style={{ fontSize: 17, width: 20, textAlign: "center" }}>{dark ? "☀" : "◑"}</span>
          {dark ? "Light Mode" : "Dark Mode"}
        </button>
        <button onClick={logout} className="nav-btn" style={{
          display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10,
          border: "none", cursor: "pointer", background: "transparent", color: "#ef4444", fontSize: 14, fontWeight: 500,
        }}>
          <span style={{ fontSize: 17, width: 20, textAlign: "center" }}>⤴</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
function TopBar({ user, dark, setDark, setSidebarOpen, tasks }) {
  const overdue = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;
  return (
    <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => setSidebarOpen(o => !o)} className="icon-btn" style={{
          display: "none", width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)",
          background: "var(--bg)", cursor: "pointer", fontSize: 18, color: "var(--text-primary)",
          alignItems: "center", justifyContent: "center",
          // show on mobile via media query trick
        }}>
          <style>{`.menu-btn { display: none !important; } @media(max-width:768px){ .menu-btn { display:flex !important; } }`}</style>
        </button>
        <button onClick={() => setSidebarOpen(o => !o)} className="icon-btn menu-btn" style={{
          width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)",
          background: "var(--bg)", cursor: "pointer", fontSize: 18, color: "var(--text-primary)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>☰</button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Syne', sans-serif" }}>Good day, {user.name.split(" ")[0]}! 👋</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {overdue > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#dc2626", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            <span style={{ animation: "pulse 2s infinite" }}>⚠</span> {overdue} overdue
          </div>
        )}
        <button onClick={() => setDark(d => !d)} className="icon-btn" style={{
          width: 36, height: 36, borderRadius: 9, border: "1px solid var(--border)", background: "var(--bg)",
          cursor: "pointer", fontSize: 18, color: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center",
        }}>{dark ? "☀" : "◑"}</button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>{user.avatar}</div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ tasks, setTasks, toast, setPage }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === "completed").length;
  const pending = tasks.filter(t => t.status === "pending").length;
  const inProg = tasks.filter(t => t.status === "in-progress").length;
  const overdue = tasks.filter(t => isOverdue(t.dueDate, t.status)).length;

  const completionPct = total ? Math.round((completed / total) * 100) : 0;

  // Priority distribution
  const hi = tasks.filter(t => t.priority === "high").length;
  const md = tasks.filter(t => t.priority === "medium").length;
  const lo = tasks.filter(t => t.priority === "low").length;

  // Category distribution
  const catMap = {};
  tasks.forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + 1; });
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const statCards = [
    { label: "Total Tasks", value: total, icon: "📋", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    { label: "Completed", value: completed, icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
    { label: "In Progress", value: inProg, icon: "⚡", color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
    { label: "Overdue", value: overdue, icon: "🔴", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
  ];

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18, marginBottom: 28 }}>
        {statCards.map((c, i) => (
          <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, animation: `fadeUp ${0.1 + i * 0.08}s ease both` }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: c.color, lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>{c.value}</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3, fontWeight: 500 }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Completion Ring */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Task Completion</h3>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg width={110} height={110} viewBox="0 0 110 110">
              <circle cx={55} cy={55} r={44} fill="none" stroke="var(--border)" strokeWidth={10} />
              <circle cx={55} cy={55} r={44} fill="none" stroke="url(#grad)" strokeWidth={10}
                strokeDasharray={`${2 * Math.PI * 44 * completionPct / 100} 999`}
                strokeLinecap="round" transform="rotate(-90 55 55)" style={{ transition: "stroke-dasharray 1s ease" }} />
              <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#0ea5e9" /></linearGradient></defs>
              <text x={55} y={51} textAnchor="middle" fontSize={20} fontWeight={800} fill="var(--text-primary)" fontFamily="Syne,sans-serif">{completionPct}%</text>
              <text x={55} y={67} textAnchor="middle" fontSize={10} fill="var(--text-muted)">complete</text>
            </svg>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
              {[["Completed", completed, "#22c55e"], ["In Progress", inProg, "#0ea5e9"], ["Pending", pending, "#f59e0b"], ["Overdue", overdue, "#ef4444"]].map(([label, val, color]) => (
                <div key={label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{label}</span><span style={{ fontWeight: 700, color }}>{val}</span>
                  </div>
                  <div style={{ height: 5, background: "var(--border)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: `${total ? (val / total) * 100 : 0}%`, background: color, borderRadius: 99, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>Priority Breakdown</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["high", "🔴 High Priority", hi, "#ef4444"], ["medium", "🟡 Medium Priority", md, "#f59e0b"], ["low", "🟢 Low Priority", lo, "#22c55e"]].map(([, label, val, color]) => (
              <div key={label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{label}</span>
                  <span style={{ fontWeight: 800, color, fontFamily: "Syne,sans-serif" }}>{val}</span>
                </div>
                <div style={{ height: 10, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${total ? (val / total) * 100 : 0}%`, background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 99, transition: "width 0.8s ease 0.2s" }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {cats.map(([cat, count]) => (
              <span key={cat} style={{ padding: "4px 10px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>{cat} <strong style={{ color: "#6366f1" }}>{count}</strong></span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Recent Tasks</h3>
          <button onClick={() => setPage("tasks")} style={{ fontSize: 13, color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>View all →</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recentTasks.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: PRIORITY_COLORS[task.priority].dot, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{task.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{task.category} · Due {fmtDate(task.dueDate)}</div>
              </div>
              <StatusBadge status={task.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tasks Page ───────────────────────────────────────────────────────────────
function TasksPage({ tasks, setTasks, toast, user }) {
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sort, setSort] = useState("dueDate");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const filtered = tasks
    .filter(t => {
      const q = search.toLowerCase();
      return (!q || t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q))
        && (filterPriority === "all" || t.priority === filterPriority)
        && (filterStatus === "all" || t.status === filterStatus);
    })
    .sort((a, b) => {
      if (sort === "dueDate") return new Date(a.dueDate || "9999") - new Date(b.dueDate || "9999");
      if (sort === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      if (sort === "title") return a.title.localeCompare(b.title);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const deleteTask = id => { setTasks(t => t.filter(x => x.id !== id)); toast("Task deleted", "info"); };
  const toggleComplete = id => {
    setTasks(t => t.map(x => x.id === id ? { ...x, status: x.status === "completed" ? "pending" : "completed" } : x));
    toast("Task updated ✓", "success");
  };
  const saveTask = (task) => {
    if (editing) {
      setTasks(t => t.map(x => x.id === task.id ? task : x));
      toast("Task updated ✓", "success");
    } else {
      setTasks(t => [{ ...task, id: uid(), createdAt: now(), userId: user.id }, ...t]);
      toast("Task created! 🎉", "success");
    }
    setShowModal(false); setEditing(null);
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Controls */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." style={{
              width: "100%", padding: "10px 14px 10px 38px", background: "var(--bg)",
              border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14, color: "var(--text-primary)", outline: "none",
            }} />
          </div>
          <Select value={filterPriority} onChange={setFilterPriority} options={[["all","All Priorities"],["high","🔴 High"],["medium","🟡 Medium"],["low","🟢 Low"]]} />
          <Select value={filterStatus} onChange={setFilterStatus} options={[["all","All Status"],["pending","Pending"],["in-progress","In Progress"],["completed","Completed"]]} />
          <Select value={sort} onChange={setSort} options={[["dueDate","Sort: Due Date"],["priority","Sort: Priority"],["title","Sort: Title"],["createdAt","Sort: Newest"]]} />
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary" style={{
            padding: "10px 18px", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", color: "#fff",
            border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap",
            transition: "all 0.2s", boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
          }}>+ New Task</button>
        </div>
      </div>

      {/* Count */}
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 14, fontWeight: 500 }}>{filtered.length} task{filtered.length !== 1 ? "s" : ""} found</div>

      {/* List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>No tasks found</div>
            <div style={{ fontSize: 14 }}>Try adjusting your filters or create a new task</div>
          </div>
        )}
        {filtered.map(task => (
          <TaskCard key={task.id} task={task} onEdit={() => { setEditing(task); setShowModal(true); }} onDelete={() => deleteTask(task.id)} onToggle={() => toggleComplete(task.id)} />
        ))}
      </div>

      {showModal && <TaskModal initial={editing} onSave={saveTask} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      padding: "10px 14px", background: "var(--bg)", border: "1.5px solid var(--border)",
      borderRadius: 10, fontSize: 13, color: "var(--text-secondary)", cursor: "pointer", outline: "none", fontWeight: 500,
    }}>
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}

function TaskCard({ task, onEdit, onDelete, onToggle }) {
  const over = isOverdue(task.dueDate, task.status);
  const pc = PRIORITY_COLORS[task.priority];
  return (
    <div className="task-card" style={{
      background: "var(--surface)", border: `1px solid ${over ? "#fca5a5" : "var(--border)"}`,
      borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 14, transition: "all 0.2s",
      borderLeft: `4px solid ${pc.dot}`,
    }}>
      <input type="checkbox" checked={task.status === "completed"} onChange={onToggle}
        style={{ width: 18, height: 18, marginTop: 2, accentColor: "#6366f1", cursor: "pointer", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", textDecoration: task.status === "completed" ? "line-through" : "none", opacity: task.status === "completed" ? 0.6 : 1 }}>{task.title}</span>
          <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: pc.bg, color: pc.text }}>{task.priority}</span>
          <StatusBadge status={task.status} />
          {over && <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#fee2e2", color: "#dc2626" }}>OVERDUE</span>}
        </div>
        {task.description && <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.5 }}>{task.description}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 12, color: "var(--text-muted)" }}>
          <span>📂 {task.category}</span>
          <span>📅 {fmtDate(task.dueDate)}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
        <button onClick={onEdit} className="icon-btn" style={{ padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--bg)", cursor: "pointer", fontSize: 15, color: "var(--text-secondary)" }}>✎</button>
        <button onClick={onDelete} className="icon-btn" style={{ padding: "7px 10px", border: "1px solid #fca5a5", borderRadius: 8, background: "#fff1f2", cursor: "pointer", fontSize: 15, color: "#ef4444" }}>✕</button>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    pending: { bg: "#fef3c7", text: "#b45309", label: "Pending" },
    "in-progress": { bg: "#dbeafe", text: "#1d4ed8", label: "In Progress" },
    completed: { bg: "#dcfce7", text: "#16a34a", label: "Completed" },
  };
  const c = cfg[status] || cfg.pending;
  return <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.text }}>{c.label}</span>;
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({ initial, onSave, onClose }) {
  const blank = { title: "", description: "", priority: "medium", status: "pending", dueDate: "", category: "Other" };
  const [form, setForm] = useState(initial || blank);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: 32, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", animation: "fadeUp 0.25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", fontFamily: "Syne,sans-serif" }}>{initial ? "Edit Task" : "New Task"}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <FieldGroup label="Title *">
            <input value={form.title} onChange={set("title")} placeholder="What needs to be done?" style={inputStyle} />
          </FieldGroup>
          <FieldGroup label="Description">
            <textarea value={form.description} onChange={set("description")} placeholder="Add more details..." rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }} />
          </FieldGroup>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldGroup label="Priority">
              <select value={form.priority} onChange={set("priority")} style={inputStyle}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🟢 Low</option>
              </select>
            </FieldGroup>
            <FieldGroup label="Status">
              <select value={form.status} onChange={set("status")} style={inputStyle}>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </FieldGroup>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <FieldGroup label="Due Date">
              <input type="date" value={form.dueDate} onChange={set("dueDate")} style={inputStyle} />
            </FieldGroup>
            <FieldGroup label="Category">
              <select value={form.category} onChange={set("category")} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </FieldGroup>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={onClose} style={{ flex: 1, padding: "12px", background: "var(--bg)", border: "1.5px solid var(--border)", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Cancel</button>
            <button onClick={save} className="btn-primary" style={{ flex: 2, padding: "12px", background: "linear-gradient(135deg, #6366f1, #0ea5e9)", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all 0.2s", boxShadow: "0 4px 14px rgba(99,102,241,0.35)" }}>
              {initial ? "Save Changes" : "Create Task"} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", background: "var(--bg)",
  border: "1.5px solid var(--border)", borderRadius: 10, fontSize: 14,
  color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
};

function FieldGroup({ label, children }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

// ─── Kanban Board ─────────────────────────────────────────────────────────────
function KanbanBoard({ tasks, setTasks, toast }) {
  const [dragging, setDragging] = useState(null);
  const [over, setOver] = useState(null);

  const cols = {
    pending:      { label: "📋 Pending",     color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
    "in-progress":{ label: "⚡ In Progress", color: "#0ea5e9", bg: "rgba(14,165,233,0.08)" },
    completed:    { label: "✅ Completed",   color: "#22c55e", bg: "rgba(34,197,94,0.08)"  },
  };

  const drop = (status) => {
    if (dragging && dragging !== status) {
      setTasks(t => t.map(x => x.id === dragging ? { ...x, status } : x));
      toast(`Task moved to ${cols[status].label.split(" ").slice(1).join(" ")} ✓`, "success");
    }
    setDragging(null); setOver(null);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "Syne,sans-serif", color: "var(--text-primary)", marginBottom: 6 }}>Kanban Board</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Drag and drop tasks between columns to update their status</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {STATUS_COLS.map(status => {
          const colTasks = tasks.filter(t => t.status === status);
          const c = cols[status];
          return (
            <div key={status}
              onDragOver={e => { e.preventDefault(); setOver(status); }}
              onDragLeave={() => setOver(null)}
              onDrop={() => drop(status)}
              style={{ background: over === status ? c.bg : "var(--surface)", border: `2px solid ${over === status ? c.color : "var(--border)"}`, borderRadius: 18, padding: 18, minHeight: 400, transition: "all 0.2s", }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{c.label}</h3>
                <span style={{ background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 800, border: `1px solid ${c.color}40` }}>{colTasks.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {colTasks.map(task => (
                  <KanbanCard key={task.id} task={task} onDragStart={() => setDragging(task.id)} />
                ))}
                {colTasks.length === 0 && (
                  <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13, border: "2px dashed var(--border)", borderRadius: 12 }}>
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({ task, onDragStart }) {
  const pc = PRIORITY_COLORS[task.priority];
  const over = isOverdue(task.dueDate, task.status);
  return (
    <div draggable onDragStart={onDragStart} style={{
      background: "var(--bg)", border: `1px solid ${over ? "#fca5a5" : "var(--border)"}`,
      borderRadius: 12, padding: "12px 14px", cursor: "grab",
      borderLeft: `3px solid ${pc.dot}`, userSelect: "none", transition: "all 0.15s",
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6, lineHeight: 1.4 }}>{task.title}</div>
      {task.description && <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{task.description}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: pc.bg, color: pc.text }}>{task.priority}</span>
        <span style={{ fontSize: 11, color: over ? "#ef4444" : "var(--text-muted)", fontWeight: over ? 700 : 400 }}>
          {over ? "⚠ " : "📅 "}{fmtDate(task.dueDate)}
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", background: "var(--surface)", display: "inline-block", padding: "2px 8px", borderRadius: 20, border: "1px solid var(--border)" }}>{task.category}</div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────
function ProfilePage({ user, tasks }) {
  const userTasks = tasks;
  const completed = userTasks.filter(t => t.status === "completed").length;
  const rate = userTasks.length ? Math.round((completed / userTasks.length) * 100) : 0;
  const topCat = (() => { const m = {}; userTasks.forEach(t => m[t.category] = (m[t.category]||0)+1); return Object.entries(m).sort((a,b)=>b[1]-a[1])[0]?.[0] || "—"; })();

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ background: "linear-gradient(135deg, #6366f1, #0ea5e9)", padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 150, height: 150, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <div style={{ position: "absolute", bottom: -40, left: 100, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(255,255,255,0.25)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 24, border: "3px solid rgba(255,255,255,0.4)" }}>{user.avatar}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "Syne,sans-serif" }}>{user.name}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>{user.email}</div>
              <div style={{ marginTop: 8, display: "inline-block", background: "rgba(255,255,255,0.2)", color: "#fff", padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}>⭐ Pro Member</div>
            </div>
          </div>
        </div>
        <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
          {[["Total Tasks", userTasks.length, "#6366f1"], ["Completed", completed, "#22c55e"], ["Completion Rate", `${rate}%`, "#0ea5e9"], ["Top Category", topCat, "#f59e0b"]].map(([l, v, c]) => (
            <div key={l} style={{ padding: 16, background: "var(--bg)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: c, fontFamily: "Syne,sans-serif" }}>{v}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, color: "var(--text-primary)" }}>Activity Log</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {tasks.slice(0, 6).map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--bg)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `rgba(99,102,241,${0.1 + i * 0.03})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {t.status === "completed" ? "✅" : t.status === "in-progress" ? "⚡" : "📋"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Created {fmtDate(t.createdAt)}</div>
              </div>
              <StatusBadge status={t.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
function SettingsPage({ dark, setDark, toast }) {
  const [notifs, setNotifs] = useState({ email: true, push: true, deadline: true, weekly: false });
  const toggle = k => () => setNotifs(n => ({ ...n, [k]: !n[k] }));

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: "Syne,sans-serif", color: "var(--text-primary)" }}>Settings</h2>

      {[
        { title: "Appearance", icon: "🎨", children: (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Dark Mode</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Switch between light and dark themes</div></div>
            <Toggle on={dark} onToggle={() => { setDark(d => !d); toast("Theme updated", "success"); }} />
          </div>
        )},
        { title: "Notifications", icon: "🔔", children: (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["email", "Email Notifications", "Receive task updates via email"], ["push", "Push Notifications", "Browser notifications for tasks"], ["deadline", "Deadline Reminders", "Get reminded before tasks are due"], ["weekly", "Weekly Summary", "Weekly digest of your task progress"]].map(([k, label, desc]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div></div>
                <Toggle on={notifs[k]} onToggle={() => { toggle(k)(); toast(`${label} ${!notifs[k] ? "enabled" : "disabled"}`, "info"); }} />
              </div>
            ))}
          </div>
        )},
        { title: "Data & Privacy", icon: "🔒", children: (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["Export Data", "Download all your tasks as JSON", "#6366f1"], ["Clear Completed", "Remove all completed tasks", "#f59e0b"], ["Delete Account", "Permanently delete your account", "#ef4444"]].map(([label, desc, color]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div><div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{label}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{desc}</div></div>
                <button onClick={() => toast(`${label} — coming soon`, "info")} style={{ padding: "7px 16px", border: `1px solid ${color}`, borderRadius: 8, background: "transparent", color, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{label.split(" ")[0]}</button>
              </div>
            ))}
          </div>
        )},
      ].map(s => (
        <div key={s.title} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{s.title}</h3>
          </div>
          {s.children}
        </div>
      ))}
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 99, background: on ? "linear-gradient(135deg, #6366f1, #0ea5e9)" : "var(--border)",
      border: "none", cursor: "pointer", position: "relative", transition: "all 0.2s", flexShrink: 0,
    }}>
      <span style={{ position: "absolute", top: 3, left: on ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
    </button>
  );
}
