import React from 'react'
import ReactDOM from 'react-dom/client'
import { useState, useEffect, useRef, useCallback } from "react";

const COLOR_PALETTE = [
  "#3a6e4a","#7c5a2a","#3a5a7c","#7c3a6e",
  "#6e6e3a","#3a6e6e","#7c4a3a","#4a3a7c",
  "#5a3a7c","#7c6a3a","#3a7c5a","#7c3a3a",
];
const EMOJI_LIST = ["🌿","🍇","🌊","🌸","🌾","🍃","🍂","🫐","🌻","🍋","🌴","⛰️","🏔️","🌵","🦋"];

function hexToRgba(hex,a){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

const initialData = [
  { id:"kanayama",name:"金山寺",color:"#3a6e4a",emoji:"🌿",
    sections:[
      {id:"glass",name:"ガラス温室",todos:[
        {id:1,text:"誘引",done:false,priority:"high"},
        {id:2,text:"棚線張り直し",done:false,priority:"mid"},
      ]},
      {id:"field2",name:"圃場２",todos:[
        {id:3,text:"棚修理",done:false,priority:"high"},
        {id:4,text:"草刈り",done:false,priority:"low"},
      ]},
    ],todos:[]},
  { id:"ayugaeri",name:"鮎帰",color:"#7c5a2a",emoji:"🍇",sections:[],todos:[
    {id:5,text:"棚線張る",done:false,priority:"high"},
    {id:6,text:"シャインマスカット誘引",done:false,priority:"mid"},
  ]},
  {id:"yokoiue",name:"横井上",color:"#3a5a7c",emoji:"🌊",sections:[],todos:[]},
  {id:"yoshio",name:"吉尾",color:"#7c3a6e",emoji:"🌸",sections:[],todos:[]},
];

const P = {
  high:{label:"急",color:"#e05555"},
  mid: {label:"中",color:"#e09040"},
  low: {label:"低",color:"#5aaa5a"},
};

/* ── インライン編集テキスト ── */
function EditableText({value, onSave, style, placeholder}){
  const [editing,setEditing]=useState(false);
  const [val,setVal]=useState(value);
  const ref=useRef();
  useEffect(()=>{if(editing&&ref.current)ref.current.focus();},[editing]);
  useEffect(()=>{setVal(value);},[value]);
  if(editing) return(
    <input ref={ref} value={val}
      onChange={e=>setVal(e.target.value)}
      onBlur={()=>{onSave(val.trim()||value);setEditing(false);}}
      onKeyDown={e=>{if(e.key==="Enter"){onSave(val.trim()||value);setEditing(false);}if(e.key==="Escape"){setVal(value);setEditing(false);}}}
      style={{...style,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.4)",
        borderRadius:4,outline:"none",padding:"1px 4px",color:"#fff",minWidth:0,width:"100%",boxSizing:"border-box"}}
    />
  );
  return <span onClick={()=>setEditing(true)} style={{...style,cursor:"text",minWidth:0}} title="タップで編集">{value||placeholder}</span>;
}

/* ── モーダル共通 ── */
function Modal({onClose,children}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#1c2a20",borderRadius:"18px 18px 0 0",padding:"20px 18px 44px",width:"100%",maxWidth:480,border:"1px solid rgba(255,255,255,0.12)"}}>
        {children}
      </div>
    </div>
  );
}

/* ── タスク追加モーダル ── */
function AddTodoModal({target,fields,onAdd,onClose}){
  const [text,setText]=useState("");
  const [pri,setPri]=useState("mid");
  const field=fields.find(f=>f.id===target.fieldId);
  const section=target.sectionId?field?.sections.find(s=>s.id===target.sectionId):null;
  return(
    <Modal onClose={onClose}>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:4}}>{field?.emoji} {field?.name}{section?` › ${section.name}`:""}</div>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:16}}>タスクを追加</div>
      <input autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="例：誘引、棚修理..."
        onKeyDown={e=>{if(e.key==="Enter"&&text.trim())onAdd(text.trim(),pri);if(e.key==="Escape")onClose();}}
        style={iStyle}/>
      <div style={{display:"flex",gap:10,margin:"14px 0 18px"}}>
        {["high","mid","low"].map(p=>(
          <button key={p} onClick={()=>setPri(p)} style={{flex:1,padding:"10px 0",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",
            color:pri===p?"#fff":P[p].color,background:pri===p?P[p].color:"rgba(255,255,255,0.06)",border:`2px solid ${P[p].color}`}}>{P[p].label}</button>
        ))}
      </div>
      <button onClick={()=>{if(text.trim())onAdd(text.trim(),pri);}} style={sBtn(field?.color)}>追加する</button>
    </Modal>
  );
}

/* ── エリア追加モーダル ── */
function AddSectionModal({fieldId,fields,onAdd,onClose}){
  const [name,setName]=useState("");
  const field=fields.find(f=>f.id===fieldId);
  return(
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:16}}>{field?.emoji} {field?.name} › エリア追加</div>
      <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例：ガラス温室、圃場２..."
        onKeyDown={e=>{if(e.key==="Enter"&&name.trim())onAdd(name.trim());if(e.key==="Escape")onClose();}}
        style={iStyle}/>
      <button onClick={()=>{if(name.trim())onAdd(name.trim());}} style={{...sBtn(field?.color),marginTop:18}}>追加する</button>
    </Modal>
  );
}

/* ── 地区追加モーダル ── */
function AddFieldModal({fields,onAdd,onClose}){
  const [name,setName]=useState("");
  const [emoji,setEmoji]=useState("🌿");
  const [color,setColor]=useState("#3a6e4a");
  return(
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:16}}>🗾 新しい地区を追加</div>
      <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例：横井上、吉尾..."
        onKeyDown={e=>{if(e.key==="Enter"&&name.trim())onAdd(name.trim(),emoji,color);if(e.key==="Escape")onClose();}}
        style={iStyle}/>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:"14px 0 8px"}}>アイコン</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
        {EMOJI_LIST.map(e=>(<button key={e} onClick={()=>setEmoji(e)} style={{width:40,height:40,borderRadius:10,fontSize:19,cursor:"pointer",
          background:emoji===e?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.07)",
          border:emoji===e?"2px solid rgba(255,255,255,0.6)":"1.5px solid rgba(255,255,255,0.1)"}}>{e}</button>))}
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:8}}>カラー</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
        {COLOR_PALETTE.map(c=>(<button key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:"50%",background:c,cursor:"pointer",padding:0,
          border:color===c?"3px solid #fff":"2px solid transparent",boxShadow:color===c?`0 0 0 2px ${c}`:"none"}}/>))}
        <label style={{position:"relative",width:32,height:32,cursor:"pointer"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎨</div>
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
        </label>
      </div>
      <div style={{background:`linear-gradient(135deg,${color}dd,${color}99)`,borderRadius:10,padding:"9px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>{emoji}</span>
        <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>{name||"地区名"}</span>
      </div>
      <button onClick={()=>{if(name.trim())onAdd(name.trim(),emoji,color);}} style={{...sBtn(color),opacity:name.trim()?1:0.5}}>地区を追加する</button>
    </Modal>
  );
}

/* ── 長押し地区編集メニュー ── */
function FieldEditModal({field,onSave,onDelete,onClose}){
  const [name,setName]=useState(field.name);
  const [emoji,setEmoji]=useState(field.emoji);
  const [color,setColor]=useState(field.color);
  return(
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:16}}>✏️ 地区を編集</div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:6}}>地区名</div>
      <input value={name} onChange={e=>setName(e.target.value)}
        style={iStyle}/>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:"14px 0 8px"}}>アイコン</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
        {EMOJI_LIST.map(e=>(<button key={e} onClick={()=>setEmoji(e)} style={{width:40,height:40,borderRadius:10,fontSize:19,cursor:"pointer",
          background:emoji===e?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.07)",
          border:emoji===e?"2px solid rgba(255,255,255,0.6)":"1.5px solid rgba(255,255,255,0.1)"}}>{e}</button>))}
      </div>
      <div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:8}}>カラー</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:18}}>
        {COLOR_PALETTE.map(c=>(<button key={c} onClick={()=>setColor(c)} style={{width:32,height:32,borderRadius:"50%",background:c,cursor:"pointer",padding:0,
          border:color===c?"3px solid #fff":"2px solid transparent",boxShadow:color===c?`0 0 0 2px ${c}`:"none"}}/>))}
        <label style={{position:"relative",width:32,height:32,cursor:"pointer"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>🎨</div>
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
        </label>
      </div>
      {/* プレビュー */}
      <div style={{background:`linear-gradient(135deg,${color}dd,${color}99)`,borderRadius:10,padding:"9px 14px",marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:18}}>{emoji}</span>
        <span style={{fontSize:14,fontWeight:700,color:"#fff"}}>{name||"地区名"}</span>
      </div>
      <button onClick={()=>onSave(name.trim()||field.name,emoji,color)} style={{...sBtn(color),marginBottom:10}}>保存する</button>
      <button onClick={onDelete} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"rgba(220,60,60,0.7)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>🗑️ この地区を削除する</button>
    </Modal>
  );
}

/* ── 完了一括クリア確認 ── */
function ClearDoneModal({count,onClear,onClose}){
  return(
    <Modal onClose={onClose}>
      <div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:10}}>✅ 完了タスクを一括クリア</div>
      <div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:24}}>完了済み <span style={{color:"#e05555",fontWeight:700}}>{count}件</span> を全て削除しますか？</div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,padding:"12px",borderRadius:10,border:"1px solid rgba(255,255,255,0.2)",background:"transparent",color:"rgba(255,255,255,0.7)",fontSize:14,cursor:"pointer"}}>キャンセル</button>
        <button onClick={onClear} style={{flex:1,padding:"12px",borderRadius:10,border:"none",background:"#e05555",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>削除する</button>
      </div>
    </Modal>
  );
}

/* ── ToDo1行 ── */
function TodoRow({todo,onToggle,onDelete,onEditText,onDragStart,onDragOver,onDrop}){
  const p=P[todo.priority]||P.low;
  return(
    <div draggable onDragStart={onDragStart}
      onDragOver={e=>{e.preventDefault();onDragOver&&onDragOver();}}
      onDrop={onDrop}
      style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:7,
        background:todo.done?"transparent":"rgba(255,255,255,0.07)",
        marginBottom:3,opacity:todo.done?0.38:1,transition:"opacity 0.15s",
        border:"1px solid transparent",cursor:"grab"}}>
      <button onClick={onToggle} style={{width:22,height:22,borderRadius:"50%",flexShrink:0,
        border:`2px solid ${todo.done?"rgba(255,255,255,0.3)":p.color}`,
        background:todo.done?"rgba(255,255,255,0.3)":"transparent",
        cursor:"pointer",padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {todo.done&&<span style={{fontSize:11,color:"#fff",fontWeight:700,lineHeight:1}}>✓</span>}
      </button>
      <EditableText value={todo.text} onSave={onEditText}
        style={{flex:1,fontSize:12,color:"rgba(255,255,255,0.88)",
          textDecoration:todo.done?"line-through":"none",lineHeight:1.35,wordBreak:"break-all"}}/>
      <span style={{fontSize:10,fontWeight:700,color:p.color,flexShrink:0}}>{p.label}</span>
      <button onClick={onDelete} style={{background:"rgba(255,255,255,0.08)",border:"none",color:"rgba(255,255,255,0.5)",
        fontSize:14,cursor:"pointer",padding:0,width:22,height:22,borderRadius:5,
        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
    </div>
  );
}

const iStyle={width:"100%",boxSizing:"border-box",border:"1.5px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"12px 14px",fontSize:15,background:"rgba(255,255,255,0.08)",color:"#fff",fontFamily:"'Noto Sans JP',sans-serif",outline:"none"};
const sBtn=color=>({width:"100%",padding:"14px",borderRadius:12,border:"none",background:color||"#4a7c59",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer"});
const iconBtn={background:"rgba(255,255,255,0.2)",border:"none",color:"rgba(255,255,255,0.9)",fontSize:14,borderRadius:7,width:26,height:26,cursor:"pointer",padding:0,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"};

/* ── メイン ── */
function FarmTodo(){
  const [fields,setFields]=useState(()=>{
    try{const s=localStorage.getItem("farmtodo_v7");return s?JSON.parse(s):initialData;}catch{return initialData;}
  });
  const [appTitle,setAppTitle]=useState(()=>localStorage.getItem("farmtodo_title")||"圃場 ToDo");
  const [addingTodo,setAddingTodo]=useState(null);
  const [addingSection,setAddingSection]=useState(null);
  const [addingField,setAddingField]=useState(false);
  const [showDone,setShowDone]=useState(false);
  const [showClearDone,setShowClearDone]=useState(false);
  const [editingField,setEditingField]=useState(null);
  const [logs,setLogs]=useState(()=>{try{const s=localStorage.getItem("farmtodo_logs");return s?JSON.parse(s):[];}catch{return [];}});
  const dragInfo=useRef(null);
  const longPressTimer=useRef(null);

  useEffect(()=>{try{localStorage.setItem("farmtodo_v7",JSON.stringify(fields));}catch{}},[fields]);
  useEffect(()=>{try{localStorage.setItem("farmtodo_logs",JSON.stringify(logs.slice(0,300)));}catch{}},[logs]);
  useEffect(()=>{try{localStorage.setItem("farmtodo_title",appTitle);}catch{}},[appTitle]);

  const addLog=text=>{
    const n=new Date();
    const t=`${n.getFullYear()}/${String(n.getMonth()+1).padStart(2,"0")}/${String(n.getDate()).padStart(2,"0")} ${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;
    setLogs(prev=>[{time:t,text},...prev]);
  };

  const toggleTodo=(fid,sid,tid)=>{
    let txt="";
    setFields(prev=>prev.map(f=>{
      if(f.id!==fid)return f;
      if(sid)return{...f,sections:f.sections.map(s=>{
        if(s.id!==sid)return s;
        return{...s,todos:s.todos.map(t=>{if(t.id!==tid)return t;txt=t.text;return{...t,done:!t.done};})};
      })};
      return{...f,todos:f.todos.map(t=>{if(t.id!==tid)return t;txt=t.text;return{...t,done:!t.done};})};
    }));
    if(txt)addLog(`完了: ${txt}`);
  };

  const deleteTodo=(fid,sid,tid)=>{
    let txt="";
    setFields(prev=>prev.map(f=>{
      if(f.id!==fid)return f;
      if(sid)return{...f,sections:f.sections.map(s=>{
        if(s.id!==sid)return s;
        const t=s.todos.find(t=>t.id===tid);if(t)txt=t.text;
        return{...s,todos:s.todos.filter(t=>t.id!==tid)};
      })};
      const t=f.todos.find(t=>t.id===tid);if(t)txt=t.text;
      return{...f,todos:f.todos.filter(t=>t.id!==tid)};
    }));
    if(txt)addLog(`削除: ${txt}`);
  };

  const editTodoText=(fid,sid,tid,newText)=>{
    setFields(prev=>prev.map(f=>{
      if(f.id!==fid)return f;
      if(sid)return{...f,sections:f.sections.map(s=>s.id!==sid?s:{...s,todos:s.todos.map(t=>t.id===tid?{...t,text:newText}:t)})};
      return{...f,todos:f.todos.map(t=>t.id===tid?{...t,text:newText}:t)};
    }));
  };

  const editSectionName=(fid,sid,newName)=>{
    setFields(prev=>prev.map(f=>f.id!==fid?f:{...f,sections:f.sections.map(s=>s.id===sid?{...s,name:newName}:s)}));
  };

  const addTodo=(text,priority)=>{
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

  const addSection=name=>{
    if(!addingSection)return;
    setFields(prev=>prev.map(f=>f.id!==addingSection?f:{...f,sections:[...f.sections,{id:`sec_${Date.now()}`,name,todos:[]}]}));
    addLog(`エリア追加: ${name}`);
    setAddingSection(null);
  };

  const addField=(name,emoji,color)=>{
    setFields(prev=>[...prev,{id:`fld_${Date.now()}`,name,emoji,color,sections:[],todos:[]}]);
    addLog(`地区追加: ${name}`);
    setAddingField(false);
  };

  const saveFieldEdit=(fid,name,emoji,color)=>{
    setFields(prev=>prev.map(f=>f.id!==fid?f:{...f,name,emoji,color}));
    addLog(`地区編集: ${name}`);
    setEditingField(null);
  };

  const deleteField=fid=>{
    const f=fields.find(f=>f.id===fid);
    setFields(prev=>prev.filter(f=>f.id!==fid));
    addLog(`地区削除: ${f?.name}`);
    setEditingField(null);
  };

  const clearDone=()=>{
    setFields(prev=>prev.map(f=>({...f,todos:f.todos.filter(t=>!t.done),sections:f.sections.map(s=>({...s,todos:s.todos.filter(t=>!t.done)}))})));
    addLog("完了タスクを一括クリア");
    setShowClearDone(false);
  };

  // ドラッグ
  const handleDragStart=(fid,sid,tid)=>{dragInfo.current={fid,sid,tid};};
  const handleDrop=(tFid,tSid,tTid)=>{
    const src=dragInfo.current;
    if(!src||src.tid===tTid)return;
    setFields(prev=>{
      let dragged=null;
      const next=prev.map(f=>{
        if(f.id!==src.fid)return f;
        if(src.sid)return{...f,sections:f.sections.map(s=>{
          if(s.id!==src.sid)return s;
          dragged=s.todos.find(t=>t.id===src.tid);
          return{...s,todos:s.todos.filter(t=>t.id!==src.tid)};
        })};
        dragged=f.todos.find(t=>t.id===src.tid);
        return{...f,todos:f.todos.filter(t=>t.id!==src.tid)};
      });
      if(!dragged)return prev;
      return next.map(f=>{
        if(f.id!==tFid)return f;
        if(tSid)return{...f,sections:f.sections.map(s=>{
          if(s.id!==tSid)return s;
          const idx=s.todos.findIndex(t=>t.id===tTid);
          const a=[...s.todos];a.splice(idx,0,dragged);return{...s,todos:a};
        })};
        const idx=f.todos.findIndex(t=>t.id===tTid);
        const a=[...f.todos];a.splice(idx,0,dragged);return{...f,todos:a};
      });
    });
    dragInfo.current=null;
  };

  // 長押し（地区ヘッダー）
  const handleLongPressStart=(e,field)=>{
    e.preventDefault();
    longPressTimer.current=setTimeout(()=>setEditingField(field),500);
  };
  const handleLongPressEnd=()=>{
    clearTimeout(longPressTimer.current);
  };

  const ft=todos=>showDone?todos:todos.filter(t=>!t.done);
  const totalPending=fields.reduce((a,f)=>a+f.todos.filter(t=>!t.done).length+f.sections.reduce((b,s)=>b+s.todos.filter(t=>!t.done).length,0),0);
  const totalDone=fields.reduce((a,f)=>a+f.todos.filter(t=>t.done).length+f.sections.reduce((b,s)=>b+s.todos.filter(t=>t.done).length,0),0);

  return(
    <div style={{position:"fixed",inset:0,background:"linear-gradient(160deg,#1a2e22 0%,#2d1a0a 100%)",display:"flex",flexDirection:"column",fontFamily:"'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif",overflow:"hidden"}}>
      {/* ヘッダー */}
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px 8px",borderBottom:"1px solid rgba(255,255,255,0.1)",flexShrink:0}}>
        <span style={{fontSize:18}}>🌾</span>
        <EditableText value={appTitle} onSave={setAppTitle}
          style={{fontSize:15,fontWeight:700,color:"#fff",letterSpacing:1}}/>
        <span style={{fontSize:11,background:"#d94040",color:"#fff",borderRadius:10,padding:"1px 8px",fontWeight:700}}>{totalPending}</span>
        <div style={{flex:1}}/>
        {totalDone>0&&(
          <button onClick={()=>setShowClearDone(true)} style={{fontSize:11,color:"rgba(255,255,255,0.6)",background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:7,padding:"4px 10px",cursor:"pointer"}}>
            ✅{totalDone}件クリア
          </button>
        )}
        <button onClick={()=>setShowDone(v=>!v)} style={{fontSize:11,color:showDone?"#fff":"rgba(255,255,255,0.45)",background:showDone?"rgba(255,255,255,0.18)":"transparent",border:"1px solid rgba(255,255,255,0.22)",borderRadius:7,padding:"4px 10px",cursor:"pointer"}}>
          完了{showDone?"▲":"▼"}
        </button>
        <button onClick={()=>setAddingField(true)} style={{fontSize:11,color:"rgba(255,255,255,0.7)",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.22)",borderRadius:7,padding:"4px 10px",cursor:"pointer"}}>
          ＋地区
        </button>
      </div>

      {/* グリッド：2列・overflow hidden・折り返し */}
      <div style={{
        flex:1,overflow:"hidden",
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        gridAutoRows:"min-content",
        alignContent:"start",
        gap:8,padding:8,
      }}>
        {fields.map(field=>{
          const pending=field.todos.filter(t=>!t.done).length+field.sections.reduce((a,s)=>a+s.todos.filter(t=>!t.done).length,0);
          const ftodos=ft(field.todos);
          const hasContent=ftodos.length>0||field.sections.some(s=>ft(s.todos).length>0||true);

          return(
            <div key={field.id} style={{
              background:hexToRgba(field.color,0.12),
              borderRadius:12,border:`1.5px solid ${field.color}66`,
              display:"flex",flexDirection:"column",
              overflow:"hidden",minWidth:0,
              // ← height:fit-content で中身だけの高さに
              height:"fit-content",
            }}>
              {/* 地区ヘッダー（長押しで編集） */}
              <div
                onMouseDown={e=>handleLongPressStart(e,field)}
                onMouseUp={handleLongPressEnd}
                onMouseLeave={handleLongPressEnd}
                onTouchStart={e=>handleLongPressStart(e,field)}
                onTouchEnd={handleLongPressEnd}
                style={{background:`linear-gradient(135deg,${field.color}dd,${field.color}99)`,padding:"8px 10px",display:"flex",alignItems:"center",gap:6,flexShrink:0,cursor:"pointer",userSelect:"none"}}
              >
                <span style={{fontSize:14}}>{field.emoji}</span>
                <EditableText value={field.name} onSave={v=>setFields(prev=>prev.map(f=>f.id===field.id?{...f,name:v}:f))}
                  style={{fontSize:13,fontWeight:700,color:"#fff",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}/>
                {pending>0&&<span style={{fontSize:10,background:"rgba(255,255,255,0.28)",color:"#fff",borderRadius:8,padding:"1px 6px",fontWeight:700,flexShrink:0}}>{pending}</span>}
                <button onClick={e=>{e.stopPropagation();setAddingSection(field.id);}} title="エリア追加" style={iconBtn}>⊕</button>
                <button onClick={e=>{e.stopPropagation();setEditingField(field);}} title="編集・削除" style={{...iconBtn,background:"rgba(255,255,255,0.15)"}}>⋯</button>
              </div>

              {/* コンテンツ */}
              <div style={{padding:"6px 6px 5px"}}>
                {ftodos.length>0&&(
                  <div style={{marginBottom:field.sections.length?5:0}}>
                    {ftodos.map(todo=>(
                      <TodoRow key={todo.id} todo={todo}
                        onToggle={()=>toggleTodo(field.id,null,todo.id)}
                        onDelete={()=>deleteTodo(field.id,null,todo.id)}
                        onEditText={v=>editTodoText(field.id,null,todo.id,v)}
                        onDragStart={()=>handleDragStart(field.id,null,todo.id)}
                        onDragOver={()=>{}}
                        onDrop={()=>handleDrop(field.id,null,todo.id)}
                      />
                    ))}
                  </div>
                )}

                {field.sections.map(section=>{
                  const stodos=ft(section.todos);
                  const sp=section.todos.filter(t=>!t.done).length;
                  return(
                    <div key={section.id} style={{background:hexToRgba(field.color,0.18),borderRadius:8,marginBottom:4,overflow:"hidden",border:`1px solid ${field.color}44`}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,padding:"6px 10px",background:`${field.color}33`}}>
                        <EditableText value={section.name} onSave={v=>editSectionName(field.id,section.id,v)}
                          style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.85)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}/>
                        {sp>0&&<span style={{fontSize:10,background:`${field.color}cc`,color:"#fff",borderRadius:6,padding:"1px 6px",fontWeight:700}}>{sp}</span>}
                        <button onClick={()=>setAddingTodo({fieldId:field.id,sectionId:section.id})} style={{background:"rgba(255,255,255,0.15)",border:"none",color:"rgba(255,255,255,0.8)",fontSize:16,cursor:"pointer",padding:0,width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
                      </div>
                      <div style={{padding:"4px 6px 5px"}}>
                        {stodos.length===0
                          ?<div style={{fontSize:10,color:"rgba(255,255,255,0.25)",padding:"2px 2px"}}>なし ✓</div>
                          :stodos.map(todo=>(
                            <TodoRow key={todo.id} todo={todo}
                              onToggle={()=>toggleTodo(field.id,section.id,todo.id)}
                              onDelete={()=>deleteTodo(field.id,section.id,todo.id)}
                              onEditText={v=>editTodoText(field.id,section.id,todo.id,v)}
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

                <button onClick={()=>setAddingTodo({fieldId:field.id,sectionId:null})} style={{width:"100%",background:"transparent",border:`1.5px dashed ${field.color}66`,borderRadius:8,color:`${field.color}cc`,fontSize:12,padding:"7px 0",cursor:"pointer",marginTop:2,fontWeight:600}}>＋ タスク追加</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ログパネル */}
      <LogPanel logs={logs}/>

      {/* モーダル */}
      {addingTodo    &&<AddTodoModal    target={addingTodo} fields={fields} onAdd={addTodo} onClose={()=>setAddingTodo(null)}/>}
      {addingSection &&<AddSectionModal fieldId={addingSection} fields={fields} onAdd={addSection} onClose={()=>setAddingSection(null)}/>}
      {addingField   &&<AddFieldModal   fields={fields} onAdd={addField} onClose={()=>setAddingField(false)}/>}
      {editingField  &&<FieldEditModal  field={editingField} onSave={(n,e,c)=>saveFieldEdit(editingField.id,n,e,c)} onDelete={()=>deleteField(editingField.id)} onClose={()=>setEditingField(null)}/>}
      {showClearDone &&<ClearDoneModal  count={totalDone} onClear={clearDone} onClose={()=>setShowClearDone(false)}/>}
    </div>
  );
}

/* ── 作業ログパネル ── */
function LogPanel({logs}){
  const [open,setOpen]=useState(false);
  return(
    <>
      <div style={{flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.1)",padding:"6px 14px",display:"flex",alignItems:"center",gap:8,background:"rgba(0,0,0,0.2)"}}>
        <button onClick={()=>setOpen(v=>!v)} style={{fontSize:11,color:"rgba(255,255,255,0.55)",background:"transparent",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,padding:"4px 12px",cursor:"pointer"}}>
          📋 作業ログ {open?"▼":"▲"}
        </button>
        {logs.length>0&&<span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{logs.length}件</span>}
      </div>
      {open&&(
        <div style={{flexShrink:0,maxHeight:"30vh",overflowY:"auto",background:"rgba(0,0,0,0.35)",borderTop:"1px solid rgba(255,255,255,0.08)",padding:"8px 12px"}}>
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

ReactDOM.createRoot(document.getElementById('root')).render(<FarmTodo />)
