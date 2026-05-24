import { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";

const PRIORITIES = ["急", "中", "低"];
const P_COLOR = { 急: "#ef4444", 中: "#f97316", 低: "#22c55e" };

const EMOJIS = [
  "🌾","🍇","🫛","🌽","🍅","🥬","🥕","🍓","🍒","🥦","🌿","🌱","🪴","🌳","🌲","🌵","🎋","🎍",
  "🦆","🐓","🐄","🐖","🐑","🐇","🦌","🐗","🐝","🦋","🐛","🐌","🐞","🐜","🐢","🐍","🦎","🐠",
  "🏔","⛰","🌋","🌊","🌄","🌅","⭐","🌟","✨","☀","🌙","🌈","⛅","🌧","❄","🌬",
  "🚜","⛏","🪚","🔨","🪣","💧","📋","📊","🗓","⏰","🔔","📍","📦","🏠","🏡",
  "🍷","🍶","☕","🍵","🥂","🍺","🎵","🎷","🎸","🎹","🎤","🎧","🎨","🎭",
  "❤","🧡","💛","💚","💙","💜","🖤","🤍","✅","🔥","⚡","💎","🏆","🥇",
  "🌸","🌺","🌻","🌹","🌷","💐","🪷","🌼","🌞","🎃","🎄","🎁","🎀","🎗",
  "🐉","🦁","🐯","🦊","🐺","🐻","🐼","🦝","🐨","🦒","🐘","🦏","🐂","🐎","🦄",
  "😀","😎","🤩","😍","🥰","😇","🤔","💪","🙌","👍","✌","🤝","🙏","👋",
];

const CARD_COLORS = [
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

const sortByPri = (tasks) => {
  const order = { 急:0, 中:1, 低:2 };
  return [...tasks].sort((a,b) => order[a.pri] - order[b.pri]);
};

// 長押し検出フック
function useLongPress(callback, ms=500) {
  const timer = useRef(null);
  const start = (e) => {
    e.preventDefault();
    timer.current = setTimeout(callback, ms);
  };
  const cancel = () => clearTimeout(timer.current);
  return { onTouchStart:start, onTouchEnd:cancel, onTouchMove:cancel, onMouseDown:start, onMouseUp:cancel, onMouseLeave:cancel };
}

// コンテキストメニュー（編集/削除）
function ContextMenu({ x, y, onEdit, onDelete, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:900 }} />
      <div style={{
        position:"fixed", left:x, top:y, zIndex:1000,
        background:"#2a2a3a", border:"1px solid #555", borderRadius:10,
        overflow:"hidden", boxShadow:"0 4px 20px rgba(0,0,0,0.8)", minWidth:120,
      }}>
        <button onClick={() => { onEdit(); onClose(); }} style={{
          display:"block", width:"100%", padding:"11px 16px", background:"transparent",
          border:"none", color:"#fff", cursor:"pointer", textAlign:"left", fontSize:13,
          borderBottom:"1px solid #3a3a4a"
        }}>✏️ 編集</button>
        <button onClick={() => { onDelete(); onClose(); }} style={{
          display:"block", width:"100%", padding:"11px 16px", background:"transparent",
          border:"none", color:"#ef4444", cursor:"pointer", textAlign:"left", fontSize:13,
        }}>🗑️ 削除</button>
      </div>
    </>
  );
}

// 絵文字ピッカー
function EmojiPicker({ value, onChange, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:2000,
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#1a1a2e", border:"1px solid #555", borderRadius:14,
        padding:12, width:290, boxShadow:"0 8px 32px rgba(0,0,0,0.9)" }}>
        <div style={{ fontWeight:"bold", color:"#fff", marginBottom:8, fontSize:13 }}>絵文字を選択</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(9,1fr)", gap:4, maxHeight:240, overflowY:"auto" }}>
          {EMOJIS.map((e,i) => (
            <button key={i} onClick={() => { onChange(e); onClose(); }}
              style={{ background: e===value?"#444":"transparent", border:"none", borderRadius:6,
                fontSize:20, cursor:"pointer", padding:3, lineHeight:1.3 }}>
              {e}
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop:10, width:"100%", padding:"7px",
          background:"#333", border:"none", borderRadius:8, color:"#aaa", cursor:"pointer", fontSize:12 }}>
          閉じる
        </button>
      </div>
    </div>
  );
}

// 編集モーダル
function EditModal({ title, initName, initEmoji, initColor, showEmoji, showColor, onSave, onClose }) {
  const [name, setName] = useState(initName || "");
  const [emoji, setEmoji] = useState(initEmoji || "🌾");
  const [color, setColor] = useState(initColor || "#5b3d8f");
  const [emojiOpen, setEmojiOpen] = useState(false);
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1500,
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#1e1e30", borderRadius:16, padding:20, width:290, border:"1px solid #555" }}>
        <div style={{ fontWeight:"bold", marginBottom:14, fontSize:15, color:"#fff" }}>{title}</div>
        {showEmoji && (
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:11, color:"#aaa", marginBottom:4 }}>絵文字</div>
            <button onClick={() => setEmojiOpen(true)} style={{
              background:"#2a2a3a", border:"1px solid #555", borderRadius:8,
              fontSize:28, cursor:"pointer", padding:"6px 14px"
            }}>{emoji}</button>
          </div>
        )}
        <div style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, color:"#aaa", marginBottom:4 }}>名前</div>
          <input value={name} onChange={e => setName(e.target.value)}
            style={{ width:"100%", background:"#2a2a3a", border:"1px solid #555", borderRadius:8,
              padding:"8px 10px", color:"#fff", fontSize:13, outline:"none", boxSizing:"border-box" }} />
        </div>
        {showColor && (
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#aaa", marginBottom:6 }}>カラー</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
              {CARD_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} style={{
                  width:32, height:32, borderRadius:"50%", background:c, border:"none",
                  cursor:"pointer", outline: color===c ? "3px solid #fff" : "none", outlineOffset:2
                }} />
              ))}
            </div>
          </div>
        )}
        <div style={{ display:"flex", gap:8, marginTop:4 }}>
          <button onClick={onClose} style={{ flex:1, padding:"8px", background:"#333",
            border:"none", borderRadius:8, color:"#aaa", cursor:"pointer" }}>キャンセル</button>
          <button onClick={() => onSave({ name, emoji, color })} style={{
            flex:1, padding:"8px", background: showColor ? color : "#5b3d8f",
            border:"none", borderRadius:8, color:"#fff", cursor:"pointer", fontWeight:"bold"
          }}>保存</button>
        </div>
      </div>
      {emojiOpen && <EmojiPicker value={emoji} onChange={setEmoji} onClose={() => setEmojiOpen(false)} />}
    </div>
  );
}

// タスク
function Task({ task, onChange, onDelete, dragHandlers }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(task.text);
  const c = P_COLOR[task.pri];

  return (
    <div
      style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 6px",
        background:"rgba(255,255,255,0.04)", borderRadius:6, marginBottom:2,
        userSelect:"none" }}>
      {/* ドラッグハンドル */}
      <span {...dragHandlers} style={{ color:"#444", fontSize:12, cursor:"grab", flexShrink:0, touchAction:"none" }}>⠿</span>
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
              textDecoration: task.done?"line-through":"none", lineHeight:1.3, cursor:"text" }}>
            {task.text}
          </span>
      }
      {/* 優先度タップ → 変更 → 自動ソートは親側で */}
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

// グループ
function Group({ group, onChange, onAddTask, onDelete }) {
  const [menu, setMenu] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const taskRefs = useRef([]);
  const dragState = useRef(null);

  const lp = useLongPress((e) => {
    setMenu({ x: e?.clientX || 100, y: e?.clientY || 100 });
  });

  const updTask = (updated) => {
    onChange({ ...group, tasks: sortByPri(group.tasks.map(t => t.id===updated.id ? updated : t)) });
  };
  const delTask = (id) => onChange({ ...group, tasks: group.tasks.filter(t => t.id!==id) });

  const getOverIdx = (clientY) => {
    let found = null;
    taskRefs.current.forEach((ref, i) => {
      if (!ref) return;
      const rect = ref.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) found = i;
    });
    return found;
  };

  const onPointerDown = (idx) => (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { idx };
    setDragIdx(idx);
  };

  const onPointerMove = (e) => {
    if (!dragState.current) return;
    const over = getOverIdx(e.clientY);
    if (over !== null) setOverIdx(over);
  };

  const onPointerUp = (e) => {
    if (!dragState.current) return;
    const fromIdx = dragState.current.idx;
    const toIdx = overIdx;
    if (toIdx !== null && fromIdx !== toIdx) {
      const from = group.tasks[fromIdx];
      const to   = group.tasks[toIdx];
      if (from.pri === to.pri) {
        const tasks = [...group.tasks];
        tasks.splice(fromIdx, 1);
        tasks.splice(toIdx, 0, from);
        onChange({ ...group, tasks });
      }
    }
    dragState.current = null;
    setDragIdx(null);
    setOverIdx(null);
  };

  return (
    <div style={{ marginBottom:4 }} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      {group.name && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
          <span
            {...lp}
            onTouchStart={(e) => { lp.onTouchStart(e); }}
            style={{ fontSize:10, fontWeight:"bold", color:"#bbb", cursor:"context-menu", userSelect:"none", flex:1 }}>
            {group.name}
          </span>
          <div style={{ display:"flex", gap:3, alignItems:"center" }}>
            <span style={{ background:"#444", color:"#fff", borderRadius:"50%", width:14, height:14,
              fontSize:9, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {group.tasks.filter(t => !t.done).length}
            </span>
            <button onClick={onAddTask} style={{ background:"rgba(255,255,255,0.1)", border:"none",
              borderRadius:3, color:"#aaa", cursor:"pointer", width:15, height:15, fontSize:11,
              display:"flex", alignItems:"center", justifyContent:"center" }}>＋</button>
          </div>
        </div>
      )}
      {group.tasks.map((t, i) => (
        <div key={t.id} ref={el => taskRefs.current[i] = el}
          style={{
            opacity: dragIdx === i ? 0.4 : 1,
            borderTop: overIdx === i && dragIdx !== i ? "2px solid #a78bfa" : "2px solid transparent",
            transition: "opacity 0.1s",
          }}>
          <Task task={t}
            onChange={updTask}
            onDelete={() => delTask(t.id)}
            dragHandlers={{ onPointerDown: onPointerDown(i) }}
          />
        </div>
      ))}


      {menu && (
        <ContextMenu
          x={menu.x} y={menu.y}
          onEdit={() => setEditOpen(true)}
          onDelete={onDelete}
          onClose={() => setMenu(null)}
        />
      )}
      {editOpen && (
        <EditModal
          title="圃場を編集"
          initName={group.name}
          showEmoji={false}
          showColor={false}
          onSave={({ name }) => { onChange({ ...group, name }); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

// 地区カード
function AreaCard({ area, onUpdate, onDelete, onAddTask }) {
  const [menu, setMenu] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const lp = useLongPress(() => {
    // タッチ座標を使いたいので別途
  });

  const total = area.groups.reduce((s,g) => s + g.tasks.filter(t=>!t.done).length, 0);
  const updGroup = (g) => onUpdate({ ...area, groups: area.groups.map(x => x.id===g.id ? g : x) });
  const delGroup = (gid) => onUpdate({ ...area, groups: area.groups.filter(g => g.id!==gid) });
  const addGroup = () => onUpdate({ ...area, groups:[...area.groups,
    { id:nid(), name:`圃場${area.groups.length+1}`, tasks:[] }] });

  const lpTimer = useRef(null);
  const touchPos = useRef({ x:0, y:0 });
  const didLongPress = useRef(false);

  const nameTouchStart = (e) => {
    didLongPress.current = false;
    const t = e.touches[0];
    touchPos.current = { x: t.clientX, y: t.clientY };
    lpTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setMenu({ x: touchPos.current.x, y: touchPos.current.y });
    }, 500);
  };
  const nameTouchEnd = () => clearTimeout(lpTimer.current);
  const nameMouseDown = (e) => {
    didLongPress.current = false;
    touchPos.current = { x: e.clientX, y: e.clientY };
    lpTimer.current = setTimeout(() => {
      didLongPress.current = true;
      setMenu({ x: touchPos.current.x, y: touchPos.current.y });
    }, 500);
  };
  const nameMouseUp = () => clearTimeout(lpTimer.current);
  const nameClick = () => { if (!didLongPress.current) setEditOpen(true); };

  return (
    <div style={{ background: area.color+"bb", borderRadius:10, padding:8, border:`1px solid ${area.color}99` }}>
      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:6 }}>
        <span
          onClick={nameClick}
          onTouchStart={nameTouchStart}
          onTouchEnd={nameTouchEnd}
          onTouchMove={nameTouchEnd}
          onMouseDown={nameMouseDown}
          onMouseUp={nameMouseUp}
          onMouseLeave={nameMouseUp}
          style={{ flex:1, fontWeight:"bold", fontSize:12, color:"#fff", cursor:"pointer", userSelect:"none" }}>
          {area.name}
        </span>
        <span style={{ background:"#44444488", color:"#fff", borderRadius:"50%", width:16, height:16,
          fontSize:9, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          {total}
        </span>
        {/* タスク追加＋ (圃場が1つのときのみ) */}
        {area.groups.length === 1 && area.groups[0].name === null && (
          <button onClick={e => { e.stopPropagation(); onAddTask(area.id, area.groups[0].id); }}
            style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:4, color:"#fff",
              cursor:"pointer", width:18, height:18, fontSize:13, display:"flex",
              alignItems:"center", justifyContent:"center" }}>+</button>
        )}
        {/* 圃場追加＋ (常に表示) */}
        <button onClick={e => { e.stopPropagation(); addGroup(); }}
          style={{ background:"rgba(255,255,255,0.25)", border:"none", borderRadius:4, color:"#fff",
            cursor:"pointer", width:18, height:18, fontSize:13, display:"flex",
            alignItems:"center", justifyContent:"center" }}>🏡</button>
      </div>

      {area.groups.map(g => (
        <Group key={g.id} group={g}
          onChange={updGroup}
          onAddTask={() => onAddTask(area.id, g.id)}
          onDelete={() => delGroup(g.id)}
        />
      ))}

      {menu && (
        <ContextMenu
          x={menu.x} y={menu.y}
          onEdit={() => setEditOpen(true)}
          onDelete={onDelete}
          onClose={() => setMenu(null)}
        />
      )}
      {editOpen && (
        <EditModal
          title="地区を編集"
          initName={area.name}
          initEmoji={area.emoji}
          initColor={area.color}
          showEmoji={true}
          showColor={true}
          onSave={({ name, emoji, color }) => { onUpdate({ ...area, name, emoji, color }); setEditOpen(false); }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

// localStorage helpers
const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};
const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// アプリ本体
function App() {
  const [areas, setAreas] = useState(() => load("areas", INIT));
  const [modal, setModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🌾");
  const [newColor, setNewColor] = useState("#5b3d8f");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const colRef = useRef();

  // areasが変わるたびに自動保存
  useEffect(() => { save("areas", areas); }, [areas]);

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
        ...g, tasks: sortByPri([...g.tasks, newTask])
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

  const [yearGoal, setYearGoal] = useState(() => load("yearGoal", "年間目標を入力…"));
  const [todayGoal, setTodayGoal] = useState(() => load("todayGoal", "今日の目標を入力…"));
  const [editYear, setEditYear] = useState(false);
  const [editToday, setEditToday] = useState(false);
  const [logs, setLogs] = useState(() => load("logs", []));
  const [logOpen, setLogOpen] = useState(false);
  const [logText, setLogText] = useState("");
  const [logDate, setLogDate] = useState("");

  useEffect(() => { save("yearGoal", yearGoal); }, [yearGoal]);
  useEffect(() => { save("todayGoal", todayGoal); }, [todayGoal]);
  useEffect(() => { save("logs", logs); }, [logs]);

  const today = () => new Date().toLocaleDateString("ja-JP", { month:"numeric", day:"numeric", weekday:"short" });

  // タスク完了時に自動ログ
  const updWithLog = (updated) => {
    upd(updated);
    // 完了になったタスクを検出してログへ
    const prev = areas.find(a => a.id === updated.id);
    if (!prev) return;
    updated.groups.forEach(ng => {
      const og = prev.groups.find(g => g.id === ng.id);
      if (!og) return;
      ng.tasks.forEach(nt => {
        const ot = og.tasks.find(t => t.id === nt.id);
        if (ot && !ot.done && nt.done) {
          const entry = {
            id: nid(),
            date: new Date().toLocaleDateString("ja-JP"),
            time: new Date().toLocaleTimeString("ja-JP", { hour:"2-digit", minute:"2-digit" }),
            text: `✅ ${updated.name} › ${nt.text}`,
            manual: false,
          };
          setLogs(prev => [entry, ...prev]);
        }
      });
    });
  };

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column",
      background:"#12121c", fontFamily:"'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif",
      color:"#fff", overflow:"hidden" }}>

      <div style={{ padding:"8px 12px 6px", borderBottom:"1px solid #2a2a3a", flexShrink:0 }}>
        {/* 1行目：年間目標 + バッジ + ボタン */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
          {editYear
            ? <input autoFocus value={yearGoal} onChange={e => setYearGoal(e.target.value)}
                onBlur={() => setEditYear(false)}
                onKeyDown={e => e.key==="Enter" && setEditYear(false)}
                style={{ flex:1, background:"transparent", border:"none", borderBottom:"1px solid #aaa",
                  color:"#fff", fontSize:14, fontWeight:"bold", outline:"none" }} />
            : <span onClick={() => setEditYear(true)}
                style={{ flex:1, fontWeight:"bold", fontSize:14, color:"#fff", cursor:"text",
                  opacity: yearGoal==="年間目標を入力…" ? 0.35 : 1 }}>
                {yearGoal}
              </span>
          }
          <span style={{ background:"#e53e3e", color:"#fff", borderRadius:"50%", width:18, height:18,
            fontSize:10, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", flexShrink:0 }}>
            {total}
          </span>
          <button onClick={() => setLogOpen(true)} style={{ background:"#2a2a3a", border:"none", borderRadius:6,
            color:"#aaa", padding:"3px 8px", fontSize:10, cursor:"pointer", flexShrink:0 }}>📋 ログ</button>
          <button style={{ background:"#2a2a3a", border:"none", borderRadius:6,
            color:"#aaa", padding:"3px 8px", fontSize:10, cursor:"pointer", flexShrink:0 }}>完了▼</button>
          <button onClick={() => setModal(true)} style={{ background:"#2a2a3a", border:"none", borderRadius:6,
            color:"#aaa", padding:"3px 8px", fontSize:10, cursor:"pointer", flexShrink:0 }}>＋地区</button>
        </div>
        {/* 2行目：今日の目標 */}
        {editToday
          ? <input autoFocus value={todayGoal} onChange={e => setTodayGoal(e.target.value)}
              onBlur={() => setEditToday(false)}
              onKeyDown={e => e.key==="Enter" && setEditToday(false)}
              style={{ width:"100%", background:"transparent", border:"none", borderBottom:"1px solid #555",
                color:"#aaa", fontSize:11, outline:"none", boxSizing:"border-box" }} />
          : <span onClick={() => setEditToday(true)}
              style={{ fontSize:11, color:"#888", cursor:"text",
                opacity: todayGoal==="今日の目標を入力…" ? 0.5 : 1 }}>
              📍 {todayGoal}
            </span>
        }
      </div>

      {toast && (
        <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
          background:"#1e1e1e", border:"1px solid #e53e3e", borderRadius:12,
          padding:"14px 20px", zIndex:500, color:"#fff", fontSize:13,
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
                fontSize:28, cursor:"pointer", padding:"6px 14px"
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
                {CARD_COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)} style={{
                    width:32, height:32, borderRadius:"50%", background:c, border:"none",
                    cursor:"pointer", outline: newColor===c ? "3px solid #fff" : "none", outlineOffset:2
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
        <div style={{ position:"absolute", bottom:0, left:0, width:"calc(50% - 4px)", height:36,
          background:"linear-gradient(to bottom, transparent, rgba(80,60,160,0.3))",
          borderBottom:"2px dashed #5a4a9a", zIndex:5, pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:0, right:0, width:"calc(50% - 4px)", height:36,
          background:"linear-gradient(to top, transparent, rgba(80,60,160,0.3))",
          borderTop:"2px dashed #5a4a9a", zIndex:5, pointerEvents:"none" }} />

        <div ref={colRef} style={{
          height:"100%", columnCount:2, columnGap:8, columnFill:"auto",
          columnRuleWidth:"2px", columnRuleStyle:"dashed", columnRuleColor:"#3a3a5a",
          padding:8, overflow:"hidden", boxSizing:"border-box",
        }}>
          {areas.map((area, i) => (
            <div key={area.id} style={{ marginBottom: i < areas.length-1 ? 6 : 0, width:"100%" }}>
              <AreaCard area={area} onUpdate={updWithLog} onDelete={() => del(area.id)} onAddTask={addTask} />
            </div>
          ))}
        </div>
      </div>

      {/* 作業ログモーダル */}
      {logOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:300,
          display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div style={{ background:"#1e1e30", borderRadius:"16px 16px 0 0", width:"100%",
            maxHeight:"80vh", display:"flex", flexDirection:"column", border:"1px solid #444" }}>
            {/* ログヘッダー */}
            <div style={{ display:"flex", alignItems:"center", padding:"12px 14px 8px",
              borderBottom:"1px solid #2a2a3a" }}>
              <span style={{ fontWeight:"bold", fontSize:14, flex:1 }}>📋 作業ログ</span>
              <button onClick={() => setLogs([])} style={{ background:"transparent", border:"none",
                color:"#666", fontSize:11, cursor:"pointer", marginRight:10 }}>全削除</button>
              <button onClick={() => setLogOpen(false)} style={{ background:"transparent", border:"none",
                color:"#aaa", fontSize:18, cursor:"pointer", lineHeight:1 }}>×</button>
            </div>
            {/* 手動ログ入力 */}
            <div style={{ display:"flex", gap:6, padding:"8px 12px", borderBottom:"1px solid #2a2a3a" }}>
              <input value={logText} onChange={e => setLogText(e.target.value)}
                placeholder="作業メモを入力…"
                onKeyDown={e => {
                  if (e.key==="Enter" && logText.trim()) {
                    setLogs(prev => [{ id:nid(),
                      date: new Date().toLocaleDateString("ja-JP"),
                      time: new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"}),
                      text: logText.trim(), manual:true }, ...prev]);
                    setLogText("");
                  }
                }}
                style={{ flex:1, background:"#2a2a3a", border:"1px solid #444", borderRadius:7,
                  padding:"6px 10px", color:"#fff", fontSize:12, outline:"none" }} />
              <button onClick={() => {
                if (!logText.trim()) return;
                setLogs(prev => [{ id:nid(),
                  date: new Date().toLocaleDateString("ja-JP"),
                  time: new Date().toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"}),
                  text: logText.trim(), manual:true }, ...prev]);
                setLogText("");
              }} style={{ background:"#5b3d8f", border:"none", borderRadius:7, color:"#fff",
                padding:"6px 12px", cursor:"pointer", fontSize:12 }}>追加</button>
            </div>
            {/* ログ一覧 — 日付でグループ */}
            <div style={{ overflowY:"auto", flex:1, padding:"8px 12px" }}>
              {logs.length === 0
                ? <div style={{ color:"#555", fontSize:12, textAlign:"center", marginTop:20 }}>ログがありません</div>
                : (() => {
                    // 日付ごとにグループ化
                    const grouped = {};
                    logs.forEach(l => {
                      if (!grouped[l.date]) grouped[l.date] = [];
                      grouped[l.date].push(l);
                    });
                    return Object.entries(grouped).map(([date, items]) => (
                      <div key={date} style={{ marginBottom:12 }}>
                        <div style={{ fontSize:10, color:"#888", fontWeight:"bold",
                          marginBottom:4, borderBottom:"1px solid #2a2a3a", paddingBottom:2 }}>
                          {date}
                        </div>
                        {items.map(l => (
                          <div key={l.id} style={{ display:"flex", alignItems:"flex-start", gap:8,
                            padding:"5px 0", borderBottom:"1px solid #1e1e2a" }}>
                            <span style={{ fontSize:10, color:"#666", flexShrink:0, marginTop:1 }}>{l.time}</span>
                            <span style={{ fontSize:12, color: l.manual?"#ddd":"#aaa", flex:1, lineHeight:1.4 }}>
                              {l.text}
                            </span>
                            <button onClick={() => setLogs(prev => prev.filter(x => x.id!==l.id))}
                              style={{ background:"transparent", border:"none", color:"#444",
                                cursor:"pointer", fontSize:11, flexShrink:0 }}>×</button>
                          </div>
                        ))}
                      </div>
                    ));
                  })()
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
