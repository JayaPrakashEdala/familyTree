import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
const theme = {
  bg: "#0D0F14",
  surface: "#161A23",
  card: "#1E2330",
  border: "#2A3147",
  accent: "#E8C07D",
  accentSoft: "#F0D9A8",
  accentDim: "rgba(232,192,125,0.15)",
  text: "#EEF0F5",
  muted: "#7A8099",
  danger: "#E07D7D",
  treeNode: "#2A3147",
  treeLine: "#E8C07D",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: ${theme.bg}; color: ${theme.text}; font-family: 'DM Mono', monospace; }

  .app {
  min-height: 100vh;
  width: 100vw;
  max-width: 100%;
  padding: 0;
  margin: 0;

  display: flex;
  align-items: stretch;
  justify-content: stretch;

  overflow: hidden;
  }

  .phone {
  width: 100vw;
  max-width: none;
  width: 100%;

  height: 100vh;

  background: ${theme.surface};
  border-radius: 0;
  border: none;
  overflow: hidden;

  display: flex;
  flex-direction: column;

  box-shadow: none;

  position: relative;
  }

  .status-bar {
    display: none;
    padding: 14px 24px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: ${theme.muted};
    letter-spacing: 0.08em;
  }

  .topbar {
    padding: 16px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${theme.border};
    width: 100%;
    background: ${theme.surface};
  }

  .topbar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: ${theme.accent};
    letter-spacing: 0.02em;
  }

  .screen { 
    flex: 1; 
    display: flex; 
    flex-direction: column; 
    padding: 0;
    gap: 0;
    animation: fadeIn 0.35s ease;
    width: 100%;
    height: 100%;
  }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .hero-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
    width: 100%;
  }

  .tree-icon {
    width: 80px; height: 80px;
    border: 1.5px solid ${theme.accent};
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 34px;
    background: ${theme.accentDim};
    box-shadow: 0 0 30px rgba(232,192,125,0.15);
  }

  .app-name {
    font-family: 'Cormorant Garamond', serif;
    font-size: 28px;
    font-weight: 600;
    color: ${theme.accent};
    letter-spacing: 0.05em;
  }

  .tagline { font-size: 10px; color: ${theme.muted}; letter-spacing: 0.15em; text-transform: uppercase; }

  .btn-primary {
    width: 100%;
    padding: 16px;
    background: ${theme.accent};
    color: #0D0F14;
    border: none;
    border-radius: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.08em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s;
    box-shadow: 0 4px 20px rgba(232,192,125,0.25);
  }
  .btn-primary:hover { background: ${theme.accentSoft}; box-shadow: 0 6px 30px rgba(232,192,125,0.4); transform: translateY(-1px); }

  .btn-secondary {
    width: 100%;
    padding: 14px;
    background: transparent;
    color: ${theme.text};
    border: 1px solid ${theme.border};
    border-radius: 12px;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    letter-spacing: 0.06em;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s;
  }
  .btn-secondary:hover { border-color: ${theme.accent}; color: ${theme.accent}; background: ${theme.accentDim}; }

  .btn-ghost {
    background: transparent;
    border: none;
    color: ${theme.muted};
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.08em;
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 8px;
    transition: all 0.2s;
  }
  .btn-ghost:hover { color: ${theme.danger}; background: rgba(224,125,125,0.1); }

  .btn-danger {
    background: transparent;
    border: 1px solid ${theme.danger};
    color: ${theme.danger};
    border-radius: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
    cursor: pointer;
    padding: 8px 14px;
    transition: all 0.2s;
  }
  .btn-danger:hover { background: rgba(224,125,125,0.12); }

  .profile-row {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .profile-label { font-size: 10px; color: ${theme.muted}; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
  .profile-value { font-size: 14px; color: ${theme.text}; }

  .edit-btn {
    background: ${theme.accentDim};
    border: 1px solid rgba(232,192,125,0.3);
    color: ${theme.accent};
    border-radius: 8px;
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.08em;
    cursor: pointer;
    padding: 6px 12px;
    transition: all 0.2s;
  }
  .edit-btn:hover { background: rgba(232,192,125,0.25); }

  .input-group { display: flex; flex-direction: column; gap: 6px; }
  .input-label { font-size: 10px; color: ${theme.muted}; letter-spacing: 0.1em; text-transform: uppercase; }
  .input-field {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    border-radius: 10px;
    padding: 13px 14px;
    color: ${theme.text};
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
    width: 100%;
  }
  .input-field:focus { border-color: ${theme.accent}; }
  .input-field::placeholder { color: ${theme.muted}; }

  select.input-field { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%237A8099' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; }

  .section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 16px;
    font-style: italic;
    color: ${theme.muted};
    letter-spacing: 0.04em;
    margin-bottom: 2px;
  }

  .divider { height: 1px; background: ${theme.border}; margin: 2px 0; }

  /* Tree Canvas */
  .tree-container {
    flex: 1;
    background: ${theme.card};
    border: 1px solid ${theme.border};
    border-radius: 16px;
    overflow: hidden;
    position: relative;
    display: flex; align-items: center; justify-content: center;
    min-height: 500px;
  }

  .node {
    position: absolute;
    width: 64px; height: 64px;
    border-radius: 50%;
    background: ${theme.surface};
    border: 2px solid ${theme.accent};
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    font-size: 9px;
    color: ${theme.accent};
    letter-spacing: 0.06em;
    text-align: center;
    box-shadow: 0 0 20px rgba(232,192,125,0.15);
    cursor: pointer;
    transition: box-shadow 0.2s;
    z-index: 2;
  }
  .node:hover { box-shadow: 0 0 30px rgba(232,192,125,0.35); }
  .node-name { font-size: 8px; color: ${theme.muted}; margin-top: 2px; }
  .node-avatar { font-size: 20px; }

  svg.tree-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }

  .badge {
    background: ${theme.accentDim};
    border: 1px solid rgba(232,192,125,0.3);
    color: ${theme.accent};
    border-radius: 20px;
    font-size: 9px;
    padding: 3px 10px;
    letter-spacing: 0.08em;
  }

  .relation-chip {
    background: ${theme.card};
    border: 1px solid ${theme.border};
    border-radius: 8px;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
  }
  .relation-chip-name { color: ${theme.text}; }
  .relation-chip-type { color: ${theme.muted}; font-size: 10px; }

  .scroll-area { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-bottom: 4px; }
  .scroll-area::-webkit-scrollbar { width: 4px; }
  .scroll-area::-webkit-scrollbar-track { background: transparent; }
  .scroll-area::-webkit-scrollbar-thumb { background: ${theme.border}; border-radius: 2px; }

  .nav-tabs {
    display: flex;
    gap: 2px;
    padding: 4px;
    background: ${theme.card};
    border-radius: 10px;
    border: 1px solid ${theme.border};
    margin-bottom: 4px;
  }
  .nav-tab {
    flex: 1; text-align: center;
    padding: 8px 4px;
    font-size: 10px;
    letter-spacing: 0.06em;
    border-radius: 7px;
    cursor: pointer;
    color: ${theme.muted};
    background: transparent;
    border: none;
    font-family: 'DM Mono', monospace;
    transition: all 0.2s;
  }
  .nav-tab.active { background: ${theme.accent}; color: #0D0F14; }

  .empty-state {
    text-align: center;
    color: ${theme.muted};
    font-size: 11px;
    letter-spacing: 0.08em;
    padding: 30px 0;
  }

  /* Mobile responsive */
  @media (max-width: 767px) {
    .app {
      width: 100%;
      padding: 20px;
      align-items: center;
      justify-content: center;
    }
    .phone {
      width: 100%;
      max-width: 600px;
      height: 90vh;
      border-radius: 20px;
      border: 1.5px solid ${theme.border};
      box-shadow:
        0 0 0 1px rgba(232,192,125,0.08),
        0 40px 80px rgba(0,0,0,0.6),
        inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .status-bar {
      display: flex !important;
    }
    .screen { 
      padding: 24px;
    }
    .topbar {
      padding: 16px 24px;
    }
    .hero-section {
      padding: 40px 0 20px;
    }
  }

  /* Desktop - full width layout */
  @media (min-width: 768px) {
    .app {
      width: 100vw;
    }
    .phone {
      width: 100%;
    }
    .screen {
      padding: 40px 60px;
      gap: 20px;
    }
    .topbar {
      padding: 24px 60px;
    }
    .topbar-title {
      font-size: 28px;
    }
    .hero-section {
      padding: 60px 20px;
      gap: 20px;
    }
    .tree-icon {
      width: 140px;
      height: 140px;
      font-size: 64px;
      border: 2.5px solid ${theme.accent};
    }
    .app-name {
      font-size: 48px;
    }
    .tagline {
      font-size: 14px;
    }
    .btn-primary {
      padding: 20px 24px;
      font-size: 16px;
      border-radius: 14px;
    }
    .btn-secondary {
      padding: 18px 24px;
      font-size: 16px;
      border-radius: 14px;
    }
    .btn-ghost {
      padding: 10px 16px;
      font-size: 14px;
      border-radius: 10px;
    }
    .btn-danger {
      padding: 12px 20px;
      font-size: 14px;
      border-radius: 10px;
    }
    .input-field {
      padding: 16px 18px;
      font-size: 15px;
      border-radius: 12px;
    }
    .input-label {
      font-size: 12px;
    }
    .input-group {
      gap: 10px;
    }
    .profile-row {
      padding: 18px 20px;
      border-radius: 14px;
    }
    .profile-label {
      font-size: 12px;
    }
    .profile-value {
      font-size: 16px;
    }
    .edit-btn {
      padding: 8px 16px;
      font-size: 12px;
      border-radius: 10px;
    }
    .section-title {
      font-size: 20px;
    }
    .badge {
      font-size: 11px;
      padding: 5px 14px;
    }
    .relation-chip {
      padding: 12px 16px;
      font-size: 14px;
      border-radius: 10px;
    }
    .nav-tabs {
      margin-bottom: 8px;
    }
    .nav-tab {
      padding: 12px 8px;
      font-size: 12px;
    }
    .empty-state {
      font-size: 14px;
      padding: 40px 0;
    }
  }
`;

const RELATION_TYPES = [
  "Father", "Mother", "Spouse", "Son", "Daughter", "Brother", "Sister"
];


function LoginScreen({ onLogin }) {
  const handleGoogleSuccess = (response) => {
  try {
    const decoded = jwtDecode(response.credential);

    const nameParts = decoded.name.split(" ");

    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
    const middleName =
      nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

    onLogin({
      firstName,
      middleName,
      lastName,
      email: decoded.email,
      avatar: decoded.picture,
      dob: "",
    });

  } catch (err) {
    console.error("JWT decode failed:", err);
  }
};

  return (
    <div className="screen" style={{ justifyContent: "space-between" }}>
      <div className="hero-section">
        <div className="tree-icon">🌳</div>
        <div className="app-name">Kinship</div>
        <div className="tagline">Map your family, forever</div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", paddingBottom: 20 }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.log("Login Failed")}
        />
      </div>
    </div>
  );
}
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState({
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  email: "",
});
  const [relations, setRelations] = useState([]);
  const [newRel, setNewRel] = useState({
  email: "",
  firstName: "",
  middleName: "",
  lastName: "",
  type: "Father",
  linkedParent: "", // for children: which spouse/parent they belong to
  status: "current", // deprecated: kept for compatibility
  notes: "" // additional info
});
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

const handleLogin = (userData) => {
  setUser(userData);
  setScreen("profile");
};  const handleLogout = () => setScreen("login");

  const handleDeleteRelation = (id) => {
    setRelations(r => r.filter(rel => rel.id !== id));
  };

  const handleAddRelation = () => {
  if (!newRel.firstName.trim()) {
    setAddError("First name is required");
    return;
  }

  // Validation: Prevent multiple primary parents
  const fatherTypes = ["Father"];
  const motherTypes = ["Mother"];
  const spouseTypes = ["Spouse"];

  // Check if already has a father
  if (fatherTypes.includes(newRel.type)) {
    if (relations.some(r => fatherTypes.includes(r.type))) {
      setAddError("You can only have one Father");
      return;
    }
  }

  // Check if already has a mother
  if (motherTypes.includes(newRel.type)) {
    if (relations.some(r => motherTypes.includes(r.type))) {
      setAddError("You can only have one Mother");
      return;
    }
  }

  // Check if already has a spouse
  if (spouseTypes.includes(newRel.type)) {
    if (relations.some(r => spouseTypes.includes(r.type))) {
      setAddError("You already have a spouse.");
      return;
    }
  }

  const fullName = `${newRel.firstName} ${newRel.middleName} ${newRel.lastName}`.trim();

  setRelations(r => [
    ...r,
    {
      ...newRel,
      name: fullName,   // ✅ ADD THIS
      id: Date.now()
    }
  ]);

  setNewRel({
    email: "",
    firstName: "",
    middleName: "",
    lastName: "",
    type: "Father",
    linkedParent: "",
    status: "current",
    notes: ""
  });

  setAddError("");
  setAddSuccess("Relation added successfully! ✓");
  setTimeout(() => setAddSuccess(""), 2000);
  setScreen("profile");
};
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="phone" style={{ margin: "0 auto" }}>
          <div className="status-bar">
            <span>9:41</span>
            <span>●●●</span>
          </div>

          {screen === "login" && <LoginScreen onLogin={handleLogin} />}
          {screen === "profile" && (
            <ProfileScreen
              user={user}
              setUser={setUser}
      
              onLogout={handleLogout}
              onAddRelations={() => setScreen("addRelation")}
              onViewTree={() => setScreen("tree")}
              onDeleteRelation={handleDeleteRelation}
              relations={relations}
            />
          )}
          {screen === "addRelation" && (
            <AddRelationScreen
              newRel={newRel} setNewRel={setNewRel}
              onAdd={handleAddRelation}
              onBack={() => setScreen("profile")}
              error={addError}
              success={addSuccess}
            />
          )}
          {screen === "tree" && (
            <TreeScreen
              user={user}
              relations={relations}
              onBack={() => setScreen("profile")}
            />
          )}
        </div>
      </div>
    </>
  );
}


function ProfileScreen({ user, setUser, onLogout, onAddRelations, onViewTree, onDeleteRelation, relations }) {
  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Kinship</span>
        <button className="btn-danger" onClick={onLogout}>logout</button>
      </div>

      <div className="screen">

        {/* Header */}
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: theme.accent }}>
          {user.firstName} {user.lastName}
        </div>

        <div className="divider" />

        {/* Profile Form */}
        <div className="section-title">Profile Details</div>

        <div className="input-group">
          <div className="input-label">First Name</div>
          <input
            className="input-field"
            value={user.firstName}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
              setUser(u => ({ ...u, firstName: value }));
            }}
            placeholder="Letters only"
          />
        </div>

        <div className="input-group">
          <div className="input-label">Middle Name</div>
          <input
            className="input-field"
            value={user.middleName}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
              setUser(u => ({ ...u, middleName: value }));
            }}
            placeholder="Letters only"
          />
        </div>

        <div className="input-group">
          <div className="input-label">Last Name</div>
          <input
            className="input-field"
            value={user.lastName}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
              setUser(u => ({ ...u, lastName: value }));
            }}
            placeholder="Letters only"
          />
        </div>

        <div className="input-group">
          <div className="input-label">Date of Birth</div>
          <input
            type="date"
            className="input-field"
            value={user.dob}
            onChange={(e) => setUser(u => ({ ...u, dob: e.target.value }))}
          />
        </div>

        <div className="divider" />

        {/* Relations */}
        <div className="section-title">Relations ({relations.length})</div>

        <div className="scroll-area" style={{ maxHeight: 140 }}>
          {relations.length === 0 && (
            <div className="empty-state">No relations added yet</div>
          )}

          {relations.map(r => (
            <div key={r.id} className="relation-chip" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <div className="relation-chip-name">{r.name || `${r.firstName} ${r.lastName}`}</div>
                <div className="relation-chip-type">
                  {r.email}
                  {r.linkedParent && ` • Via: ${r.linkedParent}`}
                </div>
              </div>
              <span className="badge">{r.type}</span>
              <button
                className="btn-danger"
                onClick={() => onDeleteRelation(r.id)}
                style={{ marginLeft: 10, padding: "6px 10px", fontSize: 10 }}
              >
                ✕ Remove
              </button>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onAddRelations}>
          ＋ Add Relations
        </button>

        <button className="btn-secondary" onClick={onViewTree}>
          🌳 View Tree
        </button>

      </div>
    </>
  );
}

function AddRelationScreen({ newRel, setNewRel, onAdd, onBack, error, success }) {

  // 🔥 Simulate backend check (replace later with API)
  const checkUserByEmail = async (email) => {
    // TODO: replace with real API
    if (email === "test@gmail.com") {
      return {
        exists: true,
        firstName: "Rahul",
        middleName: "Kumar",
        lastName: "Sharma",
      };
    }
    return { exists: false };
  };

  const handleEmailBlur = async () => {
    if (!newRel.email.trim()) return;

    const res = await checkUserByEmail(newRel.email);

    if (res.exists) {
      setNewRel((r) => ({
        ...r,
        firstName: res.firstName,
        middleName: res.middleName,
        lastName: res.lastName,
      }));
    }
  };

  return (
    <>
      <div className="topbar">
        <button className="btn-ghost" onClick={onBack}>← back</button>
        <span className="topbar-title">Kinship</span>
      </div>

      <div className="screen">

        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: theme.accent }}>
          Add a Relation
        </div>

        <div className="divider" />

        {/* EMAIL FIRST */}
        <div className="input-group">
          <div className="input-label">Email</div>
          <input
            className="input-field"
            placeholder="email@example.com (optional)"
            value={newRel.email}
            onChange={(e) =>
              setNewRel((r) => ({ ...r, email: e.target.value }))
            }
            onBlur={handleEmailBlur}
          />
        </div>

        {/* FIRST NAME */}
        <div className="input-group">
          <div className="input-label">First Name</div>
          <input
            className="input-field"
            value={newRel.firstName}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
              setNewRel((r) => ({ ...r, firstName: value }));
            }}
            placeholder="Letters only"
          />
        </div>

        {/* MIDDLE NAME */}
        <div className="input-group">
          <div className="input-label">Middle Name</div>
          <input
            className="input-field"
            value={newRel.middleName}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
              setNewRel((r) => ({ ...r, middleName: value }));
            }}
            placeholder="Letters only"
          />
        </div>

        {/* LAST NAME */}
        <div className="input-group">
          <div className="input-label">Last Name</div>
          <input
            className="input-field"
            value={newRel.lastName}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
              setNewRel((r) => ({ ...r, lastName: value }));
            }}
            placeholder="Letters only"
          />
        </div>

        {/* RELATION TYPE */}
        <div className="input-group">
          <div className="input-label">Relation Type</div>
          <select
            className="input-field"
            value={newRel.type}
            onChange={(e) =>
              setNewRel((r) => ({ ...r, type: e.target.value }))
            }
          >
            {RELATION_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* CONDITIONAL: For Children - Link to Parent/Spouse */}
        {["Son", "Daughter", "Step-Son", "Step-Daughter"].includes(newRel.type) && (
          <div className="input-group">
            <div className="input-label">Mother / Spouse (Optional)</div>
            <input
              className="input-field"
              placeholder="Enter mother/spouse name"
              value={newRel.linkedParent}
              onChange={(e) =>
                setNewRel((r) => ({ ...r, linkedParent: e.target.value }))
              }
            />
            <div style={{ fontSize: 9, color: theme.muted, marginTop: 4 }}>
              Specify which spouse/family member this child belongs to
            </div>
          </div>
        )}

        {/* CONDITIONAL: For Spouses */}
        {newRel.type === "Spouse" && (
          <div style={{ fontSize: 9, color: theme.muted, marginTop: 4, marginBottom: 12 }}>
            💡 Add your current or former spouse
          </div>
        )}

        {error && (
          <div style={{ color: theme.danger, fontSize: 11 }}>
            ⚠ {error}
          </div>
        )}

        {success && (
          <div style={{ color: theme.accent, fontSize: 11 }}>
            ✓ {success}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <button className="btn-primary" onClick={onAdd}>
          Add Relation
        </button>

        <button className="btn-secondary" onClick={onBack}>
          Cancel
        </button>

      </div>
    </>
  );
}
function TreeScreen({ user, relations, onBack }) {
  const W = 600, H = 600;

  // Build dynamic nodes from relations organized by generation
  const centerX = W / 2, centerY = H / 2;
  const nodes = [{ id: "self", label: "You", avatar: "👤", x: centerX, y: centerY, generation: 3 }];
  const edges = [];

  // Categorize relations by generation with simplified types
  const fathers = relations.filter(r => r.type === "Father");
  const mothers = relations.filter(r => r.type === "Mother");
  const spouses = relations.filter(r => r.type === "Spouse");
  const children = relations.filter(r => ["Son", "Daughter"].includes(r.type));
  const siblings = relations.filter(r => ["Brother", "Sister"].includes(r.type));

  // Generation 2: Parents (Father, Mother)
  const parents = [...fathers, ...mothers];
  parents.forEach((parent, i) => {
    const x = centerX - 150 + i * 300;
    const y = 150;
    const id = `rel-${parent.id}`;
    nodes.push({ id, label: parent.name ? parent.name.split(" ")[0] : parent.firstName, avatar: "👤", x, y, relation: parent.type, generation: 2 });
  });

  // Generation 2.5: Siblings (alongside user at same level)
  siblings.forEach((sibling, i) => {
    const x = centerX + (i === 0 ? 200 : -200);
    const y = centerY;
    const id = `rel-${sibling.id}`;
    nodes.push({ id, label: sibling.name ? sibling.name.split(" ")[0] : sibling.firstName, avatar: "👤", x, y, relation: sibling.type, generation: 2.5 });
  });

  // Generation 2.75: Spouses (alongside user)
  spouses.forEach((spouse, i) => {
    const x = centerX + (i === 0 ? 150 : -150);
    const y = centerY - 50;
    const id = `rel-${spouse.id}`;
    nodes.push({ id, label: spouse.name ? spouse.name.split(" ")[0] : spouse.firstName, avatar: "👤", x, y, relation: spouse.type, generation: 2.75 });
  });

  // Generation 4: Children (bottom)
  children.forEach((child, i) => {
    const spacing = children.length > 3 ? 100 : 120;
    const startX = centerX - ((children.length - 1) * spacing / 2);
    const x = startX + i * spacing;
    const y = 450;
    const id = `rel-${child.id}`;
    nodes.push({ id, label: child.name ? child.name.split(" ")[0] : child.firstName, avatar: "👤", x, y, relation: child.type, generation: 4 });
  });

  // Build edges based on relationship type
  relations.forEach((rel) => {
    const id = `rel-${rel.id}`;
    const parentTypes = ["Father", "Mother"];
    const childTypes = ["Son", "Daughter"];
    const siblingTypes = ["Brother", "Sister"];
    const spouseType = "Spouse";

    if (parentTypes.includes(rel.type)) {
      // Parents point to user
      edges.push({ from: id, to: "self" });
    } else if (siblingTypes.includes(rel.type)) {
      // Siblings connect to same parents or to user
      edges.push({ from: id, to: "self" });
    } else if (rel.type === spouseType) {
      // Spouse connects to user
      edges.push({ from: id, to: "self" });
    } else if (childTypes.includes(rel.type)) {
      // Children connect from spouse or user
      const spouse = relations.find(r => r.type === "Spouse");
      if (spouse) {
        edges.push({ from: `rel-${spouse.id}`, to: id });
      } else {
        edges.push({ from: "self", to: id });
      }
    }
  });

  const getNode = id => nodes.find(n => n.id === id);

  return (
    <>
      <div className="topbar">
        <button className="btn-ghost" onClick={onBack}>← back</button>
        <span className="topbar-title">Kinship</span>
      </div>
      <div className="screen" style={{ paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: theme.accent }}>{`${user.firstName} ${user.lastName}'s Tree`}</div>
          <span className="badge">{relations.length} members</span>
        </div>

        <div className="tree-container" style={{ height: `${H}px` }}>
          <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(232,192,125,0.12)" />
                <stop offset="100%" stopColor="rgba(232,192,125,0)" />
              </radialGradient>
            </defs>
            <ellipse cx={W/2} cy={H/2} rx={140} ry={100} fill="url(#glow)" />
            {edges.map((e, i) => {
              const from = getNode(e.from), to = getNode(e.to);
              if (!from || !to) return null;
              return (
                <line
                  key={i}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={theme.treeLine}
                  strokeWidth="2.5"
                  strokeOpacity="0.8"
                  strokeDasharray="6 3"
                />
              );
            })}
            {nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="32"
                  fill={node.id === "self" ? theme.accentDim : theme.surface}
                  stroke={theme.accent}
                  strokeWidth="2"
                />
                <text
                  x={node.x}
                  y={node.y - 8}
                  textAnchor="middle"
                  fill={theme.accent}
                  fontSize="20"
                  fontFamily="'DM Mono', monospace"
                  style={{pointerEvents: "none"}}
                >
                  {node.avatar}
                </text>
                <text
                  x={node.x}
                  y={node.y + 12}
                  textAnchor="middle"
                  fill={node.id === "self" ? theme.accent : theme.muted}
                  fontSize="8"
                  fontFamily="'DM Mono', monospace"
                  style={{pointerEvents: "none"}}
                >
                  {node.label}
                </text>
                {node.relation && (
                  <text
                    x={node.x}
                    y={node.y + 22}
                    textAnchor="middle"
                    fill={theme.muted}
                    fontSize="7"
                    fontFamily="'DM Mono', monospace"
                    style={{pointerEvents: "none"}}
                  >
                    {node.relation}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {relations.length === 0 && (
            <div className="empty-state" style={{ position: "absolute" }}>
              Add relations to build your tree
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["Parent", "Child", "Sibling", "Spouse"].map(type => {
            const count = relations.filter(r => r.type === type).length;
            if (count === 0) return null;
            return (
              <div key={type} style={{ background: theme.card, border: `1px solid ${theme.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 10, color: theme.muted, letterSpacing: "0.08em" }}>
                {type}: <span style={{ color: theme.accent }}>{count}</span>
              </div>
            );
          })}
        </div>

        {/* JSON Data Section */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: theme.accent, marginBottom: 12 }}>Family Data (JSON)</div>
          <div className="divider" style={{ marginBottom: 12 }} />
          <div style={{ 
            background: theme.card, 
            border: `1px solid ${theme.border}`, 
            borderRadius: 12, 
            padding: 16,
            maxHeight: 300,
            overflow: "auto",
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: theme.text,
            lineHeight: "1.5",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word"
          }}>
            {JSON.stringify({
              user: Object.fromEntries(
                Object.entries({
                  firstName: user.firstName,
                  middleName: user.middleName,
                  lastName: user.lastName,
                  email: user.email,
                  dob: user.dob,
                  avatar: user.avatar
                }).filter(([_, v]) => v)
              ),
              relations: relations.map(r =>
                Object.fromEntries(
                  Object.entries({
                    id: r.id,
                    name: r.name,
                    type: r.type,
                    email: r.email
                  }).filter(([_, v]) => v)
                )
              )
            }, null, 2)}
          </div>
        </div>

        <button className="btn-primary" onClick={onBack}>← Back to Profile</button>
      </div>
    </>
  );
}
