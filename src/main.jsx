import { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";

const PRIORITIES = ["急", "中", "低"];
const P_COLOR = { 急: "#ef4444", 中: "#f97316", 低: "#22c55e" };

const EMOJIS = ["🌾","🍇","🫛","🌽","🍅","🥬","🌿","🌱","🪴","🌳","🚜","🐓","🐄","🐝","🍷","🌊","🏔️","☀️","🌸","🌺","🌻","🌹","💐","🔥","✅","⭐","🌟","🎋","🦁","🐯","🐻","🐼","🦊","🌵","🎍","🏕","🌄","🌅","💧","🪣","🔨","⛏️","📋","🗓️","⏰","🔔","🎵","🎨","❤️","🧡","💛","💚","💙","💜"];

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
        style={{ background:"transparent", border:"none", fontSize:20, cursor:"pointer", padding:0, lineHeight:1 }}>
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
                fontSize:17, cursor:"pointer", padding:2, lineHeight:1.3 }}>
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
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 7px",
      background:"rgba(255,255,255,0.04)", borderRadius:7, marginBottom:3 }}>
      <button onClick={() => onChange({ ...task, done:!task.done })}
        style={{ width:19, height:19, borderRadius:"50%", border:`2px solid ${c}`,
          background: task.done ? c : "transparent", cursor:"pointer", padding:0, flexShrink:0 }} />
      {editing
        ? <input autoFocus value={v} onChange={e => setV(e.target.value)}
            onBlur={() => { onChange({ ...task, text:v }); setEditing(false); }}
            onKeyDown={e => e.key==="Enter" && e.target.blur()}
            style={{ flex:1, background:"transparent", border:"none", borderBottom:"1px solid #aaa",
              color:"#fff", fontSize:12, outline:"none" }} />
        : <span onClick={() => setEditing(true)}
            style={{ flex:1, fontSize:12, color: task.done?"#555":"#ddd",
              textDecoration: task.done?"line-through":"none", cursor:"text", lineHeight:1.4 }}>
            {task.text}
          </span>
      }
      <button onClick={() => {
        const i = PRIORITIES.indexOf(task.pri);
        onChange({ ...task, pri: PRIORITIES[(i+1) % PRIORITIES.length] });
      }} style={{ fontSize:10, fontWeight:"bold", color:c, background:"transparent",
          border:"none", cursor:"pointer", padding:"1px 3px", flexShrink:0 }}>
        {task.pri}
      </button>
      <button onClick={onDelete}
        style={{ color:"#555", background:"transparent", border:"none", cursor:"pointer", fontSize:12, flexShrink:0 }}>
        ×
      </button>
    </div>
  );
}

function Group({ group, onChange }) {
  const add = () => onChange({ ...group, tasks:[...group.tasks, { id:nid(), text:"新タスク", pri:"中", done:false }] });
  const upd = (t) => onChange({ ...group, tasks: group.tasks.map(x => x.id===t.id ? t : x) });
  const del = (id) => onChange({ ...group, tasks: group.tasks.filter(x => x.id!==id) });
  return (
    <div style={{ marginBottom:6 }}>
      {group.name && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
          <span style={{ fontSize:11, fontWeight:"bold", color:"#bbb" }}>{group.name}</span>
          <div style={{ display:"flex", gap:4, alignItems:"center" }}>
            <span style={{ background:"#444", color:"#fff", borderRadius:"50%", width:16, height:16,
              fontSize:10, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {group.tasks.filter(t => !t.done).length}
            </span>
            <button onClick={add} style={{ background:"rgba(255,255,255,0.1)", border:"none",
              borderRadius:4, color:"#aaa", cursor:"pointer", width:17, height:17, fontSize:12,
              display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
          </div>
        </div>
      )}
      {group.tasks.map(t => <Task key={t.id} task={t} onChange={upd} onDelete={() => del(t.id)} />)}
      {!group.name && (
        <button onClick={add} style={{ width:"100%", padding:"4px", background:"transparent",
          border:"1px dashed #3a3a4a", borderRadius:5, color:"#666", cursor:"pointer", fontSize:11, marginTop:2 }}>
          ＋ タスク追加
        </button>
      )}
    </div>
  );
}

function AreaCard({ area, onUpdate, onDelete }) {
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(area.name);
  const total = area.groups.reduce((s,g) => s + g.tasks.filter(t=>!t.done).length, 0);
  const updGroup = (g) => onUpdate({ ...area, groups: area.groups.map(x => x.id===g.id ? g : x) });
  const addGroup = () => onUpdate({ ...area, groups:[...area.groups,
    { id:nid(), name:`圃場${area.groups.length+1}`, tasks:[] }] });
  return (
    <div style={{
      background: area.color+"bb", borderRadius:12, padding:10,
      border:`1px solid ${area.color}77`,
      breakInside:"avoid", WebkitColumnBreakInside:"avoid",
      display:"inline-block", width:"100%", boxSizing:"border-box", marginBottom:10,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
        <EmojiPicker value={area.emoji} onChange={e => onUpdate({ ...area, emoji:e })} />
        {editingName
          ? <input autoFocus value={nameVal} onChange={e => setNameVal(e.target.value)}
              onBlur={() => { onUpdate({ ...area, name:nameVal }); setEditingName(false); }}
              onKeyDown={e => e.key==="Enter" && e.target.blur()}
              style={{ flex:1, background:"transparent", border:"none", borderBottom:"1px solid #fff",
                color:"#fff", fontSize:13, fontWeight:"bold", outline:"none" }} />
          : <span onClick={() => setEditingName(true)}
              style={{ flex:1, fontWeight:"bold", fontSize:13, color:"#fff", cursor:"text" }}>
              {area.name}
            </span>
        }
        <span style={{ background:"#44444488", color:"#fff", borderRadius:"50%", width:17, height:17,
          fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {total}
        </span>
        <button onClick={addGroup}
          style={{ background:"rgba(255,255,255,0.12)", border:"none", borderRadius:5, color:"#fff",
            cursor:"pointer", width:20, height:20, fontSize:14, display:"flex",
            alignItems:"center", justifyContent:"center" }}>+</button>
        <button onClick={onDelete}
          style={{ background:"transparent", border:"none", color:"#aaa", cursor:"pointer", fontSize:13 }}>
          …
        </button>
      </div>
      {area.groups.map(g => <Group key={g.id} group={g} onChange={updGroup} />)}
    </div>
  );
}

function App() {
  const [areas, setAreas] = useState(INIT);
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🌾");
  const upd = (a) => setAreas(prev => prev.map(x => x.id===a.id ? a : x));
  const del = (id) => setAreas(prev => prev.filter(x => x.id!==id));
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
    <div style={{ minHeight:"100vh", background:"#12121c",
      fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif", color:"#fff" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"13px 14px 10px",
        borderBottom:"1px solid #2a2a3a", position:"sticky", top:0, background:"#12121c", zIndex:20 }}>
        <span style={{ fontSize:21 }}>🌾</span>
        <span style={{ fontWeight:"bold", fontSize:16 }}>圃場 ToDo</span>
        <span style={{ background:"#e53e3e", color:"#fff", borderRadius:"50%", width:21, height:21,
          fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold" }}>
          {total}
        </span>
        <div style={{ flex:1 }} />
        <button style={{ background:"#2a2a3a", border:"none", borderRadius:7,
          color:"#aaa", padding:"5px 10px", fontSize:11, cursor:"pointer" }}>完了▼</button>
        <button onClick={() => setModal(true)} style={{ background:"#2a2a3a", border:"none", borderRadius:7,
          color:"#aaa", padding:"5px 10px", fontSize:11, cursor:"pointer" }}>＋地区</button>
      </div>
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
      <div style={{ columnCount:2, columnGap:10, columnRuleWidth:"2px",
        columnRuleStyle:"dashed", columnRuleColor:"#2e2e44", padding:10 }}>
        {areas.map(area => (
          <div key={area.id} style={{ breakInside:"avoid", WebkitColumnBreakInside:"avoid",
            display:"inline-block", width:"100%", boxSizing:"border-box", marginBottom:10 }}>
            <AreaCard area={area} onUpdate={upd} onDelete={() => del(area.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
