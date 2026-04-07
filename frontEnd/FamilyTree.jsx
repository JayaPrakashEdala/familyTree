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
    width: 100%;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.bg};
    background-image:
      radial-gradient(ellipse at 20% 20%, rgba(232,192,125,0.06) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 80%, rgba(232,192,125,0.04) 0%, transparent 50%);
  }

  .phone {
    width: 100%;
    max-width: 900px;
    min-height: 100vh;
    background: ${theme.surface};
    border-radius: 20px;
    border: 1.5px solid ${theme.border};
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow:
      0 0 0 1px rgba(232,192,125,0.08),
      0 40px 80px rgba(0,0,0,0.6),
      inset 0 1px 0 rgba(255,255,255,0.05);
    position: relative;
  }

  .status-bar {
    padding: 14px 24px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 10px;
    color: ${theme.muted};
    letter-spacing: 0.08em;
  }

  .topbar {
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${theme.border};
  }

  .topbar-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 22px;
    font-weight: 600;
    color: ${theme.accent};
    letter-spacing: 0.02em;
  }

  .screen { flex: 1; display: flex; flex-direction: column; padding: 24px; gap: 14px; animation: fadeIn 0.35s ease; }

  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .hero-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 0 20px;
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
    min-height: 340px;
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
`;

const RELATION_TYPES = ["Parent", "Child", "Sibling", "Spouse", "Grandparent", "Grandchild", "Aunt/Uncle", "Cousin"];



// Tree layout
const treeNodes = [
  { id: "self", label: "You", avatar: "👤", x: 180, y: 150 },
  { id: "parent1", label: "Meera", avatar: "👩", x: 80, y: 60, relation: "Parent" },
  { id: "parent2", label: "Rajan", avatar: "👨", x: 280, y: 60, relation: "Parent" },
  { id: "sibling", label: "Arjun", avatar: "👦", x: 60, y: 260, relation: "Sibling" },
  { id: "spouse", label: "Priya", avatar: "👩", x: 290, y: 230, relation: "Spouse" },
  { id: "child", label: "Kavi", avatar: "🧒", x: 180, y: 290, relation: "Child" },
];

const treeEdges = [
  { from: "self", to: "parent1" },
  { from: "self", to: "parent2" },
  { from: "self", to: "sibling" },
  { from: "self", to: "spouse" },
  { from: "self", to: "child" },
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
  type: "Parent",
});
  const [addError, setAddError] = useState("");

const handleLogin = (userData) => {
  setUser(userData);
  setScreen("profile");
};  const handleLogout = () => setScreen("login");

  const handleAddRelation = () => {
if (!newRel.firstName.trim()) {
  setAddError("First name is required");
  return;
}    setRelations(r => [...r, { ...newRel, id: Date.now() }]);
    setNewRel({ name: "", type: "Parent", email: "" });
    setAddError("");
    setScreen("profile");
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="phone">
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
              relations={relations}
            />
          )}
          {screen === "addRelation" && (
            <AddRelationScreen
              newRel={newRel} setNewRel={setNewRel}
              onAdd={handleAddRelation}
              onBack={() => setScreen("profile")}
              error={addError}
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


function ProfileScreen({ user, setUser, onLogout, onAddRelations, onViewTree, relations }) {
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
            onChange={(e) => setUser(u => ({ ...u, firstName: e.target.value }))}
          />
        </div>

        <div className="input-group">
          <div className="input-label">Middle Name</div>
          <input
            className="input-field"
            value={user.middleName}
            onChange={(e) => setUser(u => ({ ...u, middleName: e.target.value }))}
          />
        </div>

        <div className="input-group">
          <div className="input-label">Last Name</div>
          <input
            className="input-field"
            value={user.lastName}
            onChange={(e) => setUser(u => ({ ...u, lastName: e.target.value }))}
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
            <div key={r.id} className="relation-chip">
              <div>
                <div className="relation-chip-name">{r.name}</div>
                <div className="relation-chip-type">{r.email}</div>
              </div>
              <span className="badge">{r.type}</span>
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

function AddRelationScreen({ newRel, setNewRel, onAdd, onBack, error }) {

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
            onChange={(e) =>
              setNewRel((r) => ({ ...r, firstName: e.target.value }))
            }
          />
        </div>

        {/* MIDDLE NAME */}
        <div className="input-group">
          <div className="input-label">Middle Name</div>
          <input
            className="input-field"
            value={newRel.middleName}
            onChange={(e) =>
              setNewRel((r) => ({ ...r, middleName: e.target.value }))
            }
          />
        </div>

        {/* LAST NAME */}
        <div className="input-group">
          <div className="input-label">Last Name</div>
          <input
            className="input-field"
            value={newRel.lastName}
            onChange={(e) =>
              setNewRel((r) => ({ ...r, lastName: e.target.value }))
            }
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

        {error && (
          <div style={{ color: theme.danger, fontSize: 11 }}>
            ⚠ {error}
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
  const W = 312, H = 360;

  // Build dynamic nodes from relations
  const centerX = W / 2, centerY = H / 2 - 20;
  const nodes = [{ id: "self", label: "You", avatar: "👤", x: centerX, y: centerY }];
  const edges = [];

  const angles = [];
  const count = Math.min(relations.length, 8);
  for (let i = 0; i < count; i++) angles.push((2 * Math.PI * i) / count - Math.PI / 2);

  const radius = count <= 3 ? 110 : count <= 5 ? 120 : 130;

  relations.slice(0, 8).forEach((rel, i) => {
    const angle = angles[i];
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    const id = `rel-${rel.id}`;
    nodes.push({ id, label: rel.name.split(" ")[0], avatar: "👤", x, y, relation: rel.type });
    edges.push({ from: "self", to: id });
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

        <div className="tree-container" style={{ height: H }}>
          <svg className="tree-svg" viewBox={`0 0 ${W} ${H}`}>
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
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {nodes.map(node => (
            <div
              key={node.id}
              className="node"
              style={{
                left: node.x - 28,
                top: node.y - 28,
                ...(node.id === "self" ? {
                  border: `2px solid ${theme.accent}`,
                  background: theme.accentDim,
                  boxShadow: `0 0 30px rgba(232,192,125,0.3)`,
                } : {}),
              }}
            >
              <span className="node-avatar">{node.avatar}</span>
              <span style={{ fontSize: 8, color: node.id === "self" ? theme.accent : theme.muted }}>{node.label}</span>
              {node.relation && <span style={{ fontSize: 7, color: theme.muted, letterSpacing: "0.04em" }}>{node.relation}</span>}
            </div>
          ))}

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

        <button className="btn-primary" onClick={onBack}>← Back to Profile</button>
      </div>
    </>
  );
}
