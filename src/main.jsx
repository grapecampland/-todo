import React from 'react'
import ReactDOM from 'react-dom/client'
import { useState, useEffect } from "react";

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

function Modal({ onClose, children }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#1c2a20",borderRadius:"18px 18px 0 0",padding:"20px 18px 40px",width:"100%",maxWidth:480,border:"1px solid rgba(255,255,255,0.12)"}}>{children}</div>
    </div>
  );
}

function AddTodoModal({ target, fields, onAdd, onClose }) {
  const [text, setText] = useState("");
  const [pri, setPri] = useState("mid");
  const field = fields.find(f=>f.id===target.fieldId);
  const section = target.sectionId ? field?.sections.find(s=>s.id===target.sectionId) : null;
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginBottom:4}}>{field?.emoji} {field?.name}{section?` › ${section.name}`:""}</div>
      <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:14}}>タスクを追加</div>
      <input autoFocus value={text} onChange={e=>setText(e.target.value)} placeholder="例：誘引、棚修理..." onKeyDown={e=>{if(e.key==="Enter"&&text.trim())onAdd(text.trim(),pri);if(e.key==="Escape")onClose();}} style={inputStyle}/>
      <div style={{display:"flex",gap:8,margin:"12px 0 16px"}}>
        {["high","mid","low"].map(p=>(
          <button key={p} onClick={()=>setPri(p)} style={{flex:1,padding:"7px 0",borderRadius:8,fontWeight:700,fontSize:13,cursor:"pointer",color:pri===p?"#fff":P[p].color,background:pri===p?P[p].color:"rgba(255,255,255,0.06)",border:`1.5px solid ${P[p].color}`}}>{P[p].label}</button>
        ))}
      </div>
      <button onClick={()=>{if(text.trim())onAdd(text.trim(),pri);}} style={submitBtn(field?.color)}>追加する</button>
    </Modal>
  );
}

function AddSectionModal({ fieldId, fields, onAdd, onClose }) {
  const [name, setName] = useState("");
  const field = fields.find(f=>f.id===fieldId);
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:14}}>{field?.emoji} {field?.name} › エリア追加</div>
      <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例：ガラス温室、圃場２..." onKeyDown={e=>{if(e.key==="Enter"&&name.trim())onAdd(name.trim());if(e.key==="Escape")onClose();}} style={inputStyle}/>
      <button onClick={()=>{if(name.trim())onAdd(name.trim());}} style={{...submitBtn(field?.color),marginTop:16}}>追加する</button>
    </Modal>
  );
}

function AddFieldModal({ fields, onAdd, onClose }) {
  const [name, setName] = useState("");
  const next = COLOR_PALETTE[fields.length % COLOR_PALETTE.length];
  const [emoji, setEmoji] = useState(next.emoji);
  const [color, setColor] = useState(next.color);
  const EMOJIS = ["🌿","🍇","🌊","🌸","🌾","🍃","🍂","🫐","🌻","🍋","🌴","⛰️"];
  return (
    <Modal onClose={onClose}>
      <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:14}}>🗾 新しい地区を追加</div>
      <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="例：横井上、吉尾..." onKeyDown={e=>{if(e.key==="Enter"&&name.trim())onAdd(name.trim(),emoji,color);if(e.key==="Escape")onClose();}} style={inputStyle}/>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",margin:"14px 0 6px"}}>アイコン</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
        {EMOJIS.map(e=>(<button key={e} onClick={()=>setEmoji(e)} style={{width:36,height:36,borderRadius:9,fontSize:17,cursor:"pointer",background:emoji===e?"rgba(255,255,255,0.25)":"rgba(255,255,255,0.07)",border:emoji===e?"2px solid rgba(255,255,255,0.6)":"1.5px solid rgba(255,255,255,0.1)"}}>{e}</button>))}
      </div>
      <div style={{fontSize:11,color:"rgba(255,255,255,0.45)",marginBottom:6}}>カラー</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        {COLOR_PALETTE.map(cp=>(<button key={cp.color} onClick={()=>setColor(cp.color)} style={{width:30,height:30,borderRadius:"50%",background:cp.color,cursor:"pointer",padding:0,border:color===cp.color?"3px solid #fff":"2px solid transparent",boxShadow:color===cp.color?`0 0 0 2px ${cp.color}`:"none"}}/>))}
        <label style={{position:"relative",width:30,height:30,cursor:"pointer"}}>
          <div style={{width:30,height:30,borderRadius:"50%",background:"conic-gradient(red,yellow,lime,cyan,blue,magenta,red)",border:"2px solid rgba(255,255,255,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🎨</div>
          <input type="color" value={color} onChange={e=>setColor(e.target.value)} style={{position:"absolute",inset:0,opacity:0,cursor:"pointer",width:"100%",height:"100%"}}/>
        </label>
      </div>
      <div style={{background:`linear-gradient(135deg,${color}cc,${color}88)`,borderRadius:9,padding:"7px 12px",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:16}}>{emoji}</span>
        <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{name||"地区名"}</span>
      </div>
      <button onClick={()=>{if(name.trim())onAdd(name.trim(),emoji,color);}} style={{...submitBtn(color),opacity:name.trim()?1:0.5}}>地区を追加する</button>
    </Modal>
  );
}

function TodoRow({ todo, onToggle, onDelete }) {
  const p = P[todo.priority]||P.low;
  return (
    <div style={{display:"flex",alignItems:"flex-start",gap:5,padding:"3px 3px",borderRadius:5,background:todo.done?"transparent":"rgba(255,255,255,0.07)",marginBottom:2,opacity:todo.done?0.38:1,transition:"opacity 0.15s"}}>
      <button onClick={onToggle} style={{width:13,height:13,borderRadius:"50%",flexShrink:0,marginTop:1,border:`1.5px solid ${todo.done?"rgba(255,255,255,0.25)":p.color}`,background:todo.done?"rgba(255,255,255,0.25)":"transparent",cursor:"pointer",padding:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {todo.done&&<span style={{fontSize:8,color:"#fff",fontWeight:700,lineHeight:1}}>✓</span>}
      </button>
      <span style={{flex:1,fontSize:11,color:"rgba(255,255,255,0.88)",textDecoration:todo.done?"line-through":"none",lineHeight:1.35,wordBreak:"break-all"}}>{todo.text}</span>
      <span style={{fontSize:9,fontWeight:700,color:p.color,flexShrink:0,paddingTop:1}}>{p.label}</span>
      <button onClick={onDelete} style={{background:"none",border:"none",color:"rgba(255,255,255,0.18)",fontSize:12,cursor:"pointer",padding:0,lineHeight:1,flexShrink:0,paddingTop:1}}>×</button>
    </div>
  );
}

const inputStyle = {width:"100%",boxSizing:"border-box",border:"1.5px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"10px 12px",fontSize:14,background:"rgba(255,255,255,0.08)",color:"#fff",fontFamily:"'Noto Sans JP',sans-serif",outline:"none"};
const submitBtn = color => ({width:"100%",padding:"12px",borderRadius:10,border:"none",background:color||"#4a7c59",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer"});
const iconBtn = {background:"rgba(255,255,255,0.18)",border:"none",color:"rgba(255,255,255,0.85)",fontSize:11,borderRadius:5,width:17,height:17,cursor:"pointer",padding:0,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"};

function FarmTodo() {
  const [fields, setFields] = useState(()=>{try{const s=localStorage.getItem("farmtodo_v5");return s?JSON.parse(s):initialData;}catch{return initialData;}});
  const [addingTodo, setAddingTodo] = useState(null);
  const [addingSection, setAddingSection] = useState(null);
  const [addingField, setAddingField] = useState(false);
  const [showDone, setShowDone] = useState(false);

  useEffect(()=>{try{localStorage.setItem("farmtodo_v5",JSON.stringify(fields));}catch{}},[fields]);

  const toggleTodo = (fid,sid,tid) => setFields(prev=>prev.map(f=>{if(f.id!==fid)return f;if(sid)return{...f,sections:f.sections.map(s=>s.id!==sid?s:{...s,todos:s.todos.map(t=>t.id===tid?{...t,done:!t.done}:t)})};return{...f,todos:f.todos.map(t=>t.id===tid?{...t,done:!t.done}:t)};}));
  const deleteTodo = (fid,sid,tid) => setFields(prev=>prev.map(f=>{if(f.id!==fid)return f;if(sid)return{...f,sections:f.sections.map(s=>s.id!==sid?s:{...s,todos:s.todos.filter(t=>t.id!==tid)})};return{...f,todos:f.todos.filter(t=>t.id!==tid)};}));

  const addTodo = (text,priority) => {
    if(!addingTodo)return;
    const{fieldId:fid,sectionId:sid}=addingTodo;
    const nid=Date.now();
    setFields(prev=>prev.map(f=>{if(f.id!==fid)return f;if(sid)return{...f,sections:f.sections.map(s=>s.id!==sid?s:{...s,todos:[...s.todos,{id:nid,text,done:false,priority}]})};return{...f,todos:[...f.todos,{id:nid,text,done:false,priority}]};}));
    setAddingTodo(null);
  };

  const addSection = name => {
    if(!addingSection)return;
    setFields(prev=>prev.map(f=>f.id!==addingSection?f:{...f,sections:[...f.sections,{id:`sec_${Date.now()}`,name,todos:[]}]}));
    setAddingSection(null);
  };

  const addField = (name,emoji,color) => {
    setFields(prev=>[...prev,{id:`fld_${Date.now()}`,name,emoji,color,sections:[],todos:[]}]);
    setAddingField(false);
  };

  const deleteField = fid => {
    if(!window.confirm("この地区を削除しますか？"))return;
    setFields(prev=>prev.filter(f=>f.id!==fid));
  };

  const ft = todos => showDone?todos:todos.filter(t=>!t.done);
  const totalPending = fields.reduce((a,f)=>a+f.todos.filter(t=>!t.done).length+f.sections.reduce((b,s)=>b+s.todos.filter(t=>!t.done).length,0),0);

  return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(160deg,#1a2e22 0%,#2d1a0a 100%)",display:"flex",flexDirection:"column",fontFamily:"'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif",overflow:"hidden"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 14px 7px",borderBottom:"1px solid rgba(255,255,255,0.1)",flexShrink:0}}>
        <span style={{fontSize:16}}>🌾</span>
        <span style={{fontSize:14,fontWeight:700,color:"#fff",letterSpacing:1}}>圃場 ToDo</span>
        <span style={{fontSize:10,background:"#d94040",color:"#fff",borderRadius:10,padding:"1px 7px",fontWeight:700}}>{totalPending}</span>
        <div style={{flex:1}}/>
        <button onClick={()=>setShowDone(v=>!v)} style={{fontSize:10,color:showDone?"#fff":"rgba(255,255,255,0.45)",background:showDone?"rgba(255,255,255,0.18)":"transparent",border:"1px solid rgba(255,255,255,0.22)",borderRadius:6,padding:"3px 8px",cursor:"pointer"}}>完了{showDone?"▲":"▼"}</button>
        <button onClick={()=>setAddingField(true)} style={{fontSize:10,color:"rgba(255,255,255,0.7)",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.22)",borderRadius:6,padding:"3px 8px",cursor:"pointer"}}>＋ 地区</button>
      </div>
      <div style={{flex:1,overflow:"hidden",display:"grid",gridTemplateColumns:"1fr 1fr",gridAutoRows:"min-content",alignContent:"start",gap:6,padding:8}}>
        {fields.map(field=>{
          const pending=field.todos.filter(t=>!t.done).length+field.sections.reduce((a,s)=>a+s.todos.filter(t=>!t.done).length,0);
          const ftodos=ft(field.todos);
          return (
            <div key={field.id} style={{background:"rgba(255,255,255,0.06)",borderRadius:12,border:`1.5px solid ${field.color}55`,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
              <div style={{background:`linear-gradient(135deg,${field.color}cc,${field.color}88)`,padding:"5px 8px",display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                <span style={{fontSize:12}}>{field.emoji}</span>
                <span style={{fontSize:12,fontWeight:700,color:"#fff",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{field.name}</span>
                {pending>0&&<span style={{fontSize:9,background:"rgba(255,255,255,0.28)",color:"#fff",borderRadius:7,padding:"1px 5px",fontWeight:700,flexShrink:0}}>{pending}</span>}
                <button onClick={()=>setAddingSection(field.id)} title="エリア追加" style={iconBtn}>⊕</button>
                <button onClick={()=>deleteField(field.id)} title="地区を削除" style={{...iconBtn,color:"rgba(255,160,160,0.8)"}}>✕</button>
              </div>
              <div style={{padding:"5px 5px 4px"}}>
                {ftodos.length>0&&<div style={{marginBottom:ftodos.length&&field.sections.length?4:0}}>{ftodos.map(todo=>(<TodoRow key={todo.id} todo={todo} onToggle={()=>toggleTodo(field.id,null,todo.id)} onDelete={()=>deleteTodo(field.id,null,todo.id)}/>))}</div>}
                {field.sections.map(section=>{
                  const stodos=ft(section.todos);
                  const sp=section.todos.filter(t=>!t.done).length;
                  return (
                    <div key={section.id} style={{background:"rgba(255,255,255,0.05)",borderRadius:7,marginBottom:3,overflow:"hidden",border:"1px solid rgba(255,255,255,0.09)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4,padding:"3px 7px",background:"rgba(255,255,255,0.06)"}}>
                        <span style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.65)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{section.name}</span>
                        {sp>0&&<span style={{fontSize:9,background:`${field.color}99`,color:"#fff",borderRadius:5,padding:"0 4px",fontWeight:700}}>{sp}</span>}
                        <button onClick={()=>setAddingTodo({fieldId:field.id,sectionId:section.id})} style={{background:"none",border:"none",color:"rgba(255,255,255,0.35)",fontSize:13,cursor:"pointer",padding:"0 1px",lineHeight:1}}>+</button>
                      </div>
                      <div style={{padding:"2px 5px 3px"}}>
                        {stodos.length===0?<div style={{fontSize:9,color:"rgba(255,255,255,0.2)",padding:"1px 0"}}>なし ✓</div>:stodos.map(todo=>(<TodoRow key={todo.id} todo={todo} onToggle={()=>toggleTodo(field.id,section.id,todo.id)} onDelete={()=>deleteTodo(field.id,section.id,todo.id)}/>))}
                      </div>
                    </div>
                  );
                })}
                <button onClick={()=>setAddingTodo({fieldId:field.id,sectionId:null})} style={{width:"100%",background:"transparent",border:`1px dashed ${field.color}55`,borderRadius:6,color:`${field.color}bb`,fontSize:10,padding:"4px 0",cursor:"pointer",marginTop:2}}>＋ タスク追加</button>
              </div>
            </div>
          );
        })}
      </div>
      {addingTodo&&<AddTodoModal target={addingTodo} fields={fields} onAdd={addTodo} onClose={()=>setAddingTodo(null)}/>}
      {addingSection&&<AddSectionModal fieldId={addingSection} fields={fields} onAdd={addSection} onClose={()=>setAddingSection(null)}/>}
      {addingField&&<AddFieldModal fields={fields} onAdd={addField} onClose={()=>setAddingField(false)}/>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<FarmTodo />)
