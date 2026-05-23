import React from 'react'
import ReactDOM from 'react-dom/client'
import { useState, useEffect, useRef } from "react";

const COLOR_PALETTE = [
  { color: "#3a6e4a", emoji: "🌿" },
  { color: "#7c5a2a", emoji: "🍇" },
  { color: "#3a5a7c", emoji: "🌊" },
  { color: "#7c3a6e", emoji: "🌸" },
  { color: "#6e6e3a", emoji: "🌾" },
  { color: "#3a6e6e", emoji: "🍃" },
  { color: "#7c4a3a", emoji: "🍂" },
  { color: "#4a3a7c", emoji: "🫐" },
];

// 地区カラーから薄い背景色を生成
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const initialData = [
  {
    id: "kanayama", name: "金山寺", color: "#3a6e4a", emoji: "🌿",
    sections: [
      { id: "glass", name: "ガラス温室", todos: [
        { id: 1, text: "誘引", done: false, priority: "high" },
        { id: 2, text: "棚線張り直し", done: false, priority: "mid" },
      ]},
      { id: "field2", name: "圃場２", todos: [
        { id: 3, text: "棚修理", done: false, priority: "high" },
        { id: 4, text: "草刈り", done: false, priority: "low" },
      ]},
    ],
    todos: [],
  },
  {
    id: "ayugaeri", name: "鮎帰", color: "#7c5a2a", emoji: "🍇",
    sections: [], todos: [
      { id: 5, text: "棚線張る", done: false, priority: "high" },
      { id: 6, text: "シャインマスカット誘引", done: false, priority: "mid" },
    ],
  },
  { id: "yokoiue", name: "横井上", color: "#3a5a7c", emoji: "🌊", sections: [], todos: [] },
  { id: "yoshio",  name: "吉尾",  color: "#7c3a6e", emoji: "🌸", sections: [], todos: [] },
];

const P = {
  high: { label: "急", color: "#e05555" },
  mid:  { label: "中", color: "#e09040" },
  low:  { label: "低", color: "#5aaa5a" },
};

/* ── モーダル共通 ── */
function Modal({ onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#1c2a20",borderRadius:"18px 18px 0 0",padding:"20px 18px 40px",width:"100%",maxWidth:480,border:"1px solid rgba(255,255,255,0.12)"}}>
        {children}
      </div>
    </div>
  );
}

/* ── タスク追加モーダル ── */
function AddTodoModal({ target, fields, onAdd, onClose }) {
  const [text, setText] = useState("");
  const [pri, setPri] = useState("mid");
  const field = fields.find(f=>f.id===target.fieldId);
  const section = target.sectionId ? field?.sections.find(s=>s.id===target.sectionId) : null;
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:4}}>{field?.emoji} {field?.name}{section?` › ${section.name}`:""}</div>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:16}}>タスクを追加</div>
      <input autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="例：誘引、棚修理..."
        onKeyDown={e=>{if(e.key==="Enter"&&text.trim())onAdd(text.trim(),pri);if(e.key==="Escape")onClose();}}
        style={inputStyle}/>
      <div style={{display:"flex",gap:10,margin:"14px 0 18px"}}>
        {["high","mid","low"].map(p=>(
          <button key={p} onClick={()=>setPri(p)} style={{flex:1,padding:"10px 0",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",color:pri===p?"#fff":P[p].color,background:pri===p?P[p].color:"rgba(255,255,255,0.06)",border:`2px solid ${P[p].color}`}}>{P[p].label}</button>
        ))}
      </div>
      <button onClick={()=>{if(text.trim())onAdd(text.trim(),pri);}} style={submitBtn(field?.color)}>追加する</button>
    </Modal>
  );
}

/* ── エリア追加モーダル ── */
function AddSectionModal({ fieldId, fields, onAdd, onClose }) {
  const [name, setName] = useState("");
  const field = fields.find(f=>f.id===fieldId);
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:16}}>{field?.emoji} {field?.name} › エリア追加</div>
      <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例：ガラス温室、圃場２..."
        onKeyDown={e=>{if(e.key==="Enter"&&name.trim())onAdd(name.trim());if(e.key==="Escape")onClose();}}
        style={inputStyle}/>
      <button onClick={()=>{if(name.trim())onAdd(name.trim());}} style={{...submitBtn(field?.color),marginTop:18}}>追加する</button>
    </Modal>
  );
}

/* ── 地区追加モーダル ── */
function AddFieldModal({ fields, onAdd, onClose }) {
  const [name, setName] = useState("");
  const next = COLOR_PALETTE[fields.length % COLOR_PALETTE.length];
  const [emoji, setEmoji] = useState(next.emoji);
  const [color, setColor] = useState(next.color);
  const EMOJIS = ["🌿","🍇","🌊","🌸","🌾","🍃","🍂","🫐","🌻","🍋","🌴","⛰️"];
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:16}}>🗾 新しい地区を追加</div>
      <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例：横井上、吉尾..."
        onKeyDown={e=>{if(e.key==="Enter"&&name.trim())onAdd(name.trim(),emoji,color);if(e.key==="Escape")onClose();}}
        style={inputStyle}/>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:"14px 0 8px"}}>アイコン</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
        {EMOJIS.map(e=>(<button key={e} onClick={()=>setEmoji(e)} style={{width:40,height:40,borderRadius:10,fontSize:19,cursor:"pointer",background:emoji===e?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.07)",border:emoji===e?"2px solid rgba(255,255,255,0.6)":"1.5px solid rgba(255,255,255,0.1)"}}>{e}</button>))}
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:8}}>カラー</div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
        {COLOR_PALETTE.map(cp=>(<button key={cp.color} onClick={()=>setColor(cp.color)} style={{width:34,height:34,borderRadius:"50%",background:cp.color,cursor:"pointer",padding:0,border:color===cp.color?"3px solid #fff":"2px solid transparent",boxShadow:color===cp.color?`0 0 0 2px ${cp.color}`:"none"}}/>))}
        <label style={{position:"relative",width:34,height:34,cursor:"pointer"}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎨</div>
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
        </label>
      </div>
      <div style={{background:`linear-gradient(135deg,${color}cc,${color}88)`,borderRadius:10,padding:"9px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>{emoji}</span>
        <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>{name||"地区名"}</span>
      </div>
      <button onClick={()=>{if(name.trim())onAdd(name.trim(),emoji,color);}} style={{...submitBtn(color),opacity:name.trim()?1:0.5}}>地区を追加する</button>
    </Modal>
  );
}

/* ── 完了一括クリア確認モーダル ── */
function ClearDoneModal({ fields, onClear, onClose }) {
  const count = fields.reduce((a,f)=>
    a+f.todos.filter(t=>t.done).length+f.sections.reduce((b,s)=>b+s.todos.filter(t=>t.done).length,0),0);
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:10}}>✅ 完了タスクを一括クリア</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:24}}>完了済みのタスクが <span style={{color:"#e05555",fontWeight:700}}>{count}件</span> あります。全て削除しますか？</div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.7)",fontSize:14,cursor:"pointer"}}>キャンセル</button>
        <button onClick={onClear} style={{flex:1,padding:"12px",borderRadius:10,border:"none",background:"#e05555",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>削除する</button>
      </div>
    </Modal>
  );
}

/* ── ドラッグ可能ToDoの1行 ── */
function TodoRow({ todo, onToggle, onDelete, onDragStart, onDragOver, onDrop, isDragging }) {
  const p = P[todo.priority]||P.low;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={e=>{e.preventDefault();onDragOver&&onDragOver();}}
      onDrop={onDrop}
      style={{
        display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,
        background:isDragging?"rgba(255,255,255,0.15)":todo.done?"transparent":"rgba(255,255,255,0.07)",
        marginBottom:3,opacity:todo.done?0.38:1,transition:"opacity 0.15s, background 0.1s",
        cursor:"grab",border:isDragging?"1px dashed rgba(255,255,255,0.4)":"1px solid transparent",
      }}
    >
      {/* 完了ボタン：大きめ */}
      <button onClick={onToggle} style={{
        width:22,height:22,borderRadius:"50%",flexShrink:0,
        border:`2px solid ${todo.done?"rgba(255,255,255,0.3)":p.color}`,
        background:todo.done?"rgba(255,255,255,0.3)":"transparent",
        cursor:"pointer",padding:0,display:"flex",alignItems:"center",justifyContent:"center",
      }}>
        {todo.done&&<span style={{fontSize:11,color:"#fff",fontWeight:700,lineHeight:1}}>✓</span>}
      </button>
      <span style={{flex:1,fontSize:12,color:"rgba(255,255,255,0.88)",textDecoration:todo.done?"line-through":"none",lineHeight:1.35,wordBreak:"break-all"}}>{todo.text}</span>
      <span style={{fontSize:10,fontWeight:700,color:p.color,flexShrink:0}}>{p.label}</span>
      {/* 削除ボタン：大きめ */}
      <button onClick={onDelete} style={{
        background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.5)",
        fontSize:14,cursor:"pointer",padding:0,lineHeight:1,flexShrink:0,
        width:22,height:22,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",
      }}>×</button>
    </div>
  );
}

const inputStyle = {width:"100%",boxSizing:"border-box",border:"1.5px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"12px 14px",fontSize:15,background:"rgba(255,255,255,0.08)",color:"#fff",fontFamily:"'Noto Sans JP',sans-serif",outline:"none"};
const submitBtn = color => ({width:"100%",padding:"14px",borderRadius:12,border:"none",background:color||"#4a7c59",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer"});

/* ── メイン ── */
function FarmTodo() {
  const [fields, setFields] = useState(()=>{
    try{const s=localStorage.getItem("farmtodo_v6");return s?JSON.parse(s):initialData;}catch{return initialData;}
  });
  const [addingTodo,    setAddingTodo]    = useState(null);
  const [addingSection, setAddingSection] = useState(null);
  const [addingField,   setAddingField]   = useState(false);
  const [showDone,      setShowDone]      = useState(false);
  const [showClearDone, setShowClearDone] = useState(false);
  const [logs,          setLogs]          = useState(()=>{
    try{const s=localStorage.getItem("farmtodo_logs");return s?JSON.parse(s):[];}catch{return [];}
  });

  // ドラッグ状態
  const dragInfo = useRef(null); // {fieldId, sectionId, todoId}

  useEffect(()=>{
    try{localStorage.setItem("farmtodo_v6",JSON.stringify(fields));}catch{}
  },[fields]);
  useEffect(()=>{
    try{localStorage.setItem("farmtodo_logs",JSON.stringify(logs.slice(0,200)));}catch{}
  },[logs]);

  const addLog = (text) => {
    const now = new Date();
    const str = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,"0")}/${String(now.getDate()).padStart(2,"0")} ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    setLogs(prev=>[{time:str,text},...prev]);
  };

  const toggleTodo = (fid,sid,tid) => {
    let taskText="";
    setFields(prev=>prev.map(f=>{
      if(f.id!==fid)return f;
      if(sid)return{...f,sections:f.sections.map(s=>{
        if(s.id!==sid)return s;
        return{...s,todos:s.todos.map(t=>{
          if(t.id!==tid)return t;
          taskText=t.text;
          return{...t,done:!t.done};
        })};
      })};
      return{...f,todos:f.todos.map(t=>{
        if(t.id!==tid)return t;
        taskText=t.text;
        return{...t,done:!t.done};
      })};
    }));
    if(taskText) addLog(`完了: ${taskText}`);
  };

  const deleteTodo = (fid,sid,tid) => {
    let taskText="";
    setFields(prev=>prev.map(f=>{
      if(f.id!==fid)return f;
      if(sid)return{...f,sections:f.sections.map(s=>{
        if(s.id!==sid)return s;
        const t=s.todos.find(t=>t.id===tid);
        if(t)taskText=t.text;
        return{...s,todos:s.todos.filter(t=>t.id!==tid)};
      })};
      const t=f.todos.find(t=>t.id===tid);
      if(t)taskText=t.text;
      return{...f,todos:f.todos.filter(t=>t.id!==tid)};
    }));
    if(taskText) addLog(`削除: ${taskText}`);
  };

  const addTodo = (text,priority) => {
    if(!addingTodo)return;
    const{fieldId:fid,sectionId:sid}=addingTodo;
    const nid=Date.now();
    setFields(prev=>prev.map(f=>{
      if(f.id!==fid)return f;
      if(sid)return{...f,sections:f.sections.map(s=>s.id!==sid?s:{...s,todos:[...s.todos,{id:nid,text,done:false,priority}]})};
      return{...f,todos:[...f.todos,{id:nid,text,done:false,priority}]};
    }));
    addLog(`追加: ${text}`);
    setAddingTodo(null);
  };

  const addSection = name => {
    if(!addingSection)return;
    setFields(prev=>prev.map(f=>f.id!==addingSection?f:{...f,sections:[...f.sections,{id:`sec_${Date.now()}`,name,todos:[]}]}));
    addLog(`エリア追加: ${name}`);
    setAddingSection(null);
  };

  const addField = (name,emoji,color) => {
    setFields(prev=>[...prev,{id:`fld_${Date.now()}`,name,emoji,color,sections:[],todos:[]}]);
    addLog(`地区追加: ${name}`);
    setAddingField(false);
  };

  const deleteField = fid => {
    const f=fields.find(f=>f.id===fid);
    if(!window.confirm(`「${f?.name}」を削除しますか？`))return;
    setFields(prev=>prev.filter(f=>f.id!==fid));
    addLog(`地区削除: ${f?.name}`);
  };

  const clearDone = () => {
    setFields(prev=>prev.map(f=>({
      ...f,
      todos:f.todos.filter(t=>!t.done),
      sections:f.sections.map(s=>({...s,todos:s.todos.filter(t=>!t.done)})),
    })));
    addLog("完了タスクを一括クリア");
    setShowClearDone(false);
  };

  // ドラッグ＆ドロップ
  const handleDragStart = (fieldId,sectionId,todoId) => {
    dragInfo.current = {fieldId,sectionId,todoId};
  };
  const handleDrop = (targetFieldId,targetSectionId,targetTodoId) => {
    const src = dragInfo.current;
    if(!src||src.todoId===targetTodoId)return;
    setFields(prev=>{
      // ソースのtodoを取得・削除
      let draggedTodo=null;
      const next=prev.map(f=>{
        if(f.id!==src.fieldId)return f;
        if(src.sectionId){
          return{...f,sections:f.sections.map(s=>{
            if(s.id!==src.sectionId)return s;
            draggedTodo=s.todos.find(t=>t.id===src.todoId);
            return{...s,todos:s.todos.filter(t=>t.id!==src.todoId)};
          })};
        }
        draggedTodo=f.todos.find(t=>t.id===src.todoId);
        return{...f,todos:f.todos.filter(t=>t.id!==src.todoId)};
      });
      if(!draggedTodo)return prev;
      // ターゲット位置に挿入
      return next.map(f=>{
        if(f.id!==targetFieldId)return f;
        if(targetSectionId){
          return{...f,sections:f.sections.map(s=>{
            if(s.id!==targetSectionId)return s;
            const idx=s.todos.findIndex(t=>t.id===targetTodoId);
            const newTodos=[...s.todos];
            newTodos.splice(idx,0,draggedTodo);
            return{...s,todos:newTodos};
          })};
        }
        const idx=f.todos.findIndex(t=>t.id===targetTodoId);
        const newTodos=[...f.todos];
        newTodos.splice(idx,0,draggedTodo);
        return{...f,todos:newTodos};
      });
    });
    dragInfo.current=null;
  };

  const ft = todos => showDone?todos:todos.filter(t=>!t.done);
  const totalPending = fields.reduce((a,f)=>a+f.todos.filter(t=>!t.done).length+f.sections.reduce((b,s)=>b+s.todos.filter(t=>!t.done).length,0),0);
  const totalDone = fields.reduce((a,f)=>a+f.todos.filter(t=>t.done).length+f.sections.reduce((b,s)=>b+s.todos.filter(t=>t.done).length,0),0);

  return (
    <div style={{
      position:"fixed",inset:0,
      background:"linear-gradient(160deg,#1a2e22 0%,#2d1a0a 100%)",
      display:"flex",flexDirection:"column",
      fontFamily:"'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif",
      overflow:"hidden",
    }}>
      {/* ヘッダー */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px 8px",borderBottom:"1px solid rgba(255,255,255,0.1)",flexShrink:0}}>
        <span style={{fontSize:18}}>🌾</span>
        <span style={{fontSize:15,fontWeight:700,color:"#fff",letterSpacing:1}}>圃場 ToDo</span>
        <span style={{fontSize:11,background:"#d94040",color:"#fff",borderRadius:10,padding:"1px 8px",fontWeight:700}}>{totalPending}</span>
        <div style={{flex:1}}/>
        {/* 完了一括クリア */}
        {totalDone>0&&(
          <button onClick={()=>setShowClearDone(true)} style={{fontSize:11,color:"rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:7,padding:"4px 10px",cursor:"pointer"}}>
            ✅ {totalDone}件クリア
          </button>
        )}
        <button onClick={()=>setShowDone(v=>!v)} style={{fontSize:11,color:showDone?"#fff":"rgba(255,255,255,0.45)",background:showDone?"rgba(255,255,255,0.18)":"transparent",border:"1px solid rgba(255,255,255,0.22)",borderRadius:7,padding:"4px 10px",cursor:"pointer"}}>
          完了{showDone?"▲":"▼"}
        </button>
        <button onClick={()=>setAddingField(true)} style={{fontSize:11,color:"rgba(255,255,255,0.7)",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.22)",borderRadius:7,padding:"4px 10px",cursor:"pointer"}}>
          ＋ 地区
        </button>
      </div>

      {/* スクロール可能なグリッドエリア（2列・折り返し） */}
      <div style={{
        flex:1,
        overflowY:"auto",
        WebkitOverflowScrolling:"touch",
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gridAutoRows:"min-content",
        alignContent:"start",
        gap:8,padding:8,
      }}>
        {fields.map(field=>{
          const pending=field.todos.filter(t=>!t.done).length+field.sections.reduce((a,s)=>a+s.todos.filter(t=>!t.done).length,0);
          const ftodos=ft(field.todos);
          const fieldBg = hexToRgba(field.color, 0.12);
          const sectionBg = hexToRgba(field.color, 0.18);

          return (
            <div key={field.id} style={{
              background:fieldBg,
              borderRadius:12,
              border:`1.5px solid ${field.color}66`,
              display:"flex",flexDirection:"column",
              overflow:"hidden",minWidth:0,
            }}>
              {/* 地区ヘッダー */}
              <div style={{background:`linear-gradient(135deg,${field.color}dd,${field.color}99)`,padding:"8px 10px",display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <span style={{fontSize:14}}>{field.emoji}</span>
                <span style={{fontSize:13,fontWeight:700,color:"#fff",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{field.name}</span>
                {pending>0&&<span style={{fontSize:10,background:"rgba(255,255,255,0.28)",color:"#fff",borderRadius:8,padding:"1px 6px",fontWeight:700,flexShrink:0}}>{pending}</span>}
                {/* エリア追加ボタン：大きく */}
                <button onClick={()=>setAddingSection(field.id)} title="エリア追加" style={iconBtn}>⊕</button>
                {/* 地区削除ボタン：大きく */}
                <button onClick={()=>deleteField(field.id)} title="地区を削除" style={{...iconBtn,background:"rgba(220,80,80,0.3)",color:"rgba(255,200,200,0.9)"}}>✕</button>
              </div>

              {/* コンテンツ */}
              <div style={{padding:"6px 6px 5px"}}>
                {/* 圃場直下Todo */}
                {ftodos.length>0&&(
                  <div style={{marginBottom:field.sections.length?5:0}}>
                    {ftodos.map(todo=>(
                      <TodoRow key={todo.id} todo={todo}
                        onToggle={()=>toggleTodo(field.id,null,todo.id)}
                        onDelete={()=>deleteTodo(field.id,null,todo.id)}
                        onDragStart={()=>handleDragStart(field.id,null,todo.id)}
                        onDragOver={()=>{}}
                        onDrop={()=>handleDrop(field.id,null,todo.id)}
                      />
                    ))}
                  </div>
                )}

                {/* サブエリア */}
                {field.sections.map(section=>{
                  const stodos=ft(section.todos);
                  const sp=section.todos.filter(t=>!t.done).length;
                  return (
                    <div key={section.id} style={{
                      background:sectionBg,
                      borderRadius:8,marginBottom:4,overflow:"hidden",
                      border:`1px solid ${field.color}44`,
                    }}>
                      {/* エリアヘッダー */}
                      <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:`${field.color}33`}}>
                        <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.85)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{section.name}</span>
                        {sp>0&&<span style={{fontSize:10,background:`${field.color}cc`,color:"#fff",borderRadius:6,padding:"1px 6px",fontWeight:700}}>{sp}</span>}
                        {/* エリア内タスク追加ボタン：大きく */}
                        <button onClick={()=>setAddingTodo({fieldId:field.id,sectionId:section.id})} style={{
                          background:"rgba(255,255,255,0.15)",border:"none",color:"rgba(255,255,255,0.8)",
                          fontSize:16,cursor:"pointer",padding:0,lineHeight:1,
                          width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",
                        }}>+</button>
                      </div>
                      <div style={{padding:"4px 6px 5px"}}>
                        {stodos.length===0
                          ?<div style={{fontSize:10,color:"rgba(255,255,255,0.25)",padding:"2px 2px"}}>なし ✓</div>
                          :stodos.map(todo=>(
                            <TodoRow key={todo.id} todo={todo}
                              onToggle={()=>toggleTodo(field.id,section.id,todo.id)}
                              onDelete={()=>deleteTodo(field.id,section.id,todo.id)}
                              onDragStart={()=>handleDragStart(field.id,section.id,todo.id)}
                              onDragOver={()=>{}}
                              onDrop={()=>handleDrop(field.id,section.id,todo.id)}
                            />
                          ))
                        }
                      </div>
                    </div>
                  );
                })}

                {/* タスク追加ボタン：大きく */}
                <button onClick={()=>setAddingTodo({fieldId:field.id,sectionId:null})} style={{
                  width:"100%",background:"transparent",
                  border:`1.5px dashed ${field.color}66`,
                  borderRadius:8,color:`${field.color}cc`,
                  fontSize:12,padding:"7px 0",cursor:"pointer",marginTop:2,fontWeight:600,
                }}>＋ タスク追加</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 作業ログ（下部スライドパネル） */}
      <LogPanel logs={logs} />

      {/* モーダル */}
      {addingTodo    && <AddTodoModal    target={addingTodo} fields={fields} onAdd={addTodo}    onClose={()=>setAddingTodo(null)}/>}
      {addingSection && <AddSectionModal fieldId={addingSection} fields={fields} onAdd={addSection} onClose={()=>setAddingSection(null)}/>}
      {addingField   && <AddFieldModal   fields={fields} onAdd={addField} onClose={()=>setAddingField(false)}/>}
      {showClearDone && <ClearDoneModal  fields={fields} onClear={clearDone} onClose={()=>setShowClearDone(false)}/>}
    </div>
  );
}

/* ── 作業ログパネル ── */
function LogPanel({ logs }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* ログボタン */}
      <div style={{
        flexShrink:0,
        borderTop:"1px solid rgba(255,255,255,0.1)",
        padding:"6px 14px",
        display:"flex",alignItems:"center",gap:8,
        background:"rgba(0,0,0,0.2)",
      }}>
        <button onClick={()=>setOpen(v=>!v)} style={{
          fontSize:11,color:"rgba(255,255,255,0.55)",background:"transparent",
          border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,
          padding:"4px 12px",cursor:"pointer",
        }}>📋 作業ログ {open?"▼":"▲"}</button>
        {logs.length>0&&<span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{logs.length}件</span>}
      </div>

      {/* ログ一覧 */}
      {open&&(
        <div style={{
          flexShrink:0,maxHeight:"35vh",overflowY:"auto",
          background:"rgba(0,0,0,0.35)",
          borderTop:"1px solid rgba(255,255,255,0.08)",
          padding:"8px 12px",
        }}>
          {logs.length===0
            ?<div style={{fontSize:11,color:"rgba(255,255,255,0.25)",textAlign:"center",padding:"12px 0"}}>ログはまだありません</div>
            :logs.map((log,i)=>(
              <div key={i} style={{display:"flex",gap:10,padding:"4px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",flexShrink:0,whiteSpace:"nowrap"}}>{log.time}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{log.text}</span>
              </div>
            ))
          }
        </div>
      )}
    </>
  );
}

const iconBtn = {
  background:"rgba(255,255,255,0.2)",border:"none",
  color:"rgba(255,255,255,0.9)",fontSize:14,borderRadius:7,
  width:26,height:26,cursor:"pointer",padding:0,flexShrink:0,
  display:"flex",alignItems:"center",justifyContent:"center",
};

ReactDOM.createRoot(document.getElementById('root')).render(<FarmTodo />)
