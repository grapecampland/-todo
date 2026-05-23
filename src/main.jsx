import { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";

const PRIORITIES = ["急", "中", "低"];
const P_COLOR = { 急: "#ef4444", 中: "#f97316", 低: "#22c55e" };
const EMOJIS = ["🌾","🍇","🫛","🌽","🍅","🥬","🌿","🌱","🪴","🌳","🚜","🐓","🐄","🐝","🍷","🌊","🏔️","☀️","🌸","🌺","🌻","🌹","💐","🔥","✅","⭐","🌟","🎋","🦁","🐯","🐻","🐼","🦊","🌵","🎍","🏕️","🌄","🌅","💧","🪣","🔨","⛏️","📋","🗓️","⏰","🔔","🎵","🎨","❤️","🧡","💛","💚","💙","💜"];

let _id = 100;
const nid = () => String(_id++);

const INIT = [
  { id:"1", name:"金山", emoji:"🌾", color:"#5b3d8f", groups:[
    { id:"g1", name:null, tasks:[
      { id:"t1", text:"あ", pri:"中", done:false },
      { id:"t2", text:"あ", pri:"中", done:false },
    ]},
    { id:"g2", name:"ガラス温室", tasks:[
      { id:"t3", text:"誘引", pri:"急", done:false },
      { id:"t4", text:"棚線張り直し", pri:"中", done:false },
    ]},
    { id:"g3", name:"圃場２", tasks:[
      { id:"t5", text:"棚修理", pri:"急", done:false },
      { id:"t6", text:"草刈り", pri:"低", done:false },
    ]},
  ]},
  { id:"2", name:"鮎帰", emoji:"🍇", color:"#7c5c1e", groups:[
    { id:"g4", name:null, tasks:[
      { id:"t7", text:"棚線張る", pri:"急", done:false },
      { id:"t8", text:"シャインマスカット誘引", pri:"中", done:false },
    ]},
  ]},
  { id:"3", name:"横井上", emoji:"🌊", color:"#1e4a6e", groups:[
    { id:"g5", name:null, tasks:[
      { id:"t9",  text:"あ", pri:"中", done:false },
      { id:"t10", text:"あ", pri:"中", done:false },
      { id:"t11", text:"あ", pri:"中", done:false },
      { id:"t12", text:"あ", pri:"中", done:false },
      { id:"t13", text:"あ", pri:"中", done:false },
      { id:"t14", text:"あ", pri:"中", done:false },
      { id:"t15", text:"あ", pri:"中", done:false },
    ]},
  ]},
  { id:"4", name:"吉尾", emoji:"🌸", color:"#7c1e5c", groups:[
    { id:"g6", name:null, tasks:[] },
  ]},
];

function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  return (
    <div ref={ref} style={{ position:"relative", display:"inline-block" }}>
      <button onClick={() => setOpen(v => !v)}
        style={{ background:"transparent", border:"none", fontSize:18, cursor:"pointer", padding:0, lineHeight:1 }}>
        {value}
      </button>
      {open && (
        <div style={{
          position:"absolute", top:"110%", left:0, zIndex:999,
          background:"#1a1a2e", border:"1px solid #444", borderRadius:10,
          padding:8, display:"grid", gridTemplateColumns:"repeat(8,1fr)",
          gap:3, width:230, maxHeight:190, overflowY:"auto",
          boxShadow:"0 6px 24px rgba(0,0,0,0.8)"
        }}>
          {EMOJIS.map(e => (
            <button key={e} onClick={() => { onChange(e); setOpen(false); }}
              style={{ background: e===value?"#333":"transparent", border:"none", borderRadius:4,
                fontSize:16, cursor:"pointer", padding:2, lineHeight:1.3 }}>
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Task({ task, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(task.text);
  const c = P_COLOR[task.pri];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 6px",
      background:"rgba(255,255,255,0.04)", borderRadius:6, marginBottom:2 }}>
      <button onClick={() => onChange({ ...task, done:!task.done })}
        style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${c}`,
          background: task.done ? c : "transparent", cursor:"pointer", padding:0, flexShrink:0 }} />
      {editing
        ? <input autoFocus value={v} onChange={e => setV(e.target.value)}
            onBlur={() => { onChange({ ...task, text:v }); setEditing(false); }}
            onKeyDown={e => e.key==="Enter" && e.target.blur()}
            style={{ flex:1, background:"transparent", border:"none", borderBottom:"1px solid #aaa",
              color:"#fff", fontSize:11, outline:"none" }} />
        : <span onClick={() => setEditing(true)}
            style={{ flex:1, fontSize:11, color: task.done?"#555":"#ddd",
              textDecoration: task.done?"line-through":"none", cursor:"text", lineHeight:1.3 }}>
            {task.text}
          </span>
      }
      <button onClick={() => {
        const i = PRIORITIES.indexOf(task.pri);
        onChange({ ...task, pri: PRIORITIES[(i+1) % PRIORITIES.length] });
      }} style={{ fontSize:9, fontWeight:"bold", color:c, background:"transparent",
          border:"none", cursor:"pointer", padding:"1px 2px", flexShrink:0 }}>
        {task.pri}
      </button>
      <button onClick={onDelete}
        style={{ color:"#555", background:"transparent", border:"none", cursor:"pointer", fontSize:11, flexShrink:0 }}>
        ×
      </button>
    </div>
  );
}

function Group({ group, onChange, onAddTask }) {
  const upd = (t) => onChange({ ...group, tasks: group.tasks.map(x => x.id===t.id ? t : x) });
  const del = (id) => onChange({ ...group, tasks: group.tasks.filter(x => x.id!==id) });
  return (
    <div style={{ marginBottom:4 }}>
      {group.name && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
          <span style={{ fontSize:10, fontWeight:"bold", color:"#bbb" }}>{group.name}</span>
          <div style={{ display:"flex", gap:3, alignItems:"center" }}>
            <span style={{ background:"#444", color:"#fff", borderRadius:"50%", width:14, height:14,
              fontSize:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {group.tasks.filter(t => !t.done).length}
            </span>
            <button onClick={onAddTask} style={{ background:"rgba(255,255,255,0.1)", border:"none",
              borderRadius:3, color:"#aaa", cursor:"pointer", width:15, height:15, fontSize:11,
              display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
          </div>
        </div>
      )}
      {group.tasks.map(t => <Task key={t.id} task={t} onChange={upd} onDelete={() => del(t.id)} />)}
      {!group.name && (
        <button onClick={onAddTask} style={{ width:"100%", padding:"3px", background:"transparent",
          border:"1px dashed #3a3a4a", borderRadius:4, color:"#666", cursor:"pointer", fontSize:10, marginTop:1 }}>
          ＋ タスク追加
        </button>
      )}
    </div>
  );
}

function AreaCard({ area, onUpdate, onDelete, onAddTask }) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(area.name);
  const total = area.groups.reduce((s,g) => s + g.tasks.filter(t=>!t.done).length, 0);
  const updGroup = (g) => onUpdate({ ...area, groups: area.groups.map(x => x.id===g.id ? g : x) });
  const addGroup = () => onUpdate({ ...area, groups:[...area.groups,
    { id:nid(), name:`グループ${area.groups.length+1}`, tasks:[] }] });
  return (
    <div style={{
      background: area.color+"bb",
      borderRadius:10, padding:8,
      border:`1px solid ${area.color}99`,
      marginBottom:6,
      position:"relative",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        <EmojiPicker value={area.emoji} onChange={e => onUpdate({ ...area, emoji:e })} />
        {editingName
          ? <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
              onBlur={() => { onUpdate({ ...area, name:nameVal }); setEditingName(false); }}
              onKeyDown={e => e.key==="Enter" && e.target.blur()}
              style={{ flex:1, background:"transparent", border:"none", borderBottom:"1px solid #fff",
                color:"#fff", fontSize:12, fontWeight:"bold", outline:"none" }} />
          : <span onClick={() => setEditingName(true)}
              style={{ flex:1, fontWeight:"bold", fontSize:12, color:"#fff", cursor:"text" }}>
              {area.name}
            </span>
        }
        <span style={{ background:"#44444488", color:"#fff", borderRadius:"50%", width:16, height:16,
          fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {total}
        </span>
        <button onClick={addGroup}
          style={{ background:"rgba(255,255,255,0.12)", border:"none", borderRadius:4, color:"#fff",
            cursor:"pointer", width:18, height:18, fontSize:13, display:"flex",
            alignItems:"center", justifyContent:"center" }}>+</button>
        <button onClick={onDelete}
          style={{ background:"transparent", border:"none", color:"#aaa", cursor:"pointer", fontSize:12 }}>
          …
        </button>
      </div>
      {area.groups.map(g => (
        <Group key={g.id} group={g} onChange={updGroup}
          onAddTask={() => onAddTask(area.id, g.id)} />
      ))}
    </div>
  );
}

function App() {
  const [areas, setAreas] = useState(INIT);
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🌾");
  const [toast, setToast] = useState(false);
  const colRef = useRef();

  const upd = (a) => setAreas(prev => prev.map(x => x.id===a.id ? a : x));
  const del = (id) => setAreas(prev => prev.filter(x => x.id!==id));

  const isFull = () => {
    const el = colRef.current;
    if (!el) return false;
    return el.scrollHeight > el.clientHeight + 4;
  };

  const addTask = (areaId, groupId) => {
    const newTask = { id: nid(), text: "新タスク", pri: "中", done: false };
    setAreas(prev => prev.map(a => a.id !== areaId ? a : {
      ...a, groups: a.groups.map(g => g.id !== groupId ? g : {
        ...g, tasks: [...g.tasks, newTask]
      })
    }));
    setTimeout(() => {
      if (isFull()) {
        setAreas(prev => prev.map(a => a.id !== areaId ? a : {
          ...a, groups: a.groups.map(g => g.id !== groupId ? g : {
            ...g, tasks: g.tasks.filter(t => t.id !== newTask.id)
          })
        }));
        setToast(true);
        setTimeout(() => setToast(false), 2500);
      }
    }, 30);
  };

  const addArea = () => {
    if (!newName.trim()) return;
    const COLORS = ["#3d5e8f","#5b8f3d","#8f3d5b","#8f7c3d","#3d8f7c"];
    setAreas(prev => [...prev, {
      id: nid(), name: newName, emoji: newEmoji,
      color: COLORS[prev.length % COLORS.length],
      groups: [{ id:nid(), name:null, tasks:[] }]
    }]);
    setNewName(""); setNewEmoji("🌾"); setModal(false);
  };

  const total = areas.reduce((s,a) => s + a.groups.reduce((gs,g) => gs + g.tasks.filter(t=>!t.done).length, 0), 0);

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column",
      background:"#12121c", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
      color:"#fff", overflow:"hidden" }}>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 12px 8px",
        borderBottom:"1px solid #2a2a3a", flexShrink:0 }}>
        <span style={{ fontSize:19 }}>🌾</span>
        <span style={{ fontWeight:"bold", fontSize:15 }}>圃場 ToDo</span>
        <span style={{ background:"#e53e3e", color:"#fff", borderRadius:"50%", width:19, height:19,
          fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold" }}>
          {total}
        </span>
        <div style={{ flex:1 }} />
        <button style={{ background:"#2a2a3a", border:"none", borderRadius:6,
          color:"#aaa", padding:"4px 9px", fontSize:10, cursor:"pointer" }}>完了▼</button>
        <button onClick={() => setModal(true)} style={{ background:"#2a2a3a", border:"none", borderRadius:6,
          color:"#aaa", padding:"4px 9px", fontSize:10, cursor:"pointer" }}>＋地区</button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          background:"#1e1e1e", border:"1px solid #e53e3e", borderRadius:12,
          padding:"14px 20px", zIndex:200, color:"#fff", fontSize:13,
          textAlign:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.9)"
        }}>
          ⚠️ これ以上は一杯なため<br />追加できません
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)",
          zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#1e1e30", borderRadius:14, padding:18, width:280, border:"1px solid #444" }}>
            <div style={{ fontWeight:"bold", marginBottom:12, fontSize:14 }}>新しい地区を追加</div>
            <div style={{ display:"flex", gap:8, marginBottom:12, alignItems:"center" }}>
              <EmojiPicker value={newEmoji} onChange={setNewEmoji} />
              <input placeholder="地区名" value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key==="Enter" && addArea()}
                style={{ flex:1, background:"#2a2a3a", border:"1px solid #444", borderRadius:7,
                  padding:"7px 10px", color:"#fff", fontSize:13, outline:"none" }} />
            </div>
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:"7px", background:"#333",
                border:"none", borderRadius:7, color:"#aaa", cursor:"pointer" }}>キャンセル</button>
              <button onClick={addArea} style={{ flex:1, padding:"7px", background:"#5b3d8f",
                border:"none", borderRadius:7, color:"#fff", cursor:"pointer", fontWeight:"bold" }}>追加</button>
            </div>
          </div>
        </div>
      )}

      {/* 列の折り返し表示 — 左下端→右上へのグラデ点線 */}
      <div style={{ position:"relative", flex:1, overflow:"hidden" }}>

        {/* 左列下端グラデーション（折り返しを示す） */}
        <div style={{
          position:"absolute", bottom:0, left:0,
          width:"calc(50% - 4px)", height:40,
          background:"linear-gradient(to bottom, transparent, rgba(100,80,200,0.25))",
          borderBottom:"2px dashed #5a4a9a",
          zIndex:10, pointerEvents:"none",
          borderRadius:"0 0 0 0",
        }} />
        {/* 右列上端グラデーション（折り返しの続きを示す） */}
        <div style={{
          position:"absolute", top:0, right:0,
          width:"calc(50% - 4px)", height:40,
          background:"linear-gradient(to top, transparent, rgba(100,80,200,0.25))",
          borderTop:"2px dashed #5a4a9a",
          zIndex:10, pointerEvents:"none",
        }} />

        {/* CSS columns 本体 — breakInside なし → カードが途中で切れてOK */}
        <div ref={colRef} style={{
          height:"100%",
          columnCount: 2,
          columnGap: 8,
          columnRuleWidth: "2px",
          columnRuleStyle: "dashed",
          columnRuleColor: "#3a3a5a",
          padding: 8,
          overflow:"hidden",
          boxSizing:"border-box",
        }}>
          {areas.map(area => (
            <div key={area.id} style={{ marginBottom:0, width:"100%" }}>
              <AreaCard area={area} onUpdate={upd} onDelete={() => del(area.id)} onAddTask={addTask} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
