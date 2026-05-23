import { useState, useRef, useEffect } from "react";

const PRIORITY_CONFIG = {
  急: { label: "急", color: "#ef4444", ring: "#ef4444" },
  中: { label: "中", color: "#f97316", ring: "#f97316" },
  低: { label: "低", color: "#22c55e", ring: "#22c55e" },
};

const EMOJI_LIST = [
  "🌾","🍇","🫛","🌽","🍅","🥬","🥕","🍓","🍈","🍑","🍒","🥦","🌿","🌱","🪴","🌳","🌲","🌵","🎋","🎍",
  "🦆","🐓","🐄","🐖","🐑","🐇","🦌","🐗","🐝","🦋","🐛","🐌","🐞","🦗","🦟","🐜","🐢","🐍","🦎","🐠",
  "🏔️","⛰️","🌋","🗻","🏕️","🌊","🏞️","🌄","🌅","🌠","⭐","🌟","✨","☀️","🌙","🌈","⛅","🌧️","❄️","🌬️",
  "🚜","⛏️","🪚","🔨","🪣","💧","🌡️","🧪","🧬","🔬","📋","📊","📈","🗓️","⏰","🔔","📍","🗂️","📦","🏠",
  "🍷","🍶","🧃","☕","🍵","🥂","🍺","🍻","🎵","🎷","🎸","🎹","🎺","🎻","🥁","🎤","🎧","🎼","🎭","🎨",
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","✅","🔥",
  "🌸","🌺","🌻","🌹","🌷","💐","🪷","🌼","🌞","🎃","🎄","🎆","🎇","🎑","🎋","🎍","🎎","🎏","🎐","🎗️",
  "🐉","🦁","🐯","🦊","🐺","🐻","🐼","🦝","🐨","🦘","🦙","🦒","🐘","🦏","🦛","🦬","🐃","🐂","🐎","🦄",
];

const initialAreas = [
  {
    id: 1, name: "金山", emoji: "🌾", color: "#5b3d8f",
    groups: [
      { id: "g1", name: null, tasks: [
        { id: "t1", text: "あ", priority: "中", done: false },
        { id: "t2", text: "あ", priority: "中", done: false },
      ]},
      { id: "g2", name: "ガラス温室", tasks: [
        { id: "t3", text: "誘引", priority: "急", done: false },
        { id: "t4", text: "棚線張り直し", priority: "中", done: false },
      ]},
      { id: "g3", name: "圃場２", tasks: [
        { id: "t5", text: "棚修理", priority: "急", done: false },
        { id: "t6", text: "草刈り", priority: "低", done: false },
      ]},
    ]
  },
  {
    id: 2, name: "鮎帰", emoji: "🍇", color: "#7c5c1e",
    groups: [
      { id: "g4", name: null, tasks: [
        { id: "t7", text: "棚線張る", priority: "急", done: false },
        { id: "t8", text: "シャインマスカット誘引", priority: "中", done: false },
      ]},
    ]
  },
  {
    id: 3, name: "横井上", emoji: "🌊", color: "#1e4a6e",
    groups: [
      { id: "g5", name: null, tasks: [
        { id: "t9", text: "あ", priority: "中", done: false },
        { id: "t10", text: "あ", priority: "中", done: false },
        { id: "t11", text: "あ", priority: "中", done: false },
        { id: "t12", text: "あ", priority: "中", done: false },
        { id: "t13", text: "あ", priority: "中", done: false },
        { id: "t14", text: "あ", priority: "中", done: false },
        { id: "t15", text: "あ", priority: "中", done: false },
      ]},
    ]
  },
  {
    id: 4, name: "吉尾", emoji: "🌸", color: "#7c1e5c",
    groups: [
      { id: "g6", name: null, tasks: [] },
    ]
  },
];

let nextId = 100;
const uid = () => `id-${nextId++}`;

function EmojiPicker({ current, onSelect, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: "absolute", top: "110%", left: 0, zIndex: 1000,
      background: "#1a1a2e", border: "1px solid #444", borderRadius: 12,
      padding: 10, width: 240, maxHeight: 200, overflowY: "auto",
      display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 3,
      boxShadow: "0 8px 32px rgba(0,0,0,0.8)"
    }}>
      {EMOJI_LIST.map(e => (
        <button key={e} onClick={() => { onSelect(e); onClose(); }} style={{
          background: e === current ? "#444" : "transparent",
          border: "none", borderRadius: 5, fontSize: 16, cursor: "pointer",
          padding: "2px", lineHeight: 1.4,
        }}>{e}</button>
      ))}
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete, onPriorityChange, onTextChange }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(task.text);
  const cfg = PRIORITY_CONFIG[task.priority];
  const priorities = ["急", "中", "低"];

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      padding: "6px 8px", background: "rgba(255,255,255,0.04)",
      borderRadius: 7, marginBottom: 3
    }}>
      <button onClick={onToggle} style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${cfg.ring}`,
        background: task.done ? cfg.ring : "transparent",
        cursor: "pointer", padding: 0
      }} />
      {editing ? (
        <input autoFocus value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={() => { onTextChange(val); setEditing(false); }}
          onKeyDown={e => e.key === "Enter" && e.target.blur()}
          style={{
            flex: 1, background: "transparent", border: "none",
            borderBottom: "1px solid #aaa", color: "#fff",
            fontSize: 12, outline: "none", padding: "1px 0"
          }}
        />
      ) : (
        <span onClick={() => setEditing(true)} style={{
          flex: 1, fontSize: 12, color: task.done ? "#555" : "#ddd",
          textDecoration: task.done ? "line-through" : "none",
          cursor: "text", lineHeight: 1.4, wordBreak: "break-all"
        }}>{task.text}</span>
      )}
      <button onClick={() => {
        const idx = priorities.indexOf(task.priority);
        onPriorityChange(priorities[(idx + 1) % priorities.length]);
      }} style={{
        fontSize: 10, fontWeight: "bold", color: cfg.color,
        background: "transparent", border: "none", cursor: "pointer",
        padding: "1px 3px", flexShrink: 0
      }}>{cfg.label}</button>
      <button onClick={onDelete} style={{
        color: "#555", background: "transparent", border: "none",
        cursor: "pointer", fontSize: 13, lineHeight: 1, flexShrink: 0
      }}>×</button>
    </div>
  );
}

function GroupSection({ group, onTasksChange }) {
  const addTask = () => {
    onTasksChange([...group.tasks, { id: uid(), text: "新タスク", priority: "中", done: false }]);
  };
  const updateTask = (id, patch) => {
    onTasksChange(group.tasks.map(t => t.id === id ? { ...t, ...patch } : t));
  };
  const deleteTask = (id) => {
    onTasksChange(group.tasks.filter(t => t.id !== id));
  };

  return (
    <div style={{ marginBottom: 6 }}>
      {group.name && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 5, padding: "3px 2px"
        }}>
          <span style={{ fontSize: 11, fontWeight: "bold", color: "#bbb" }}>{group.name}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{
              background: "#444", color: "#fff", borderRadius: "50%",
              width: 17, height: 17, fontSize: 10, display: "flex",
              alignItems: "center", justifyContent: "center"
            }}>{group.tasks.filter(t => !t.done).length}</span>
            <button onClick={addTask} style={{
              background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 4,
              color: "#aaa", cursor: "pointer", width: 18, height: 18, fontSize: 13,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>+</button>
          </div>
        </div>
      )}
      {group.tasks.map(task => (
        <TaskItem key={task.id} task={task}
          onToggle={() => updateTask(task.id, { done: !task.done })}
          onDelete={() => deleteTask(task.id)}
          onPriorityChange={p => updateTask(task.id, { priority: p })}
          onTextChange={t => updateTask(task.id, { text: t })}
        />
      ))}
      {!group.name && (
        <button onClick={addTask} style={{
          width: "100%", padding: "5px", background: "transparent",
          border: "1px dashed #3a3a4a", borderRadius: 6,
          color: "#666", cursor: "pointer", fontSize: 11, marginTop: 2
        }}>＋ タスク追加</button>
      )}
    </div>
  );
}

function AreaCard({ area, onUpdate, onDelete }) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(area.name);
  const emojiRef = useRef();

  const totalTasks = area.groups.reduce((s, g) => s + g.tasks.filter(t => !t.done).length, 0);

  const updateGroup = (gid, tasks) => {
    onUpdate({ ...area, groups: area.groups.map(g => g.id === gid ? { ...g, tasks } : g) });
  };
  const addGroup = () => {
    onUpdate({ ...area, groups: [...area.groups, { id: uid(), name: `圃場${area.groups.length + 1}`, tasks: [] }] });
  };

  return (
    // breakInside: avoid が大事 — カード途中で列を跨がない
    <div style={{
      background: area.color + "cc",
      borderRadius: 12, padding: 10, marginBottom: 10,
      border: `1px solid ${area.color}88`,
      breakInside: "avoid",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ position: "relative" }} ref={emojiRef}>
          <button onClick={() => setShowEmoji(v => !v)} style={{
            background: "transparent", border: "none",
            fontSize: 18, cursor: "pointer", lineHeight: 1, padding: 0
          }}>{area.emoji}</button>
          {showEmoji && (
            <EmojiPicker current={area.emoji}
              onSelect={e => onUpdate({ ...area, emoji: e })}
              onClose={() => setShowEmoji(false)} />
          )}
        </div>
        {editName ? (
          <input autoFocus value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={() => { onUpdate({ ...area, name: nameVal }); setEditName(false); }}
            onKeyDown={e => e.key === "Enter" && e.target.blur()}
            style={{
              background: "transparent", border: "none",
              borderBottom: "1px solid #fff", color: "#fff",
              fontSize: 13, fontWeight: "bold", outline: "none", flex: 1
            }}
          />
        ) : (
          <span onClick={() => setEditName(true)} style={{
            flex: 1, fontWeight: "bold", fontSize: 13, color: "#fff", cursor: "text"
          }}>{area.name}</span>
        )}
        <span style={{
          background: "#55558888", color: "#fff", borderRadius: "50%",
          width: 18, height: 18, fontSize: 10, display: "flex",
          alignItems: "center", justifyContent: "center", flexShrink: 0
        }}>{totalTasks}</span>
        <button onClick={addGroup} style={{
          background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 5,
          color: "#fff", cursor: "pointer", width: 22, height: 22, fontSize: 15,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>+</button>
        <button onClick={onDelete} style={{
          background: "transparent", border: "none", color: "#aaa", cursor: "pointer", fontSize: 13
        }}>…</button>
      </div>

      {/* Groups */}
      {area.groups.map(g => (
        <GroupSection key={g.id} group={g} onTasksChange={tasks => updateGroup(g.id, tasks)} />
      ))}
      {area.groups.length === 0 && (
        <button onClick={addGroup} style={{
          width: "100%", padding: "7px", background: "transparent",
          border: "1px dashed #555", borderRadius: 6, color: "#888", cursor: "pointer", fontSize: 11
        }}>＋ タスク追加</button>
      )}
    </div>
  );
}

export default function App() {
  const [areas, setAreas] = useState(initialAreas);
  const [showAddArea, setShowAddArea] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaEmoji, setNewAreaEmoji] = useState("🌾");
  const [showNewEmoji, setShowNewEmoji] = useState(false);

  const updateArea = (updated) => setAreas(areas.map(a => a.id === updated.id ? updated : a));
  const deleteArea = (id) => setAreas(areas.filter(a => a.id !== id));

  const addArea = () => {
    if (!newAreaName.trim()) return;
    const colors = ["#3d5e8f","#5b8f3d","#8f3d5b","#8f7c3d","#3d8f7c","#5b3d8f","#7c5c1e"];
    setAreas([...areas, {
      id: uid(), name: newAreaName, emoji: newAreaEmoji,
      color: colors[areas.length % colors.length],
      groups: [{ id: uid(), name: null, tasks: [] }]
    }]);
    setNewAreaName(""); setNewAreaEmoji("🌾"); setShowAddArea(false);
  };

  const totalIncomplete = areas.reduce((s, a) =>
    s + a.groups.reduce((gs, g) => gs + g.tasks.filter(t => !t.done).length, 0), 0);

  return (
    <div style={{
      minHeight: "100vh", background: "#12121c",
      fontFamily: "'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
      color: "#fff",
    }}>
      {/* Global CSS for column break indicators */}
      <style>{`
        .card-column {
          columns: 2;
          column-gap: 10px;
          padding: 10px;
          column-rule: 2px dashed #2a2a3a;
        }
        /* カードが列をまたいで切れた上端に点線 */
        .area-card-wrap {
          display: inline-block;
          width: 100%;
          break-inside: avoid;
          margin-bottom: 10px;
        }
        /* 列の区切り線の上下に点線バッジ */
        .col-break-top {
          border-top: 2px dashed #3a3a55;
          margin-bottom: 6px;
          position: relative;
        }
        .col-break-top::before {
          content: "↑ 続き";
          position: absolute;
          top: -9px;
          left: 50%;
          transform: translateX(-50%);
          background: #12121c;
          color: #555;
          font-size: 9px;
          padding: 0 4px;
          white-space: nowrap;
        }
        .col-break-bottom {
          border-bottom: 2px dashed #3a3a55;
          margin-top: 6px;
          position: relative;
        }
        .col-break-bottom::after {
          content: "続き ↓";
          position: absolute;
          bottom: -9px;
          left: 50%;
          transform: translateX(-50%);
          background: #12121c;
          color: #555;
          font-size: 9px;
          padding: 0 4px;
          white-space: nowrap;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "14px 16px 10px",
        background: "#12121c", position: "sticky", top: 0, zIndex: 20,
        borderBottom: "1px solid #2a2a3a"
      }}>
        <span style={{ fontSize: 22 }}>🌾</span>
        <span style={{ fontWeight: "bold", fontSize: 17 }}>圃場 ToDo</span>
        <span style={{
          background: "#e53e3e", color: "#fff", borderRadius: "50%",
          width: 22, height: 22, fontSize: 12, display: "flex",
          alignItems: "center", justifyContent: "center", fontWeight: "bold"
        }}>{totalIncomplete}</span>
        <div style={{ flex: 1 }} />
        <button style={{
          background: "#2a2a3a", border: "none", borderRadius: 8,
          color: "#aaa", padding: "6px 12px", fontSize: 12, cursor: "pointer"
        }}>完了▼</button>
        <button onClick={() => setShowAddArea(true)} style={{
          background: "#2a2a3a", border: "none", borderRadius: 8,
          color: "#aaa", padding: "6px 12px", fontSize: 12, cursor: "pointer"
        }}>＋地区</button>
      </div>

      {/* Add area modal */}
      {showAddArea && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#1e1e30", borderRadius: 16, padding: 20, width: 300,
            border: "1px solid #444"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: 14, fontSize: 15 }}>新しい地区を追加</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowNewEmoji(v => !v)} style={{
                  background: "#2a2a3a", border: "none", borderRadius: 8,
                  fontSize: 22, cursor: "pointer", padding: "6px 10px"
                }}>{newAreaEmoji}</button>
                {showNewEmoji && (
                  <EmojiPicker current={newAreaEmoji}
                    onSelect={e => setNewAreaEmoji(e)}
                    onClose={() => setShowNewEmoji(false)} />
                )}
              </div>
              <input placeholder="地区名" value={newAreaName}
                onChange={e => setNewAreaName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addArea()}
                style={{
                  flex: 1, background: "#2a2a3a", border: "1px solid #444",
                  borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 14, outline: "none"
                }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowAddArea(false)} style={{
                flex: 1, padding: "8px", background: "#333", border: "none",
                borderRadius: 8, color: "#aaa", cursor: "pointer"
              }}>キャンセル</button>
              <button onClick={addArea} style={{
                flex: 1, padding: "8px", background: "#5b3d8f", border: "none",
                borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: "bold"
              }}>追加</button>
            </div>
          </div>
        </div>
      )}

      {/* ★ CSS columns layout — 左列が埋まったら自動で右列に流れる */}
      <div className="card-column">
        {areas.map(area => (
          <div key={area.id} className="area-card-wrap">
            <AreaCard area={area} onUpdate={updateArea} onDelete={() => deleteArea(area.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
