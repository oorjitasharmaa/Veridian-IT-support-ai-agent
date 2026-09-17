import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {ShieldCheck,LayoutDashboard,MessageSquareText,ClipboardList,BookOpen,Ticket,Send,ChevronRight,AlertTriangle,CheckCircle2,Clock3,Route,Database} from "lucide-react";
import "./style.css";

const API="http://localhost:8000/api";
type Policy={id:string,title:string,text:string,tags:string[]};
type Request={id:string,employee:string,email:string,date:string,request:string,status:string};
type TicketT={id:string,employee:string,issue:string,status:string};

function Badge({children,tone=""}:{children:React.ReactNode,tone?:string}){return <span className={"badge "+tone}>{children}</span>}
function App(){
 const [page,setPage]=useState("dashboard");
 const [requests,setRequests]=useState<Request[]>([]);
 const [tickets,setTickets]=useState<TicketT[]>([]);
 const [policies,setPolicies]=useState<Policy[]>([]);
 const [chat,setChat]=useState<{role:string,text:string,data?:any}[]>([{role:"assistant",text:"Hi! I’m the Veridian IT Support Agent. I answer only from the approved policy data pack. Ask me about passwords, VPN, software, printers, email quota, guest Wi-Fi, home-office equipment, hardware, or security incidents."}]);
 const [input,setInput]=useState("");
 const [loading,setLoading]=useState(false);
 const [selected,setSelected]=useState<Request|null>(null);
 useEffect(()=>{Promise.all([fetch(API+"/requests"),fetch(API+"/tickets"),fetch(API+"/policies")]).then(async r=>{setRequests(await r[0].json());setTickets(await r[1].json());setPolicies(await r[2].json())}).catch(()=>{})},[]);
 const send=async(msg=input)=>{if(!msg.trim())return;setChat(c=>[...c,{role:"user",text:msg}]);setInput("");setLoading(true);try{const r=await fetch(API+"/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:msg})});const d=await r.json();setChat(c=>[...c,{role:"assistant",text:d.answer,data:d}]);}catch{setChat(c=>[...c,{role:"assistant",text:"Backend is not running. Start FastAPI on port 8000, then refresh."}])}setLoading(false)};
 const active=tickets.filter(t=>!t.status.toLowerCase().includes("closed")).length;
 return <div className="app">
  <aside><div className="brand"><div className="logo"><ShieldCheck size={21}/></div><div><b>VERIDIAN</b><small>AI SUPPORT</small></div></div>
   <nav>
    <button className={page==="dashboard"?"on":""} onClick={()=>setPage("dashboard")}><LayoutDashboard/>Command Center</button>
    <button className={page==="agent"?"on":""} onClick={()=>setPage("agent")}><MessageSquareText/>AI Agent</button>
    <button className={page==="requests"?"on":""} onClick={()=>setPage("requests")}><ClipboardList/>Employee Requests</button>
    <button className={page==="tickets"?"on":""} onClick={()=>setPage("tickets")}><Ticket/>Ticket Queue</button>
    <button className={page==="policies"?"on":""} onClick={()=>setPage("policies")}><BookOpen/>Knowledge Base</button>
   </nav>
   <div className="sidecard"><div className="live"><span></span>Agent online</div><small>Grounded mode · source locked</small></div>
  </aside>
  <main><header><div><span className="eyebrow">INTERNAL SERVICE DESK</span><h1>{page==="dashboard"?"Command Center":page==="agent"?"AI Support Agent":page==="requests"?"Employee Requests":page==="tickets"?"Ticket Queue":"Knowledge Base"}</h1></div><div className="headerpill"><Database size={15}/> Source: Assignment Data Pack</div></header>
   {page==="dashboard"&&<Dashboard requests={requests} tickets={tickets} active={active} onAgent={()=>setPage("agent")} />}
   {page==="agent"&&<Agent chat={chat} input={input} setInput={setInput} send={send} loading={loading}/>}
   {page==="requests"&&<Requests requests={requests} selected={selected} setSelected={setSelected}/>}
   {page==="tickets"&&<Tickets tickets={tickets}/>}
   {page==="policies"&&<Policies policies={policies}/>}
  </main>
 </div>
}

function Dashboard({requests,tickets,active,onAgent}:{requests:Request[],tickets:TicketT[],active:number,onAgent:()=>void}){
 const sec=requests.filter(r=>r.request.toLowerCase().includes("phishing")).length;
 return <div className="page">
  <section className="hero"><div><Badge tone="green">● GROUNDED AGENT</Badge><h2>One workspace for every IT request.</h2><p>Route issues, surface policy-backed answers and keep human escalation visible.</p><button className="primary" onClick={onAgent}>Open AI Agent <ChevronRight size={16}/></button></div><div className="orb"><ShieldCheck size={64}/><div>99.9%<small>policy fidelity target</small></div></div></section>
  <div className="stats"><Stat icon={<ClipboardList/>} n={requests.length} label="Employee requests"/><Stat icon={<Ticket/>} n={active} label="Active tickets"/><Stat icon={<ShieldCheck/>} n={sec} label="Security flags"/><Stat icon={<BookOpen/>} n={10} label="Policy rules"/></div>
  <div className="grid2"><section className="panel"><div className="panelhead"><div><span className="eyebrow">LIVE QUEUE</span><h3>Requests needing attention</h3></div><button className="textbtn" onClick={onAgent}>Ask agent →</button></div>{requests.slice(0,6).map(r=><div className="row" key={r.id}><div className="avatar">{r.employee.split(" ").map(x=>x[0]).join("")}</div><div className="grow"><b>{r.employee}</b><p>{r.request}</p></div><Badge tone={r.status.toLowerCase().includes("security")||r.request.toLowerCase().includes("phishing")?"red":""}>{r.status.split(" ")[0]}</Badge></div>)}</section>
  <section className="panel"><div className="panelhead"><div><span className="eyebrow">AGENT LOGIC</span><h3>How decisions are made</h3></div></div><Step n="01" title="Detect intent" text="Classifies the request using grounded IT intents."/><Step n="02" title="Retrieve policy" text="Finds matching KB rules from the approved source."/><Step n="03" title="Route safely" text="Resolves directly or sends to the responsible human team."/><Step n="04" title="Show evidence" text="Every answer exposes its supporting policy IDs."/></section></div>
 </div>
}
function Stat({icon,n,label}:{icon:any,n:number,label:string}){return <div className="stat"><div className="staticon">{icon}</div><div><strong>{n}</strong><span>{label}</span></div></div>}
function Step({n,title,text}:{n:string,title:string,text:string}){return <div className="step"><div>{n}</div><section><b>{title}</b><p>{text}</p></section></div>}

function Agent({chat,input,setInput,send,loading}:{chat:any[],input:string,setInput:(x:string)=>void,send:(x?:string)=>void,loading:boolean}){
 const prompts=["I’m locked out after 6 password attempts","My VPN credentials expired","I received a phishing email","I work from home 4 days a week — can I get a monitor?","My mailbox is full","Need a non-catalog software install"];
 return <div className="agentpage"><div className="chat"><div className="chathead"><div><span className="eyebrow">GROUNDED CONVERSATION</span><h3>Veridian Support Copilot</h3></div><Badge tone="green">SOURCE LOCKED</Badge></div><div className="messages">{chat.map((m,i)=><div key={i} className={"msg "+m.role}><div className="bubble">{m.text}{m.data&&<div className="evidence"><div className="decision"><span><Route size={14}/> {m.data.action}</span><Badge tone={m.data.risk==="critical"?"red":""}>{m.data.risk}</Badge></div><div className="meta">Intent: <b>{m.data.intent}</b> · Route: <b>{m.data.route}</b></div><div className="sources">{m.data.sources.map((s:any)=><span key={s.id}><BookOpen size={12}/>{s.id} · {s.title}</span>)}</div></div>}</div></div>)}{loading&&<div className="msg assistant"><div className="bubble typing">Retrieving policy…</div></div>}</div><div className="suggestions">{prompts.map(p=><button key={p} onClick={()=>send(p)}>{p}</button>)}</div><div className="composer"><input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask an IT support question…"/><button onClick={()=>send()}><Send size={18}/></button></div></div><aside className="rightinfo"><div className="panel"><span className="eyebrow">AGENT CONTRACT</span><h3>Safe by design</h3><ul><li><CheckCircle2/> Uses only supplied policies</li><li><CheckCircle2/> Shows evidence with each answer</li><li><CheckCircle2/> Human review when data is insufficient</li><li><AlertTriangle/> Security incidents escalate immediately</li></ul></div></aside></div>
}

function Requests({requests,selected,setSelected}:{requests:Request[],selected:Request|null,setSelected:(r:Request|null)=>void}){
 return <div className="page"><div className="panel"><div className="panelhead"><div><span className="eyebrow">15 CASES</span><h3>Employee request triage</h3></div><span className="muted">Select a case to inspect</span></div>{requests.map(r=><div className="requestrow" key={r.id} onClick={()=>setSelected(r)}><div className="reqid">{r.id}</div><div className="grow"><b>{r.employee}</b><p>{r.request}</p></div><Badge>{r.status}</Badge><ChevronRight size={17}/></div>)}</div>{selected&&<RequestDrawer r={selected} close={()=>setSelected(null)}/>}</div>
}
function RequestDrawer({r,close}:{r:Request,close:()=>void}){
 const [data,setData]=useState<any>(null);
 useEffect(()=>{fetch(API+"/triage/"+r.id).then(x=>x.json()).then(setData)},[r.id]);
 return <div className="drawer"><div className="drawerbox"><button className="close" onClick={close}>×</button><span className="eyebrow">{r.id} · TRIAGE</span><h2>{r.employee}</h2><p className="requestquote">“{r.request}”</p>{data?<><div className="decision big"><div><Route size={18}/><b>{data.action}</b><small>{data.route} · {data.intent}</small></div><Badge tone={data.risk==="critical"?"red":""}>{data.risk}</Badge></div><h4>Grounding evidence</h4>{data.sources.map((s:any)=><div className="sourcecard" key={s.id}><b>{s.id} · {s.title}</b><p>{s.text}</p></div>)}</>:<p>Running grounded triage…</p>}</div></div>
}
function Tickets({tickets}:{tickets:TicketT[]}){return <div className="page"><div className="panel"><div className="panelhead"><div><span className="eyebrow">SYSTEM RECORD</span><h3>Existing ticket queue</h3></div><span className="muted">Active cases remain actionable</span></div>{tickets.map(t=><div className="requestrow" key={t.id}><div className="reqid">{t.id}</div><div className="grow"><b>{t.employee}</b><p>{t.issue}</p></div><Badge tone={t.status.toLowerCase().includes("closed")?"green":""}>{t.status}</Badge></div>)}</div></div>}
function Policies({policies}:{policies:Policy[]}){return <div className="page"><div className="policygrid">{policies.map(p=><div className="policy"><div className="policyid">{p.id}</div><h3>{p.title}</h3><p>{p.text}</p><div className="tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div></div>)}</div></div>}
createRoot(document.getElementById("root")!).render(<App/>);
