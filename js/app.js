"use strict";
/* OmniLingua AI v2: multi-provider, agentic, voice, RAG, OCR/PDF, PWA */
const $=id=>document.getElementById(id),sleep=ms=>new Promise(r=>setTimeout(r,ms));
const LS={g(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch{return d}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}},r(k){try{localStorage.removeItem(k)}catch{}}};
const toast=m=>{const t=document.createElement("div");t.className="toast";t.textContent=m;document.body.append(t);setTimeout(()=>t.remove(),2600)};
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;");

/* ---------- languages: [name, speechCode, tesseractCode] ---------- */
const L=[["English","en-US","eng"],["Hindi","hi-IN","hin"],["Telugu","te-IN","tel"],["Tamil","ta-IN","tam"],["Kannada","kn-IN","kan"],["Malayalam","ml-IN","mal"],["Bengali","bn-IN","ben"],["Marathi","mr-IN","mar"],["Gujarati","gu-IN","guj"],["Urdu","ur-PK","urd"],["Spanish","es-ES","spa"],["French","fr-FR","fra"],["German","de-DE","deu"],["Italian","it-IT","ita"],["Portuguese","pt-BR","por"],["Dutch","nl-NL","nld"],["Russian","ru-RU","rus"],["Turkish","tr-TR","tur"],["Arabic","ar-SA","ara"],["Japanese","ja-JP","jpn"],["Korean","ko-KR","kor"],["Chinese","zh-CN","chi_sim"],["Thai","th-TH","tha"],["Vietnamese","vi-VN","vie"],["Indonesian","id-ID","ind"]];
const SC=n=>(L.find(x=>x[0]===n)||L[0])[1];
L.forEach(l=>{$("src").add(new Option(l[0],l[0]));$("tgt").add(new Option(l[0],l[0]))});$("tgt").value="Hindi";
$("ocrLang").add(new Option("OCR: Auto (Eng+Hin+Tel)","eng+hin+tel"));L.forEach(l=>$("ocrLang").add(new Option("OCR: "+l[0],l[2])));
["Hindi","Telugu","Spanish","French","German","Japanese","Arabic","Tamil"].forEach(n=>{const c=document.createElement("span");c.className="chip";c.textContent=n;c.onclick=()=>c.classList.toggle("on");$("chips").append(c)});

/* ---------- settings / themes ---------- */
const S={temp:.3,stream:true,auto:false,theme:"cyber",mode:"agentic",...LS.g("ol_s",{})};const saveS=()=>LS.s("ol_s",S);
const TH={cyber:["#00f0ff","#b026ff"],matrix:["#2dff9a","#00b3ff"],solar:["#ffb020","#ff2d95"],ice:["#7cc4ff","#d6e8ff"]};let ACC="#00f0ff";
function setTheme(n){S.theme=n;const[a,b]=TH[n];ACC=a;const r=document.documentElement.style;r.setProperty("--c",a);r.setProperty("--p",b);saveS()}
Object.entries(TH).forEach(([n,[a,b]])=>{const d=document.createElement("button");d.className="dot";d.title=n;d.style.background=`linear-gradient(135deg,${a},${b})`;d.onclick=()=>setTheme(n);$("dots").append(d)});setTheme(S.theme);
function setMode(m){S.mode=m;saveS();document.querySelectorAll("#modes button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));$("go").textContent={fast:"⚡ Translate (Fast)",agentic:"⚡ Translate (Agentic)",deep:"⚡ Translate (Deep verify)"}[m]}
document.querySelectorAll("#modes button").forEach(b=>b.onclick=()=>setMode(b.dataset.m));setMode(S.mode);
$("temp").value=S.temp;$("tv").textContent=S.temp;$("stream").checked=S.stream;$("autoTr").checked=S.auto;
$("temp").oninput=e=>{S.temp=+e.target.value;$("tv").textContent=S.temp;saveS()};$("stream").onchange=e=>{S.stream=e.target.checked;saveS()};$("autoTr").onchange=e=>{S.auto=e.target.checked;saveS()};

/* ---------- animated neural background ---------- */
(function(){if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;const c=$("bg"),x=c.getContext("2d");let W,H,P;
 const rs=()=>{W=c.width=innerWidth;H=c.height=innerHeight;P=Array.from({length:Math.min(70,W/16|0)},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35}))};rs();addEventListener("resize",rs);
 (function f(){x.clearRect(0,0,W,H);for(const p of P){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1}
  for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const d=Math.hypot(P[i].x-P[j].x,P[i].y-P[j].y);if(d<120){x.globalAlpha=(1-d/120)*.5;x.strokeStyle=ACC;x.beginPath();x.moveTo(P[i].x,P[i].y);x.lineTo(P[j].x,P[j].y);x.stroke()}}
  x.globalAlpha=.9;x.fillStyle=ACC;P.forEach(p=>{x.fillRect(p.x-1,p.y-1,2,2)});requestAnimationFrame(f)})()})();

/* ---------- providers & key auto-detect ---------- */
const PROV={
 groq:{name:"Groq",base:"https://api.groq.com/openai/v1",rpm:30,json:true,pref:["openai/gpt-oss-120b","llama-3.3-70b-versatile","openai/gpt-oss-20b","moonshotai/kimi-k2-instruct-0905","meta-llama/llama-4-scout-17b-16e-instruct","qwen/qwen3-32b","llama-3.1-8b-instant"]},
 openai:{name:"OpenAI",base:"https://api.openai.com/v1",rpm:60,json:true,pref:["gpt-4o-mini","gpt-4.1-mini","gpt-4o"]},
 gemini:{name:"Gemini",base:"https://generativelanguage.googleapis.com/v1beta/openai",rpm:15,json:true,pref:["gemini-2.5-flash","gemini-2.5-flash-lite","gemini-2.0-flash","gemini-1.5-flash"]},
 openrouter:{name:"OpenRouter",base:"https://openrouter.ai/api/v1",rpm:20,json:false,pref:["meta-llama/llama-3.3-70b-instruct:free","google/gemini-2.0-flash-exp:free"]},
 xai:{name:"xAI",base:"https://api.x.ai/v1",rpm:60,json:false,pref:["grok-3-mini","grok-2-latest"]},
 anthropic:{name:"Anthropic",base:"https://api.anthropic.com/v1",rpm:50,json:false,pref:["claude-sonnet-5-5","claude-haiku-5-5","claude-sonnet-4-5","claude-haiku-4-5","claude-3-5-haiku-latest"]}};
const detect=OLLib.detect;
let KEY="",P=null,MODELS=[];
const badge=(c,t)=>{$("prov").className="badge "+c;$("prov").textContent=t};
const hdrs=()=>P==="anthropic"?{"x-api-key":KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"}:{Authorization:"Bearer "+KEY,...(P==="openrouter"?{"X-Title":"OmniLingua AI"}:{})};
async function listModels(){
 const r=await fetch(PROV[P].base+"/models"+(P==="anthropic"?"?limit=100":""),{headers:hdrs()});if(!r.ok)throw new Error(r.status==401||r.status==403?"invalid key":"HTTP "+r.status);
 const j=await r.json();let ids=(j.data||j.models||[]).map(m=>(m.id||m.name||"").replace(/^models\//,""));
 const bad=/whisper|guard|tts|audio|realtime|embed|image|transcribe|moderation|search|vision-preview|dall|imagen|aqa|veo|learnlm|robotics|computer-use|instruct-0|davinci|babbage|playai|orpheus/i;
 ids=ids.filter(i=>i&&!bad.test(i));
 if(P==="openai")ids=ids.filter(i=>/^(gpt|o\d|chatgpt)/.test(i));if(P==="gemini")ids=ids.filter(i=>/gemini|gemma/.test(i));if(P==="xai")ids=ids.filter(i=>/grok/.test(i));
 if(P==="openrouter")ids=[...ids.filter(i=>i.endsWith(":free")),...ids.filter(i=>!i.endsWith(":free"))].slice(0,80);
 return ids}
const rank=(id,pref)=>{const i=pref.indexOf(id);if(i>=0)return i;if(/allam|orpheus|safeguard|guard|\b[1-7]b\b|[-_][1-7]b[-_]/i.test(id))return 900;if(/compound/.test(id))return 200;return 100};
async function connect(){
 if(!KEY){badge("bad","No API key");$("model").innerHTML="";return}
 P=detect(KEY);if(!P){badge("bad","Unknown key format");return}
 badge("wait",PROV[P].name+" · connecting…");let ok=true;
 try{MODELS=await listModels()}catch(e){ok=false;MODELS=[];badge("bad",PROV[P].name+" · "+e.message)}
 const pref=PROV[P].pref;if(!MODELS.length)MODELS=[...pref];
 MODELS.sort((a,b)=>rank(a,pref)-rank(b,pref));
 const keep=LS.g("ol_m_"+P,null);$("model").innerHTML="";MODELS.forEach(m=>$("model").add(new Option(m,m)));$("model").value=MODELS.includes(keep)?keep:MODELS[0];
 if(ok)badge("ok","● "+PROV[P].name+" · "+MODELS.length+" models")}
$("model").onchange=()=>LS.s("ol_m_"+P,$("model").value);

/* encrypted key storage (AES-GCM, per-browser key) */
const te=new TextEncoder(),td=new TextDecoder(),b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))),ub=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
async function ck(){let r=LS.g("ol_k",null);if(!r){const k=await crypto.subtle.generateKey({name:"AES-GCM",length:256},true,["encrypt","decrypt"]);r=b64(await crypto.subtle.exportKey("raw",k));LS.s("ol_k",r)}return crypto.subtle.importKey("raw",ub(r),"AES-GCM",false,["encrypt","decrypt"])}
async function saveKey(v){const iv=crypto.getRandomValues(new Uint8Array(12));LS.s("ol_v",b64(iv)+"."+b64(await crypto.subtle.encrypt({name:"AES-GCM",iv},await ck(),te.encode(v))));KEY=v}
async function loadKey(){try{const s=LS.g("ol_v",null);if(s){const[i,c]=s.split(".");KEY=td.decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:ub(i)},await ck(),ub(c)))}}catch{}await connect()}
const openSet=()=>$("modal").style.display="flex";
$("ki").oninput=e=>{const p=detect(e.target.value.trim());$("kdet").textContent=p?"✅ Detected: "+PROV[p].name+" (model list will auto-load)":(e.target.value?"❓ Unknown key format":"Supported: Groq · OpenAI · Anthropic · Gemini · OpenRouter · xAI")};
$("ksave").onclick=async()=>{const v=$("ki").value.trim();if(!v)return;if(!detect(v)){toast("Unknown key format");return}await saveKey(v);$("ki").value="";$("modal").style.display="none";await connect();toast("Connected to "+PROV[P].name)};
$("kclr").onclick=()=>{LS.r("ol_v");KEY="";P=null;connect();toast("Key removed")};
$("bSet").onclick=openSet;$("wipe").onclick=()=>{if(confirm("Delete key, history, TM and settings?")){localStorage.clear();location.reload()}};

/* ---------- LLM client: rate-limit buckets, retries, streaming, all providers ---------- */
const buckets={};let lastStat=null;
async function take(){const rpm=PROV[P].rpm,b=buckets[P]||(buckets[P]={t:rpm,l:Date.now()});for(;;){const n=Date.now();b.t=Math.min(rpm,b.t+(n-b.l)*rpm/6e4);b.l=n;if(b.t>=1){b.t--;$("stat").textContent=`${PROV[P].name} · ${Math.floor(b.t)}/${rpm} req budget`+(lastStat?` · ${lastStat.ms}ms · ~${lastStat.tok} tok · ${lastStat.model}`:"");return}await sleep(400)}}
async function llm(messages,o={},model=null,retry=0){
 if(!KEY||!P){openSet();throw new Error("Add an API key in ⚙ Settings")}
 await take();model=model||$("model").value;const t0=performance.now(),stream=!!(o.stream&&S.stream),temp=o.temp??S.temp;let url,body,h;
 if(P==="anthropic"){const sys=messages.filter(m=>m.role==="system").map(m=>m.content).join("\n");url=PROV.anthropic.base+"/messages";h={...hdrs(),"content-type":"application/json"};body={model,max_tokens:4096,temperature:Math.min(1,temp),messages:messages.filter(m=>m.role!=="system"),stream};if(sys)body.system=sys}
 else{url=PROV[P].base+"/chat/completions";h={...hdrs(),"Content-Type":"application/json"};body={model,messages,temperature:temp,stream};if(o.json&&PROV[P].json)body.response_format={type:"json_object"};if(P==="groq"&&/^openai\/gpt-oss/.test(model))body.reasoning_effort="low"}
 let r;try{r=await fetch(url,{method:"POST",headers:h,body:JSON.stringify(body)})}catch(e){throw new Error("Network/CORS error talking to "+PROV[P].name)}
 if((r.status==429||r.status>=500)&&retry<2){await sleep(1500*(retry+1));const alt=PROV[P].pref.find(m=>m!==model&&MODELS.includes(m))||model;return llm(messages,o,retry?alt:model,retry+1)}
 if(!r.ok){const tx=await r.text();if(r.status===400&&/context_length|reduce the length|too long/i.test(tx)&&retry<2){const pf=PROV[P].pref,alt=MODELS.filter(m=>m!==model&&rank(m,pf)<900).sort((a,b)=>rank(a,pf)-rank(b,pf))[0];if(alt){toast("Text too long for "+model+" → switching to "+alt);$("model").value=alt;return llm(messages,o,alt,retry+1)}}throw new Error(PROV[P].name+" "+r.status+": "+tx.slice(0,200))}
 let full="";
 if(!stream){const j=await r.json();full=P==="anthropic"?(j.content||[]).map(c=>c.text||"").join(""):(j.choices?.[0]?.message?.content||"")}
 else{const rd=r.body.getReader();let buf="";for(;;){const{done,value}=await rd.read();if(done)break;buf+=td.decode(value,{stream:true});const ls=buf.split("\n");buf=ls.pop();
  for(const l of ls){if(!l.startsWith("data:")||l.includes("[DONE]"))continue;try{const j=JSON.parse(l.slice(5));full+=P==="anthropic"?(j.type==="content_block_delta"?j.delta?.text||"":""):(j.choices?.[0]?.delta?.content||"")}catch{}}o.onTok&&o.onTok(full.replace(/<think>[\s\S]*?(<\/think>|$)/g,"").trim())}}
 full=full.replace(/<think>[\s\S]*?<\/think>/g,"").trim();lastStat={ms:Math.round(performance.now()-t0),tok:Math.round(full.length/4),model};return full}
const J=s=>{const m=(s||"").match(/\{[\s\S]*\}/);try{return JSON.parse(m?m[0]:s)}catch{return{}}};

/* ---------- RAG translation memory: hashed n-gram vectors ---------- */
const DIM=256;let TM=LS.g("ol_tm",[]).map(t=>({t,v:vec(t)}));
function vec(t){const v=new Float32Array(DIM);const w=t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu," ").split(/\s+/).filter(Boolean);const add=s=>{let h=5381;for(const c of s)h=((h<<5)+h+c.charCodeAt(0))>>>0;v[h%DIM]++};w.forEach(x=>{add(x);for(let i=0;i<x.length-2;i++)add(x.slice(i,i+3))});const n=Math.hypot(...v)||1;return v.map(x=>x/n)}
const cos=(a,b)=>{let s=0;for(let i=0;i<DIM;i++)s+=a[i]*b[i];return s};
const tmUpd=()=>{LS.s("ol_tm",TM.map(e=>e.t).slice(-2000));$("gls").textContent=TM.length?`✅ ${TM.length} TM entries`:"No glossary loaded"};tmUpd();
function parseTM(n,txt){let e=[];try{if(n.endsWith(".json")){const j=JSON.parse(txt);const a=Array.isArray(j)?j:Object.entries(j).map(([k,v])=>({source:k,target:v}));e=a.map(x=>typeof x=="string"?x:(x.source||x.src||x.term)+" => "+(x.target||x.tgt||x.translation))}
 else if(/\.(tmx|xml)$/.test(n)){new DOMParser().parseFromString(txt,"text/xml").querySelectorAll("tu").forEach(tu=>{const s=[...tu.querySelectorAll("seg")].map(x=>x.textContent);if(s.length>1)e.push(s[0]+" => "+s[1])})}
 else e=txt.split(/\r?\n+/).map(x=>x.trim().replace(/\s*(,|;|\t|=+>?)\s*/," => ")).filter(Boolean)}catch{toast("Could not parse file")}return e.filter(Boolean)}
const addTM=a=>{a.forEach(t=>TM.push({t,v:vec(t)}));tmUpd()};
$("gl").onchange=async e=>{const f=e.target.files[0];if(!f)return;addTM(parseTM(f.name.toLowerCase(),await f.text()));toast("Glossary indexed")};
$("qtb").onclick=()=>{const v=$("qt").value.trim();if(!v.includes("=>"))return toast("Use: source => target");addTM([v]);$("qt").value="";toast("Term added")};
const retrieve=q=>{if(!TM.length)return"";const qv=vec(q);return TM.map(e=>({e,s:cos(qv,e.v)})).sort((a,b)=>b.s-a.s).slice(0,6).filter(x=>x.s>.12).map(x=>"- "+x.e.t).join("\n")};
const dl=(n,txt,type="text/plain")=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=n;a.click()};
const tmPairs=()=>TM.map(e=>e.t.split(" => "));
$("tmExp").onclick=$("tmJ").onclick=()=>dl("translation-memory.json",JSON.stringify(tmPairs().map(([s,t])=>({source:s,target:t})),null,2),"application/json");
$("tmX").onclick=()=>dl("translation-memory.tmx",`<?xml version="1.0"?><tmx version="1.4"><header srclang="*all*" datatype="plaintext"/><body>${tmPairs().map(([s,t])=>`<tu><tuv xml:lang="src"><seg>${esc(s)}</seg></tuv><tuv xml:lang="tgt"><seg>${esc(t||"")}</seg></tuv></tu>`).join("")}</body></tmx>`,"application/xml");

/* ---------- agentic pipeline ---------- */
const PIPS=["Analyze","Draft","Critique","Refine","Verify"];$("pips").innerHTML=PIPS.map(p=>`<div class="pip">${p}</div>`).join("");
const setPips=(a,done=[])=>[...$("pips").children].forEach((e,i)=>e.className="pip"+(i===a?" act":done.includes(i)||i<a?" done":""));
const step=(i,t)=>{setPips(i);$("steps").textContent=`${i+1}/${PIPS.length} ${t}`};
let last={src:"",out:"",from:"",to:"",dom:"",conf:null,id:null};
const chunk=OLLib.chunk;
function ctxStr(an,text){const c=ctxBase(an,text);return c+(/\[\[P\d+\]\]/.test(text)?" Keep placeholders like [[P1]] exactly unchanged in the output.":"")+(S.custom?`\nCustom instructions from the user: ${S.custom}`:"")}
function ctxBase(an,text){const mem=retrieve(text);const tone=$("tone").value,dm=$("domainSel").value;
 return `Domain: ${dm!=="auto"?dm:an.domain||"General"}; register: ${tone!=="auto"?tone:an.register||"neutral"}.`+(an.strategy?` Strategy: ${an.strategy}.`:"")+(an.idioms?.length?` Translate these idioms by meaning: ${JSON.stringify(an.idioms)}.`:"")+(/-->/.test(text)?" This is subtitle text: keep numbering and timestamps unchanged, translate only the dialogue.":"")+(mem?`\nMANDATORY terminology (translation memory):\n${mem}`:""),mem}
async function quick(text,to){const pii=$("pii")?.checked?OLLib.maskPII(text):null,t=pii?pii.text:text;const r=await llm([{role:"system",content:`You are an expert translator. Translate into ${to}. Output only the translation. ${ctxStr({},t)}`},{role:"user",content:t}]);return pii?OLLib.unmaskPII(r,pii):r}
let forceFast=false;
async function translate(){
 const raw=$("in").value.trim();if(!raw||$("go").disabled)return;const pii=$("pii")?.checked?OLLib.maskPII(raw):null,text=pii?pii.text:raw;const to=$("tgt").value,from=$("src").value;let mode=S.mode;
 const small=/allam|\b[1-8]b\b|[-_][1-8]b[-_]|gemma/i.test($("model").value);if(forceFast)mode="fast";if(text.length>(small?1400:3500)&&mode!=="fast"){mode="fast";toast("Long text → fast chunked mode")}
 $("go").disabled=true;const out=$("out");out.textContent="";out.dir=["Arabic","Urdu"].includes(to)?"rtl":"ltr";$("extra").innerHTML="";$("multi").innerHTML="";$("conf").style.width="0";$("cs").textContent="confidence";setPips(-1);
 try{let an={};
  if(mode!=="fast"){step(0,"Analyzing domain, register, idioms…");an=J(await llm([{role:"system",content:'Analyze the text. Return ONLY JSON {"language":"","domain":"Legal|Medical|Slang|Technical|Business|General|Literary|Academic","register":"formal|neutral|casual","idioms":[{"phrase":"","meaning":""}],"strategy":"one sentence"}'},{role:"user",content:text.slice(0,3000)}],{json:true,temp:0}))}
  const{0:ctx,1:mem}=(()=>{const c=ctxStr(an,text);return[c,c.includes("MANDATORY")]})();
  $("dom").textContent="domain: "+($("domainSel").value!=="auto"?$("domainSel").value:an.domain||"—");$("reg").textContent="register: "+($("tone").value!=="auto"?$("tone").value:an.register||"—");
  const sl=from==="auto"?(an.language||"auto-detected"):from;let fin="",sc=null;
  const sys=`You are an expert translator. Translate into ${to}. Output only the translation. ${ctx}`;
  if(mode==="fast"){step(1,`Translating ${sl} → ${to}${mem?" (TM injected)":""}…`);const parts=chunk(text,small||forceFast?1000:2500);for(const p of parts){const pre=fin;fin+=(fin?"\n\n":"")+await llm([{role:"system",content:sys},{role:"user",content:p}],{stream:true,onTok:t=>out.textContent=(pre?pre+"\n\n":"")+t});out.textContent=fin}setPips(5,[1])}
  else{step(1,`Drafting ${sl} → ${to}${mem?" (TM injected)":""}…`);const draft=await llm([{role:"system",content:sys},{role:"user",content:text}]);
   step(2,"Critiquing for semantic drift…");const cr=J(await llm([{role:"system",content:'Critique the translation against the source for meaning, terminology and register. Return ONLY JSON {"score":0-100,"issues":["..."]}'},{role:"user",content:`SOURCE:\n${text}\n\nTRANSLATION (${to}):\n${draft}\n\n${ctx}`}],{json:true,temp:0}));
   step(3,"Refining…");fin=await llm([{role:"system",content:`Produce the final ${to} translation, fixing the listed issues. Output only the translation. ${ctx}`},{role:"user",content:`SOURCE:\n${text}\n\nDRAFT:\n${draft}\n\nISSUES: ${JSON.stringify(cr.issues||[])}`}],{stream:true,onTok:t=>out.textContent=t});out.textContent=fin;sc=Math.max(0,Math.min(100,+cr.score||85));
   if(mode==="deep"){step(4,"Verifying via back-translation…");const back=await llm([{role:"system",content:`Translate into ${sl==="auto-detected"?"the original language":sl}. Output only the translation.`},{role:"user",content:fin}],{temp:0});
    const v=J(await llm([{role:"system",content:'Compare ORIGINAL and BACK-TRANSLATION for meaning loss. Return ONLY JSON {"fidelity":0-100,"notes":"short"}'},{role:"user",content:`ORIGINAL:\n${text}\n\nBACK:\n${back}`}],{json:true,temp:0}));
    if(v.fidelity!=null)sc=Math.round((sc+ +v.fidelity)/2);$("extra").innerHTML=`<div class="card"><b>↩ Verification</b> (fidelity ${v.fidelity??"?"}%)\n${esc(back)}\n<small>${esc(v.notes||"")}</small></div>`}
   setPips(5,[0,1,2,3,4])}
  if(pii){fin=OLLib.unmaskPII(fin,pii);out.textContent=fin;$("extra").innerHTML=$("extra").innerHTML.replace(/\[\[P\d+\]\]/g,"");toast("🛡 Privacy Shield masked "+pii.map.length+" item(s)")}
  if(sc!=null){$("conf").style.width=sc+"%";$("cs").textContent=sc+"% confidence"}
  $("steps").textContent="✅ Done · "+(mode==="fast"?"Fast":mode==="deep"?"Analyze → Draft → Critique → Refine → Verify":"Analyze → Draft → Critique → Refine");
  last={src:raw,out:fin,from:sl,to,dom:an.domain||"",conf:sc,id:Date.now()};addHist(last);$("fav").textContent="☆";
  const extras=[...document.querySelectorAll("#chips .chip.on")].map(c=>c.textContent).filter(n=>n!==to);
  for(const n of extras){const d=document.createElement("div");d.className="card";d.innerHTML=`<b>${n}</b> <button class="sp2" style="padding:1px 8px">🔊</button><div>…</div>`;$("multi").append(d);try{const r=await quick(raw,n);d.lastChild.textContent=r;d.querySelector("button").onclick=()=>speak(r,n)}catch(e){d.lastChild.textContent="⚠ "+e.message}}
  if($("auto").checked)speak()
 }catch(e){if(/context_length|reduce the length|too long/i.test(e.message)&&!forceFast){forceFast=true;$("go").disabled=false;toast("Context limit hit → retrying in chunked fast mode");try{return await translate()}finally{forceFast=false}}$("out").textContent="⚠ "+e.message;$("steps").textContent="Pipeline error";setPips(-1)}
 $("go").disabled=false}
$("go").onclick=translate;
const upd=()=>{$("cnt").textContent=$("in").value.length+" chars"};let tmr;
$("in").oninput=()=>{upd();if(S.auto){clearTimeout(tmr);tmr=setTimeout(translate,1100)}};
$("swap").onclick=()=>{const a=$("src").value==="auto"?last.from:$("src").value,b=$("tgt").value;if(!L.some(l=>l[0]===a))return toast("Pick a source language first");$("src").value=b;$("tgt").value=a;if($("out").textContent){$("in").value=$("out").textContent;$("out").textContent="";upd()}voices()};
$("clr").onclick=()=>{$("in").value="";upd()};$("paste").onclick=async()=>{try{$("in").value=await navigator.clipboard.readText();upd()}catch{toast("Clipboard blocked by browser")}};
$("cpy").onclick=()=>{navigator.clipboard.writeText($("out").textContent);toast("Copied")};
const need=()=>last.out||(toast("Translate something first"),"");
$("alt").onclick=async()=>{if(!need())return;$("extra").innerHTML='<div class="card">Generating variants…</div>';try{$("extra").innerHTML=`<div class="card"><b>🔀 Variants</b>\n${esc(await llm([{role:"system",content:`Give 3 alternative ${last.to} phrasings (formal, neutral, casual), numbered, one per line, no commentary.`},{role:"user",content:last.src}]))}</div>`}catch(e){$("extra").textContent="⚠ "+e.message}};
$("bt").onclick=async()=>{if(!need())return;$("extra").innerHTML='<div class="card">Back-translating…</div>';try{$("extra").innerHTML=`<div class="card"><b>↩ Back-translation</b>\n${esc(await llm([{role:"system",content:`Translate into ${last.from&&last.from!=="auto-detected"?last.from:"English"}. Output only the translation.`},{role:"user",content:last.out}],{temp:0}))}</div>`}catch(e){$("extra").textContent="⚠ "+e.message}};
$("rom").onclick=async()=>{if(!need())return;$("extra").innerHTML='<div class="card">Romanizing…</div>';try{$("extra").innerHTML=`<div class="card"><b>Aa Romanization</b>\n${esc(await llm([{role:"system",content:"Transliterate the text into Latin script with an easy pronunciation guide. Output only the result."},{role:"user",content:last.out}],{temp:0}))}</div>`}catch(e){$("extra").textContent="⚠ "+e.message}};
$("savetm").onclick=()=>{if(!need())return;addTM([last.src.replace(/\s+/g," ").slice(0,300)+" => "+last.out.replace(/\s+/g," ").slice(0,300)]);toast("Saved to translation memory")};
$("exp").onclick=()=>{if(!need())return;dl("translation.txt",`[${last.from} → ${last.to}]\n\nSOURCE:\n${last.src}\n\nTRANSLATION:\n${last.out}\n`)};

/* ---------- history ---------- */
let H=LS.g("ol_h",[]);const saveH=()=>LS.s("ol_h",H.slice(0,100));
function addHist(e){H.unshift({...e});H=H.slice(0,100);saveH();renderH()}
function renderH(){const q=$("hq").value.toLowerCase();$("hlist").innerHTML="";H.filter(h=>(h.src+h.out).toLowerCase().includes(q)).forEach(h=>{const d=document.createElement("div");d.className="hi";d.innerHTML=`<div>${esc(h.src.slice(0,90))}</div><div class="m">→ ${esc(h.out.slice(0,90))}</div><small>${h.from}→${h.to} · ${new Date(h.id).toLocaleString()} <span data-a="f">${h.fav?"★":"☆"}</span> <span data-a="d">🗑</span></small>`;
 d.onclick=ev=>{const a=ev.target.dataset.a;if(a==="f"){h.fav=!h.fav;saveH();renderH();return}if(a==="d"){H=H.filter(x=>x!==h);saveH();renderH();return}$("in").value=h.src;$("out").textContent=h.out;last={...h};upd();$("hdr").classList.remove("open")};$("hlist").append(d)})}
renderH();$("hq").oninput=renderH;$("bHist").onclick=()=>$("hdr").classList.toggle("open");
$("hexp").onclick=()=>dl("omnilingua-history.json",JSON.stringify(H,null,2),"application/json");$("hclr").onclick=()=>{if(confirm("Clear history?")){H=[];saveH();renderH()}};
$("fav").onclick=()=>{const h=H.find(x=>x.id===last.id);if(!h)return;h.fav=!h.fav;$("fav").textContent=h.fav?"★":"☆";saveH();renderH()};

/* ---------- files: image OCR (CNN-style scan), PDF, text ---------- */
async function ocrImage(f){const sb=$("sb"),img=$("oimg");img.src=URL.createObjectURL(f);sb.style.display="block";$("grid").style.display=$("sl").style.display="block";$("ocrs").textContent="Scanning…";await new Promise(r=>img.onload=r);
 const c=$("ov"),x=c.getContext("2d");c.width=img.naturalWidth;c.height=img.naturalHeight;x.clearRect(0,0,c.width,c.height);
 try{if(!window.Tesseract)throw new Error("OCR engine not loaded (check connection)");
  const{data}=await Tesseract.recognize(f,$("ocrLang").value);x.strokeStyle=ACC;x.fillStyle=ACC+"22";x.lineWidth=Math.max(2,c.width/300);
  (data.lines||[]).forEach(l=>{const b=l.bbox;x.fillRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0);x.strokeRect(b.x0,b.y0,b.x1-b.x0,b.y1-b.y0)});
  const t=(data.lines||[]).map(l=>l.text.trim()).filter(Boolean).join("\n");$("in").value=t;upd();$("ocrs").textContent=`✅ ${(data.lines||[]).length} text regions · confidence ${Math.round(data.confidence||0)}%`;if(t&&KEY&&S.auto)translate()}
 catch(e){$("ocrs").textContent="⚠ "+e.message}$("grid").style.display=$("sl").style.display="none"}
async function readPdf(f){$("ocrs").textContent="Reading PDF…";try{if(!window.pdfjsLib)throw new Error("PDF engine not loaded");pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
 const d=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let t="";for(let i=1;i<=Math.min(d.numPages,25);i++)t+=(await(await d.getPage(i)).getTextContent()).items.map(x=>x.str).join(" ")+"\n\n";
 if(t.trim().length<20){$("ocrs").textContent="Scanned PDF → OCR on page 1…";const pg=await d.getPage(1),vp=pg.getViewport({scale:2}),cv=document.createElement("canvas");cv.width=vp.width;cv.height=vp.height;await pg.render({canvasContext:cv.getContext("2d"),viewport:vp}).promise;return ocrImage(await new Promise(r=>cv.toBlob(r)))}
 $("in").value=t.trim();upd();$("ocrs").textContent=`✅ PDF read: ${Math.min(d.numPages,25)}/${d.numPages} pages`}catch(e){$("ocrs").textContent="⚠ "+e.message}}
async function handleFile(f){if(!f)return;const n=f.name.toLowerCase();if(f.type.startsWith("image/"))return ocrImage(f);if(n.endsWith(".pdf"))return readPdf(f);if(/\.(txt|md|srt|vtt|csv)$/.test(n)){$("in").value=await f.text();upd();$("ocrs").textContent="✅ Document loaded: "+f.name;return}toast("Unsupported file type")}
$("file").onchange=e=>handleFile(e.target.files[0]);$("cam").onchange=e=>handleFile(e.target.files[0]);
["dragover","drop"].forEach(ev=>addEventListener(ev,e=>{e.preventDefault();if(ev==="drop")handleFile(e.dataTransfer.files[0])}));
addEventListener("paste",e=>{const f=[...(e.clipboardData?.files||[])][0];if(f&&f.type.startsWith("image/"))handleFile(f)});

/* ---------- voice: STT + live interpreter, waveform ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;let rec,on=false,stream,raf;
function wave(an){const cv=$("wave"),g=cv.getContext("2d"),d=new Uint8Array(an.frequencyBinCount);(function f(){raf=requestAnimationFrame(f);an.getByteFrequencyData(d);g.clearRect(0,0,cv.width,cv.height);const w=cv.width/48;for(let i=0;i<48;i++){const h=d[i*2]/255*cv.height;g.fillStyle=i%2?ACC:"#b026ff";g.fillRect(i*w,cv.height-h,w-2,h)}})()}
$("mic").onclick=async()=>{
 if(!SR)return toast("Speech recognition needs Chrome / Edge / Safari");
 if(on){on=false;rec.stop();stream&&stream.getTracks().forEach(t=>t.stop());cancelAnimationFrame(raf);$("mic").textContent="🎙 Voice";return}
 try{stream=await navigator.mediaDevices.getUserMedia({audio:true});const ac=new AudioContext(),an=ac.createAnalyser();an.fftSize=128;ac.createMediaStreamSource(stream).connect(an);wave(an)}catch{}
 rec=new SR();rec.continuous=true;rec.interimResults=true;rec.lang=$("src").value==="auto"?navigator.language||"en-US":SC($("src").value);let base=$("in").value;
 rec.onresult=async e=>{let fi="",it="";for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;e.results[i].isFinal?fi+=t:it+=t}$("interim").textContent=it;
  if(fi){if($("interp").checked){$("in").value=fi;upd();try{const r=await quick(fi,$("tgt").value);$("out").textContent=r;last={src:fi,out:r,from:$("src").value,to:$("tgt").value,id:Date.now()};addHist(last);speak(r)}catch(x){toast(x.message)}}else{base+=(base?" ":"")+fi;$("in").value=base;upd();if(KEY&&S.auto)translate()}}};
 rec.onend=()=>{if(on)try{rec.start()}catch{}};rec.onerror=e=>$("interim").textContent="Mic: "+e.error;on=true;rec.start();$("mic").textContent="🎙 LISTENING…"};

/* ---------- TTS ---------- */
function voices(){const vs=$("vs"),all=speechSynthesis.getVoices();vs.innerHTML="";all.forEach((v,i)=>vs.add(new Option(v.name+" ("+v.lang+")",i)));const c=SC($("tgt").value).slice(0,2),i=all.findIndex(v=>v.lang.startsWith(c));if(i>=0)vs.value=i}
speechSynthesis.onvoiceschanged=voices;voices();$("tgt").onchange=voices;let tiv;
function speak(text=$("out").textContent,lang=$("tgt").value){if(!text)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text),all=speechSynthesis.getVoices();const p=SC(lang).slice(0,2);let v=lang===$("tgt").value?all[$("vs").value]:null;v=v&&v.lang.startsWith(p)?v:all.find(x=>x.lang.startsWith(p));if(v){u.voice=v;u.lang=v.lang}else u.lang=SC(lang);u.rate=+$("rate").value;u.pitch=+$("pitch").value;
 const cv=$("tw"),g=cv.getContext("2d");u.onstart=()=>{tiv=setInterval(()=>{g.clearRect(0,0,cv.width,cv.height);for(let i=0;i<48;i++){const h=Math.random()*cv.height;g.fillStyle=i%2?ACC:"#b026ff";g.fillRect(i*12.5,(cv.height-h)/2,10,h)}},90)};u.onend=u.onerror=()=>{clearInterval(tiv);g.clearRect(0,0,cv.width,cv.height)};speechSynthesis.speak(u)}
$("spk").onclick=()=>speak();

/* ---------- LinguaBot ---------- */
let hist=[];
function md(s){s=esc(s);s=s.replace(/```(\w*)\n?([\s\S]*?)(```|$)/g,(m,l,c)=>`<pre><button class="cp" onclick="navigator.clipboard.writeText(this.nextSibling.textContent)">copy</button><code>${c.replace(/\b(function|const|let|return|if|else|def|import|class|for|while)\b/g,'<span class="kw">$1</span>').replace(/(&quot;[^&]*?&quot;|"[^"\n]*")/g,'<span class="st">$1</span>').replace(/(\/\/.*|#.*)/g,'<span class="cm">$1</span>')}</code></pre>`);
 return s.replace(/`([^`\n]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/^### ?(.*)$/gm,"<b>$1</b>")}
async function chat(q){q=(q||$("ci").value).trim();if(!q)return;$("ci").value="";const m=$("msgs"),u=document.createElement("div");u.className="msg u";u.textContent=q;m.append(u);const a=document.createElement("div");a.className="msg a";a.textContent="…";m.append(a);m.scrollTop=1e9;hist.push({role:"user",content:q});
 try{const r=await llm([{role:"system",content:`You are LinguaBot, an expert linguist. Context: source """${last.src}""" was translated to ${last.to||$("tgt").value} as """${last.out}""". Explain idioms, grammar, give variants. Use markdown, be concise; use code blocks only for example sentences.`},...hist.slice(-8)],{stream:true,onTok:t=>{a.innerHTML=md(t);m.scrollTop=1e9}});a.innerHTML=md(r);hist.push({role:"assistant",content:r})}catch(e){a.textContent="⚠ "+e.message}}
$("csend").onclick=()=>chat();$("ci").onkeydown=e=>{if(e.key==="Enter")chat()};document.querySelectorAll("#qchips .chip").forEach(c=>c.onclick=()=>chat(c.dataset.q));
$("bclr").onclick=()=>{hist=[];$("msgs").innerHTML='<div class="msg a">Chat cleared. Ask away 🤖</div>'};
$("fab").onclick=()=>$("drawer").classList.toggle("open");

/* ---------- shortcuts, close buttons, PWA ---------- */
document.querySelectorAll(".xc").forEach(b=>b.onclick=()=>{const t=$(b.dataset.c);t.classList.contains("modal")?t.style.display="none":t.classList.remove("open")});
addEventListener("keydown",e=>{if(e.ctrlKey&&e.key==="Enter")translate();if(e.altKey&&e.key.toLowerCase()==="s")$("swap").click();if(e.key==="Escape"){$("modal").style.display="none";$("drawer").classList.remove("open");$("hdr").classList.remove("open")}});
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
loadKey();upd();
