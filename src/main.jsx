import { useState, useRef, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";

const PRIORITIES = ["急", "中", "低"];
const P_COLOR = { 急: "#ef4444", 中: "#f97316", 低: "#22c55e" };

// 全絵文字カテゴリ
const EMOJIS = [
  "😀","😁","😂","🤣","😃","😄","😅","😆","😇","😈","👿","😉","😊","😋","😌","😍","🥰","😎","😏","😐",
  "😑","😒","😓","😔","😕","😖","😗","😘","😙","😚","😛","😜","😝","😞","😟","😠","😡","😢","😣","😤",
  "😥","😦","😧","😨","😩","😪","😫","😬","😭","😮","😯","😰","😱","😲","😳","😴","😵","😶","😷","🤒",
  "🤔","🤗","🤠","🤡","🤢","🤣","🤤","🤥","🤧","🤨","🤩","🤪","🤫","🤬","🤭","🤮","🤯","🥱","🥲","🥳",
  "👋","🤚","🖐","✋","🖖","👌","🤌","🤏","✌","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝","👍",
  "👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍","💅","🤳","💪","🦾","🦿","🦵","🦶","👂",
  "🌾","🍇","🫛","🌽","🍅","🥬","🥕","🍓","🍈","🍑","🍒","🥦","🌿","🌱","🪴","🌳","🌲","🌵","🎋","🎍",
  "🦆","🐓","🐄","🐖","🐑","🐇","🦌","🐗","🐝","🦋","🐛","🐌","🐞","🦗","🐜","🐢","🐍","🦎","🐠","🐟",
  "🏔","⛰","🌋","🗻","🏕","🌊","🏞","🌄","🌅","🌠","⭐","🌟","✨","☀","🌙","🌈","⛅","🌧","❄","🌬",
  "🚜","⛏","🪚","🔨","🪣","💧","🌡","🧪","📋","📊","📈","🗓","⏰","🔔","📍","🗂","📦","🏠","🏡","🏘",
  "🍷","🍶","🧃","☕","🍵","🥂","🍺","🍻","🎵","🎷","🎸","🎹","🎺","🎻","🥁","🎤","🎧","🎼","🎭","🎨",
  "❤","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","💕","💞","💓","💗","💖","💘","💝","✅","🔥","⚡",
  "🌸","🌺","🌻","🌹","🌷","💐","🪷","🌼","🌞","🎃","🎄","🎆","🎇","🎑","🎗","🎀","🎁","🏆","🥇","🎖",
  "🐉","🦁","🐯","🦊","🐺","🐻","🐼","🦝","🐨","🦘","🦙","🦒","🐘","🦏","🦛","🐃","🐂","🐎","🦄","🐉",
];

const COLORS = [
  "#5b3d8f","#7c5c1e","#1e4a6e","#7c1e5c",
  "#3d6e1e","#6e1e1e","#1e6e6e","#4a4a8f",
  "#8f5b3d","#3d8f5b","#8f3d5b","#5b8f3d",
];

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

const sortTasks = (tasks) => {
  const order = { 急:0, 中:1, 低:2 };
  return [...tasks].sort((a,b) => order[a.pri] - order[b.pri]);
};

// ===== 絵文字ピッカー =====
function EmojiPicker({ value, onChange, onClose }) {
  const ref = useRef();
  const [search, setSearch] = useState("");
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  const filtered = search ? EMOJIS.filter(e => e.includes(search)) : EMOJIS;
  return (
    <div ref={ref} style={{
      position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
      zIndex:2000, background:"#1a1a2e", border:"1px solid #555", borderRadius:14,
      padding:12, width:280, boxShadow:"0 8px 32px rgba(0,0,0,0.9)"
    }}>
      <div style={{ fontWeight:"bold", color:"#fff", marginBottom:8, fontSize:13 }}>絵文字を選択</div>
      <div style={{
        display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:4,
        maxHeight:220, overflowY:"auto"
      }}>
        {filtered.map((e,i) => (
          <button key={i} onClick={() => { onChange(e); onClose(); }}
            style={{ background: e===value?"#444":"transparent", border:"none", borderRadius:6,
              fontSize:20, cursor:"pointer", padding:3, lineHeight:1.3 }}>
            {e}
          </button>
        ))}
      </div>
      <button onClick={onClose} style={{ marginTop:10, width:"100%", padding:"6px",
        background:"#333", border:"none", borderRadius:8, color:"#aaa", cursor:"pointer", fontSize:12 }}>
        閉じる
      </button>
    </div>
  );
}

// ===== 編集モーダル =====
function EditModal({ title, name, emoji, color, onSave, onDelete, onClose, showEmoji=true, showColor=true }) {
  const [n, setN] = useState(name || "");
  const [e, setE] = useState(emoji || "🌾");
  const [c, setC] = useState(color || "#5b3d8f");
  const [emojiOpen, setEmojiOpen] = useState(false);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)",
      zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#1e1e30", borderRadius:16, padding:20, width:290, border:"1px solid #555" }}>
        <div style={{ fontWeight:"bold", marginBottom:14, fontSize:15, color:"#fff" }}>{title}</div>

        {/* 絵文字 */}
        {showEmoji && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:"#aaa", marginBottom:4 }}>絵文字</div>
            <button onClick={() => setEmojiOpen(true)} style={{
              background:"#2a2a3a", border:"1px solid #555", borderRadius:8,
              fontSize:26, cursor:"pointer", padding:"6px 12px"
            }}>{e}</button>
          </div>
        )}

        {/* 名前 */}
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, color:"#aaa", marginBottom:4 }}>名前</div>
          <input value={n} onChange={ev => setN(ev.target.value)}
            style={{ width:"100%", background:"#2a2a3a", border:"1px solid #555", borderRadius:8,
              padding:"8px 10px", color:"#fff", fontSize:13, outline:"none", boxSizing:"border-box" }} />
        </div>

        {/* 色 */}
        {showColor && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#aaa", marginBottom:6 }}>カラー</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
              {COLORS.map(col => (
                <button key={col} onClick={() => setC(col)} style={{
                  width:32, height:32, borderRadius:"50%", background:col, border:"none",
                  cursor:"pointer", outline: c===col ? "3px solid #fff" : "none",
                  outlineOffset:2
                }} />
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          <button onClick={() => { if(window.confirm("削除しますか？")) onDelete(); }} style={{
            padding:"8px 12px", background:"#4a1a1a", border:"1px solid #e53e3e",
            borderRadius:8, color:"#e53e3e", cursor:"pointer", fontSize:12
          }}>削除</button>
          <div style={{ flex:1 }} />
          <button onClick={onClose} style={{ padding:"8px 14px", background:"#333",
            border:"none", borderRadius:8, color:"#aaa", cursor:"pointer", fontSize:12 }}>
            キャンセル
          </button>
          <button onClick={() => onSave({ name:n, emoji:e, color:c })} style={{
            padding:"8px 14px", background:"#5b3d8f", border:"none",
            borderRadius:8, color:"#fff", cursor:"pointer", fontWeight:"bold", fontSize:12
          }}>保存</button>
        </div>
      </div>
      {emojiOpen && <EmojiPicker value={e} onChange={setE} onClose={() => setEmojiOpen(false)} />}
    </div>
  );
}

// ===== タスク =====
function Task({ task, onChange, onDelete, onDragStart, onDragOver, onDrop, dragging }) {
  const c = P_COLOR[task.pri];
  const longPressTimer = useRef();

  const handleLongPress = (cb) => ({
    onTouchStart: () => { longPressTimer.current = setTimeout(cb, 500); },
    onTouchEnd: () => clearTimeout(longPressTimer.current),
    onTouchMove: () => clearTimeout(longPressTimer.current),
    onMouseDown: () => { longPressTimer.current = setTimeout(cb, 500); },
    onMouseUp: () => clearTimeout(longPressTimer.current),
    onMouseLeave: () => clearTimeout(longPressTimer.current),
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(task.text);

  const openEdit = () => setEditOpen(true);

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        {...handleLongPress(openEdit)}
        style={{
          display:"flex", alignItems:"center", gap:5, padding:"4px 6px",
          background: dragging ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
          borderRadius:6, marginBottom:2, cursor:"grab",
          opacity: dragging ? 0.5 : 1,
          transition:"opacity 0.15s",
          userSelect:"none",
        }}>
        <button onClick={() => onChange({ ...task, done:!task.done })}
          style={{ width:16, height:16, borderRadius:"50%", border:`2px solid ${c}`,
            background: task.done ? c : "transparent", cursor:"pointer", padding:0, flexShrink:0 }} />
        {editing
          ? <input autoFocus value={v} onChange={e => setV(e.target.value)}
              onBlur={() => { onChange({ ...task, text:v }); setEditing(false); }}
              onKeyDown={e => e.key==="Enter" && e.target.blur()}
              style={{ flex:1, background:"transparent", border:"none", borderBottom:"1px solid #aaa",
                color:"#fff", fontSize:11, outline:"none" }} />
          : <span onDoubleClick={() => setEditing(true)}
              style={{ flex:1, fontSize:11, color: task.done?"#555":"#ddd",
                textDecoration: task.done?"line-through":"none", lineHeight:1.3 }}>
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
      </div>
      {editOpen && (
        <EditModal
          title="タスクを編集"
          name={task.text}
          showEmoji={false}
          showColor={false}
          onSave={({ name }) => { onChange({ ...task, text:name }); setEditOpen(false); }}
          onDelete={() => { onDelete(); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </>
  );
}

// ===== グループ =====
function Group({ group, onChange, onAddTask, onDeleteGroup, areaColor }) {
  const [editOpen, setEditOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const longPressTimer = useRef();

  const handleLongPress = (cb) => ({
    onTouchStart: () => { longPressTimer.current = setTimeout(cb, 500); },
    onTouchEnd: () => clearTimeout(longPressTimer.current),
    onTouchMove: () => clearTimeout(longPressTimer.current),
    onMouseDown: () => { longPressTimer.current = setTimeout(cb, 500); },
    onMouseUp: () => clearTimeout(longPressTimer.current),
    onMouseLeave: () => clearTimeout(longPressTimer.current),
  });

  const upd = (t) => {
    const updated = group.tasks.map(x => x.id===t.id ? t : x);
    onChange({ ...group, tasks: sortTasks(updated) });
  };
  const del = (id) => onChange({ ...group, tasks: group.tasks.filter(x => x.id!==id) });

  const handleDrop = (toIdx) => {
    if (dragIdx === null || dragIdx === toIdx) return;
    // 同じ優先度のみ入れ替え
    const from = group.tasks[dragIdx];
    const to = group.tasks[toIdx];
    if (from.pri !== to.pri) { setDragIdx(null); return; }
    const tasks = [...group.tasks];
    tasks.splice(dragIdx, 1);
    tasks.splice(toIdx, 0, from);
    onChange({ ...group, tasks });
    setDragIdx(null);
  };

  return (
    <div style={{ marginBottom:4 }}>
      {group.name && (
        <div
          {...handleLongPress(() => setEditOpen(true))}
          style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:3, cursor:"context-menu", userSelect:"none" }}>
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
      {group.tasks.map((t, i) => (
        <Task key={t.id} task={t}
          dragging={dragIdx === i}
          onChange={upd}
          onDelete={() => del(t.id)}
          onDragStart={() => setDragIdx(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(i)}
        />
      ))}
      {!group.name && (
        <button onClick={onAddTask} style={{ width:"100%", padding:"3px", background:"transparent",
          border:"1px dashed #3a3a4a", borderRadius:4, color:"#666", cursor:"pointer", fontSize:10, marginTop:1 }}>
          ＋ タスク追加
        </button>
      )}
      {editOpen && (
        <EditModal
          title="圃場を編集"
          name={group.name}
          showEmoji={false}
          showColor={false}
          onSave={({ name }) => { onChange({ ...group, name }); setEditOpen(false); }}
          onDelete={() => { onDeleteGroup(); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

// ===== 地区カード =====
function AreaCard({ area, onUpdate, onDelete, onAddTask }) {
  const [editOpen, setEditOpen] = useState(false);
  const longPressTimer = useRef();

  const handleLongPress = (cb) => ({
    onTouchStart: () => { longPressTimer.current = setTimeout(cb, 500); },
    onTouchEnd: () => clearTimeout(longPressTimer.current),
    onTouchMove: () => clearTimeout(longPressTimer.current),
    onMouseDown: () => { longPressTimer.current = setTimeout(cb, 500); },
    onMouseUp: () => clearTimeout(longPressTimer.current),
    onMouseLeave: () => clearTimeout(longPressTimer.current),
  });

  const total = area.groups.reduce((s,g) => s + g.tasks.filter(t=>!t.done).length, 0);
  const updGroup = (g) => onUpdate({ ...area, groups: area.groups.map(x => x.id===g.id ? g : x) });
  const delGroup = (gid) => onUpdate({ ...area, groups: area.groups.filter(g => g.id!==gid) });
  const addGroup = () => onUpdate({ ...area, groups:[...area.groups,
    { id:nid(), name:`圃場${area.groups.length+1}`, tasks:[] }] });

  return (
    <div style={{
      background: area.color+"bb", borderRadius:10, padding:8,
      border:`1px solid ${area.color}99`,
    }}>
      {/* ヘッダー長押しで編集 */}
      <div
        {...handleLongPress(() => setEditOpen(true))}
        style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6,
          cursor:"context-menu", userSelect:"none" }}>
        <span style={{ fontSize:18, lineHeight:1 }}>{area.emoji}</span>
        <span style={{ flex:1, fontWeight:"bold", fontSize:12, color:"#fff" }}>{area.name}</span>
        <span style={{ background:"#44444488", color:"#fff", borderRadius:"50%", width:16, height:16,
          fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {total}
        </span>
        <button onClick={e => { e.stopPropagation(); addGroup(); }}
          style={{ background:"rgba(255,255,255,0.12)", border:"none", borderRadius:4, color:"#fff",
            cursor:"pointer", width:18, height:18, fontSize:13, display:"flex",
            alignItems:"center", justifyContent:"center" }}>+</button>
      </div>

      {area.groups.map(g => (
        <Group key={g.id} group={g}
          areaColor={area.color}
          onChange={updGroup}
          onAddTask={() => onAddTask(area.id, g.id)}
          onDeleteGroup={() => delGroup(g.id)}
        />
      ))}

      {editOpen && (
        <EditModal
          title="地区を編集"
          name={area.name}
          emoji={area.emoji}
          color={area.color}
          onSave={({ name, emoji, color }) => {
            onUpdate({ ...area, name, emoji, color });
            setEditOpen(false);
          }}
          onDelete={() => { onDelete(); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

// ===== アプリ本体 =====
function App() {
  const [areas, setAreas] = useState(INIT);
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🌾");
  const [newColor, setNewColor] = useState("#5b3d8f");
  const [emojiOpen, setEmojiOpen] = useState(false);
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
        ...g, tasks: sortTasks([...g.tasks, newTask])
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
    setAreas(prev => [...prev, {
      id: nid(), name: newName, emoji: newEmoji, color: newColor,
      groups: [{ id:nid(), name:null, tasks:[] }]
    }]);
    setNewName(""); setNewEmoji("🌾"); setNewColor("#5b3d8f"); setModal(false);
  };

  const total = areas.reduce((s,a) => s + a.groups.reduce((gs,g) => gs + g.tasks.filter(t=>!t.done).length, 0), 0);

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column",
      background:"#12121c", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
      color:"#fff", overflow:"hidden" }}>

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

      {toast && (
        <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          background:"#1e1e1e", border:"1px solid #e53e3e", borderRadius:12,
          padding:"14px 20px", zIndex:200, color:"#fff", fontSize:13,
          textAlign:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.9)" }}>
          ⚠️ これ以上は一杯なため<br />追加できません
        </div>
      )}

      {modal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)",
          zIndex:100, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#1e1e30", borderRadius:16, padding:20, width:290, border:"1px solid #555" }}>
            <div style={{ fontWeight:"bold", marginBottom:14, fontSize:15, color:"#fff" }}>新しい地区を追加</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#aaa", marginBottom:4 }}>絵文字</div>
              <button onClick={() => setEmojiOpen(true)} style={{
                background:"#2a2a3a", border:"1px solid #555", borderRadius:8,
                fontSize:26, cursor:"pointer", padding:"6px 12px"
              }}>{newEmoji}</button>
            </div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:11, color:"#aaa", marginBottom:4 }}>名前</div>
              <input placeholder="地区名" value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key==="Enter" && addArea()}
                style={{ width:"100%", background:"#2a2a3a", border:"1px solid #555", borderRadius:8,
                  padding:"8px 10px", color:"#fff", fontSize:13, outline:"none", boxSizing:"border-box" }} />
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#aaa", marginBottom:6 }}>カラー</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
                {COLORS.map(col => (
                  <button key={col} onClick={() => setNewColor(col)} style={{
                    width:32, height:32, borderRadius:"50%", background:col, border:"none",
                    cursor:"pointer", outline: newColor===col ? "3px solid #fff" : "none", outlineOffset:2
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:"8px", background:"#333",
                border:"none", borderRadius:8, color:"#aaa", cursor:"pointer" }}>キャンセル</button>
              <button onClick={addArea} style={{ flex:1, padding:"8px", background:newColor,
                border:"none", borderRadius:8, color:"#fff", cursor:"pointer", fontWeight:"bold" }}>追加</button>
            </div>
          </div>
          {emojiOpen && <EmojiPicker value={newEmoji} onChange={setNewEmoji} onClose={() => setEmojiOpen(false)} />}
        </div>
      )}

      <div style={{ position:"relative", flex:1, overflow:"hidden" }}>
        <div style={{
          position:"absolute", bottom:0, left:0, width:"calc(50% - 4px)", height:36,
          background:"linear-gradient(to bottom, transparent, rgba(80,60,160,0.3))",
          borderBottom:"2px dashed #5a4a9a", zIndex:5, pointerEvents:"none",
        }} />
        <div style={{
          position:"absolute", top:0, right:0, width:"calc(50% - 4px)", height:36,
          background:"linear-gradient(to top, transparent, rgba(80,60,160,0.3))",
          borderTop:"2px dashed #5a4a9a", zIndex:5, pointerEvents:"none",
        }} />
        <div ref={colRef} style={{
          height:"100%", columnCount:2, columnGap:8, columnFill:"auto",
          columnRuleWidth:"2px", columnRuleStyle:"dashed", columnRuleColor:"#3a3a5a",
          padding:8, overflow:"hidden", boxSizing:"border-box",
        }}>
          {areas.map((area, i) => (
            <div key={area.id} style={{ marginBottom: i < areas.length-1 ? 6 : 0, width:"100%" }}>
              <AreaCard area={area} onUpdate={upd} onDelete={() => del(area.id)} onAddTask={addTask} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
