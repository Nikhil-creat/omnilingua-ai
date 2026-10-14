"use strict";
/* OmniLingua AI v3: enterprise modules (vault + failover, audit log, analytics, batch, arena,
   command palette, privacy shield UI, presets, diagnostics, share/print, accessibility) */
(()=>{
const log=LS.g("ol_log",[]);const rec=e=>{log.push(e);if(log.length>500)log.shift();LS.s("ol_log",log)};
const V=()=>LS.g("ol_vault",{});
async function vaultPut(p,k){const iv=crypto.getRandomValues(new Uint8Array(12)),v=V();v[p]=b64(iv)+"."+b64(await crypto.subtle.encrypt({name:"AES-GCM",iv},await ck(),te.encode(k)));LS.s("ol_vault",v)}
async function vaultGet(p){const s=V()[p];if(!s)return null;try{const[i,c]=s.split(".");return td.decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:ub(i)},await ck(),ub(c)))}catch{return null}}

/* ----- key vault hook + provider switcher ----- */
const _sk=saveKey;saveKey=async v=>{await _sk(v);const p=detect(v);if(p)await vaultPut(p,v)};
const _cn=connect;connect=async()=>{await _cn();renderSw()};
setTimeout(()=>{if(KEY&&P&&!V()[P])vaultPut(P,KEY)},1500);
const sw=document.createElement("select");sw.id="pvSel";sw.title="Switch provider";sw.style.display="none";sw.setAttribute("aria-label","Switch AI provider");
function renderSw(){const ps=Object.keys(V());sw.innerHTML="";ps.forEach(p=>sw.add(new Option(PROV[p].name,p)));sw.style.display=ps.length>1?"":"none";if(P)sw.value=P}
sw.onchange=async()=>{const k=await vaultGet(sw.value);if(!k)return;await _sk(k);await connect();toast("Switched to "+PROV[P].name)};

/* ----- audit log + automatic failover ----- */
let failing=false;const _llm=llm;
llm=async function(messages,o={},model=null,retry=0){
 const t0=performance.now(),prov=P;
 try{const r=await _llm(messages,o,model,retry);rec({t:Date.now(),p:prov,m:lastStat?.model||model||"",ms:Math.round(performance.now()-t0),c:r.length,ok:1});return r}
 catch(e){rec({t:Date.now(),p:prov,m:model||$("model").value||"",ms:Math.round(performance.now()-t0),ok:0,err:String(e.message).slice(0,80)});
  if(!failing&&!model&&/ (429|5\d\d):|Network|CORS/.test(e.message)){
   const oK=KEY,alts=Object.keys(V()).filter(p=>p!==prov);
   for(const p of alts){const k=await vaultGet(p);if(!k)continue;failing=true;
    try{KEY=k;await connect();const r=await _llm(messages,o,null,0);toast("⚡ Failover → "+PROV[P].name);return r}catch{}finally{failing=false}}
   if(KEY!==oK){KEY=oK;await connect()}}
  throw e}};
let lastErr=0;const onErr=m=>{if(Date.now()-lastErr<5000)return;lastErr=Date.now();rec({t:Date.now(),p:P||"-",m:"runtime",ms:0,ok:0,err:String(m).slice(0,80)})};
addEventListener("error",e=>onErr(e.message));addEventListener("unhandledrejection",e=>onErr(e.reason?.message||e.reason));
const exportLog=()=>dl("omnilingua-audit-log.csv",OLLib.toCSV([["time","provider","model","latency_ms","chars","ok","error"],...log.map(x=>[new Date(x.t).toISOString(),x.p,x.m,x.ms,x.c||"",x.ok,x.err||""])]),"text/csv");

/* ----- glossary compliance after each translation ----- */
const _ah=addHist;addHist=e=>{_ah(e);try{const ps=retrieve(e.src).split("\n").map(l=>l.slice(2).split(" => ")).filter(p=>p[1]);if(ps.length){const ok=ps.filter(p=>e.out.toLowerCase().includes(p[1].trim().toLowerCase())).length;$("steps").textContent+=` · 📚 TM terms ${ok}/${ps.length}`}}catch{}};

/* ----- UI helpers ----- */
const modal=(id,title,body)=>{let m=$(id);if(m)return m;m=document.createElement("div");m.className="modal";m.id=id;m.setAttribute("role","dialog");m.setAttribute("aria-label",title);m.innerHTML=`<div class="g"><div class="row"><h3 style="margin:0">${title}</h3><span class="sp"></span><button class="xm" aria-label="Close">✕</button></div><div style="margin-top:10px">${body}</div></div>`;document.body.append(m);m.querySelector(".xm").onclick=()=>m.style.display="none";m.addEventListener("click",e=>{if(e.target===m)m.style.display="none"});return m};
const show=m=>m.style.display="flex";

/* ----- Privacy Shield + presets + a11y + settings extras ----- */
const lab=document.createElement("label");lab.className="row m";lab.innerHTML='<input type="checkbox" id="pii"> 🛡 Privacy Shield: mask emails, phones, Aadhaar/PAN, cards, IPs before sending';$("go").before(lab);
$("pii").checked=!!S.pii;$("pii").onchange=e=>{S.pii=e.target.checked;saveS()};
const box=document.createElement("div");box.innerHTML=`<hr style="border-color:#fff2;margin:14px 0"><div class="m" style="margin-bottom:4px">Custom instructions (applied to every translation)</div><textarea id="custom" style="min-height:70px" placeholder="e.g. Use Indian English spellings; never translate brand names"></textarea><label class="row m">Text size <input type="range" id="fs" min=".9" max="1.5" step=".05"></label><label class="row"><input type="checkbox" id="hc"> High contrast</label><div class="row"><button id="sDiag">🩺 Diagnostics</button><button id="sAn">📊 Analytics</button><button id="sBatch">📦 Batch</button><button id="sArena">🥊 Arena</button></div>`;
$("wipe").parentElement.before(box);
$("custom").value=S.custom||"";$("custom").oninput=e=>{S.custom=e.target.value.slice(0,500);saveS()};
const applyA=()=>{document.body.style.fontSize=14*(S.fs||1)+"px";document.body.classList.toggle("hc",!!S.hc);$("fs").value=S.fs||1;$("hc").checked=!!S.hc};
$("fs").oninput=e=>{S.fs=+e.target.value;saveS();applyA()};$("hc").onchange=e=>{S.hc=e.target.checked;saveS();applyA()};applyA();
$("out").setAttribute("aria-live","polite");$("in").setAttribute("aria-label","Text to translate");
const bK=document.createElement("button");bK.id="bK";bK.textContent="⌘";bK.title="Command palette (Ctrl+K)";bK.setAttribute("aria-label","Command palette");
const bA=document.createElement("button");bA.id="bA";bA.textContent="📊";bA.title="Analytics";bA.setAttribute("aria-label","Analytics");
$("bHist").before(sw,bK,bA);
const PR=()=>LS.g("ol_presets",[]);
function savePreset(){const n=prompt("Preset name?");if(!n)return;const p=PR().filter(x=>x.n!==n);p.push({n,to:$("tgt").value,from:$("src").value,tone:$("tone").value,dom:$("domainSel").value,mode:S.mode});LS.s("ol_presets",p);toast("Preset saved")}
const applyPreset=p=>{$("tgt").value=p.to;$("src").value=p.from;$("tone").value=p.tone;$("domainSel").value=p.dom;setMode(p.mode);voices();toast("Preset: "+p.n)};
const toggleHC=()=>{S.hc=!S.hc;saveS();applyA()};

/* ----- share / print ----- */
function share(){const src=last.src||$("in").value;if(!src)return toast("Nothing to share");const p=btoa(unescape(encodeURIComponent(JSON.stringify({t:src.slice(0,1500),f:$("src").value,to:$("tgt").value}))));const u=location.origin+location.pathname+"#s="+p;navigator.share?navigator.share({title:"OmniLingua AI",url:u}).catch(()=>{}):navigator.clipboard.writeText(u).then(()=>toast("Link copied (contains your text)"))}
function printOut(){if(!need())return;const f=document.createElement("iframe");f.style.display="none";document.body.append(f);const d=f.contentDocument;d.open();d.write(`<html><head><title>OmniLingua translation</title><style>body{font:15px Georgia,serif;margin:40px}h2{font:600 12px Arial;color:#555;text-transform:uppercase}pre{white-space:pre-wrap;font:inherit}</style></head><body><h1>OmniLingua AI</h1><p>${esc(last.from)} → ${esc(last.to)} · ${new Date().toLocaleString()}</p><h2>Source</h2><pre>${esc(last.src)}</pre><h2>Translation</h2><pre>${esc(last.out)}</pre></body></html>`);d.close();setTimeout(()=>{f.contentWindow.print();setTimeout(()=>f.remove(),2000)},300)}
try{const h=location.hash.match(/^#s=(.+)$/);if(h){const j=JSON.parse(decodeURIComponent(escape(atob(h[1]))));$("in").value=j.t;if(j.f)$("src").value=j.f;if(j.to)$("tgt").value=j.to;upd();voices();toast("Shared text loaded")}}catch{}
const sb=document.createElement("button");sb.id="bShare";sb.textContent="🔗";sb.title="Share link";sb.onclick=share;$("fav").before(sb);

/* ----- batch translation ----- */
let bRes=[];
function openBatch(){const m=modal("mBatch","📦 Batch translation",`<small>One segment per line, or load .txt / .csv (first column) / .json (array of strings). 15 lines per request.</small><textarea id="bIn" style="min-height:120px;margin:8px 0" placeholder="Hello&#10;Good morning&#10;Thank you"></textarea><div class="row"><label class="btn drop">📂 Load<input type="file" id="bFile" accept=".txt,.csv,.json" hidden></label><select id="bTo"></select><button class="pri" id="bRun">Run</button></div><div class="bar" style="width:100%;margin:10px 0"><i id="bProg"></i></div><div id="bOut" style="max-height:240px;overflow:auto"></div><div class="row" style="margin-top:8px"><button id="bCsv">⬇ CSV</button><button id="bJson">⬇ JSON</button></div>`);
 if(!m.dataset.i){m.dataset.i=1;L.forEach(l=>$("bTo").add(new Option(l[0],l[0])));
  $("bFile").onchange=async e=>{const f=e.target.files[0];if(!f)return;const t=await f.text(),n=f.name.toLowerCase();let a;try{a=n.endsWith(".json")?JSON.parse(t).map(String):t.split(/\r?\n/).filter(Boolean).map(l=>n.endsWith(".csv")?OLLib.csvFirstCol(l):l)}catch{return toast("Could not parse file")}$("bIn").value=a.join("\n")};
  $("bCsv").onclick=()=>bRes.length&&dl("batch-translation.csv",OLLib.toCSV([["source","translation"],...bRes]),"text/csv");
  $("bJson").onclick=()=>bRes.length&&dl("batch-translation.json",JSON.stringify(bRes.map(([source,translation])=>({source,translation})),null,2),"application/json");
  $("bRun").onclick=async()=>{const lines=$("bIn").value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);if(!lines.length)return toast("Add some lines");const to=$("bTo").value;$("bRun").disabled=true;bRes=[];$("bOut").innerHTML="";$("bProg").style.width="0";
   try{for(let i=0;i<lines.length;i+=15){const grp=lines.slice(i,i+15),pii=$("pii").checked,ms=grp.map(g=>pii?OLLib.maskPII(g):{text:g,map:[]});let t=null,done=false;
     try{const r=J(await llm([{role:"system",content:`Translate each item of the JSON array into ${to}. Return ONLY JSON {"t":[...]} with exactly ${grp.length} strings in the same order. Keep [[P#]] placeholders unchanged. ${ctxBase({},grp.join(" "))}`},{role:"user",content:JSON.stringify(ms.map(x=>x.text))}],{json:true,temp:.2}));if(Array.isArray(r.t)&&r.t.length===grp.length)t=r.t.map((x,j)=>OLLib.unmaskPII(String(x),ms[j]))}catch(e){if(/Add an API key/.test(e.message))throw e}
     if(!t){t=[];for(const g of grp)t.push(await quick(g,to))}
     grp.forEach((g,j)=>{bRes.push([g,t[j]]);const d=document.createElement("div");d.className="card";d.textContent=g+"\n→ "+t[j];$("bOut").append(d)});$("bProg").style.width=Math.round((i+grp.length)/lines.length*100)+"%"}
    toast("Batch done: "+bRes.length+" lines")}catch(e){toast("⚠ "+e.message)}$("bRun").disabled=false}}
 show(m)}

/* ----- model arena ----- */
function openArena(){const m=modal("mArena","🥊 Model Arena",`<small>Same text on two models, then an AI judge compares them.</small><div class="row" style="margin:8px 0"><select id="aA"></select><span>vs</span><select id="aB"></select></div><button class="pri" id="aRun" style="width:100%">Fight!</button><div id="aOut"></div>`);
 for(const id of["aA","aB"]){$(id).innerHTML="";MODELS.forEach(x=>$(id).add(new Option(x,x)))}$("aA").value=$("model").value;$("aB").value=MODELS.find(x=>x!==$("aA").value)||$("aA").value;
 if(!m.dataset.i){m.dataset.i=1;$("aRun").onclick=async()=>{const text=$("in").value.trim();if(!text)return toast("Type text first");if(!KEY)return openSet();const to=$("tgt").value,A=$("aA").value,B=$("aB").value;$("aRun").disabled=true;$("aOut").innerHTML='<div class="card">Running both models…</div>';
  const run=async mdl=>{const t0=performance.now();try{return{m:mdl,r:await llm([{role:"system",content:`Translate into ${to}. Output only the translation.`},{role:"user",content:text}],{temp:.2},mdl),ms:Math.round(performance.now()-t0)}}catch(e){return{m:mdl,r:"⚠ "+e.message,ms:0}}};
  const[a,b]=await Promise.all([run(A),run(B)]);let j={};try{j=J(await llm([{role:"system",content:'You are a strict bilingual judge. Compare translations A and B for accuracy, fluency and register. Return ONLY JSON {"winner":"A|B|tie","scoreA":0-100,"scoreB":0-100,"reason":"short"}'},{role:"user",content:`SOURCE:\n${text}\n\nA:\n${a.r}\n\nB:\n${b.r}`}],{json:true,temp:0}))}catch{}
  $("aOut").innerHTML="";for(const[x,tag,sc]of[[a,"A",j.scoreA],[b,"B",j.scoreB]]){const d=document.createElement("div");d.className="card";d.innerHTML=`<b>${tag} · ${esc(x.m)}</b> <small>${x.ms}ms${sc!=null?" · score "+sc:""}${j.winner===tag?" · 🏆":""}</small>\n`;d.append(document.createTextNode(x.r));$("aOut").append(d)}
  if(j.reason){const d=document.createElement("div");d.className="card";d.textContent="⚖ "+(j.winner||"?")+": "+j.reason;$("aOut").append(d)}$("aRun").disabled=false}}
 show(m)}

/* ----- analytics ----- */
function openAnalytics(){const m=modal("mAn","📊 Analytics",`<div id="anB"></div><div class="row" style="margin-top:10px"><button id="anCsv">⬇ Audit log (CSV)</button><button id="anClr">🗑 Clear log</button></div>`);
 const ok=log.filter(x=>x.ok),lat=ok.length?Math.round(ok.reduce((s,x)=>s+x.ms,0)/ok.length):0,tok=Math.round(ok.reduce((s,x)=>s+(x.c||0),0)/4),cf=H.filter(h=>h.conf!=null),ac=cf.length?Math.round(cf.reduce((s,h)=>s+h.conf,0)/cf.length):0;
 const by=(a,f)=>a.reduce((o,x)=>{const k=f(x);if(k)o[k]=(o[k]||0)+1;return o},{});
 const bars=o=>{const e=Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,6),mx=e[0]?.[1]||1;return e.map(([k,v])=>`<div class="row" style="flex-wrap:nowrap"><span style="width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k)}</span><span class="bar" style="flex:1"><i style="width:${v/mx*100}%"></i></span><span class="mono">${v}</span></div>`).join("")||"<small>No data yet</small>"};
 const st=(n,l)=>`<div class="stat"><b>${n}</b><small>${l}</small></div>`;
 $("anB").innerHTML=`<div class="stats">${st(H.length,"translations")}${st(log.length,"API calls")}${st(log.length?Math.round(ok.length/log.length*100)+"%":"–","success")}${st(lat+"ms","avg latency")}${st("~"+tok,"output tokens")}${st(ac?ac+"%":"–","avg confidence")}${st(TM.length,"TM entries")}${st(Object.keys(V()).length,"keys in vault")}</div><h4>Target languages</h4>${bars(by(H,h=>h.to))}<h4>Domains</h4>${bars(by(H,h=>h.dom))}<h4>Providers</h4>${bars(by(log,x=>x.p))}<h4>Models</h4>${bars(by(log,x=>x.m))}`;
 if(!m.dataset.i){m.dataset.i=1;$("anCsv").onclick=exportLog;$("anClr").onclick=()=>{log.length=0;LS.s("ol_log",[]);openAnalytics();toast("Audit log cleared")}}show(m)}

/* ----- diagnostics ----- */
function openDiag(){const m=modal("mDiag","🩺 System diagnostics",`<div id="dgB"></div><button class="pri" id="dgPing" style="width:100%;margin-top:10px">Test API connection</button>`);
 let ls=false;try{localStorage.setItem("_t","1");localStorage.removeItem("_t");ls=true}catch{}
 const C=[["Secure context (HTTPS)",isSecureContext],["Web Crypto (key encryption)",!!(window.crypto&&crypto.subtle)],["localStorage",ls],["Speech recognition (STT)",!!SR],["Speech synthesis (TTS)",!!window.speechSynthesis&&speechSynthesis.getVoices().length+" voices"],["Microphone API",!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)],["Service worker (offline)",!!(navigator.serviceWorker&&navigator.serviceWorker.controller)||"supported; active after 2nd load"],["Clipboard API",!!navigator.clipboard],["OCR engine (Tesseract.js)",!!window.Tesseract],["PDF engine (pdf.js)",!!window.pdfjsLib],["Online",navigator.onLine],["AI provider",P?PROV[P].name+" · "+MODELS.length+" models":false]];
 $("dgB").innerHTML=C.map(([n,v])=>`<div class="row" style="justify-content:space-between;padding:4px 0;border-bottom:1px solid #fff1"><span>${n}</span><span class="mono">${v===true?"✅":v===false?"❌":"✅ "+esc(String(v))}</span></div>`).join("");
 if(!m.dataset.i){m.dataset.i=1;$("dgPing").onclick=async()=>{if(!KEY)return openSet();const t0=performance.now();try{await llm([{role:"user",content:"Reply with: OK"}],{temp:0});toast(`API OK · ${Math.round(performance.now()-t0)}ms`)}catch(e){toast("⚠ "+e.message)}}}show(m)}
$("sDiag").onclick=openDiag;$("sAn").onclick=bA.onclick=openAnalytics;$("sBatch").onclick=openBatch;$("sArena").onclick=openArena;

/* ----- command palette ----- */
let dip;addEventListener("beforeinstallprompt",e=>{e.preventDefault();dip=e});
const acts=()=>[{n:"Translate",h:"Ctrl+Enter",f:()=>translate()},{n:"Swap languages",h:"Alt+S",f:()=>$("swap").click()},{n:"Batch translation",f:openBatch},{n:"Model Arena: compare two models",f:openArena},{n:"Analytics dashboard",f:openAnalytics},{n:"System diagnostics",f:openDiag},{n:"Share link",f:share},{n:"Print / save as PDF",f:printOut},{n:"Save current settings as preset…",f:savePreset},...PR().map(p=>({n:"Preset: "+p.n,f:()=>applyPreset(p)})),...["fast","agentic","deep"].map(x=>({n:"Mode: "+x,f:()=>setMode(x)})),...Object.keys(TH).map(x=>({n:"Theme: "+x,f:()=>setTheme(x)})),{n:"Toggle Privacy Shield",f:()=>$("pii").click()},{n:"Toggle high contrast",f:toggleHC},{n:"Open history",f:()=>$("bHist").click()},{n:"Open LinguaBot",f:()=>$("fab").click()},{n:"Settings / API key",f:openSet},{n:"Export audit log (CSV)",f:exportLog},{n:"Export translation memory (TMX)",f:()=>$("tmX").click()},...(window.OLX_ACTS?OLX_ACTS():[]),{n:"Install app",f:()=>dip?dip.prompt():toast("Browser menu → Add to Home screen")},...Object.keys(V()).filter(p=>p!==P).map(p=>({n:"Switch provider: "+PROV[p].name,f:async()=>{const k=await vaultGet(p);if(k){await _sk(k);await connect()}}}))];
let sel=0,shown=[];
function openPal(){const m=modal("mPal","⌘ Command palette",`<input id="pq" placeholder="Type a command…" style="width:100%" autocomplete="off"><div id="pl" style="margin-top:8px;max-height:300px;overflow:auto"></div>`);show(m);const q=$("pq");q.value="";q.focus();
 const draw=()=>{const t=q.value.toLowerCase();shown=acts().filter(a=>a.n.toLowerCase().includes(t));sel=Math.min(sel,Math.max(0,shown.length-1));$("pl").innerHTML="";shown.forEach((a,i)=>{const d=document.createElement("div");d.className="hi"+(i===sel?" sel":"");d.innerHTML=`${esc(a.n)} <small style="display:inline">${a.h||""}</small>`;d.onclick=()=>run(a);$("pl").append(d)})};
 const run=a=>{m.style.display="none";a.f()};
 if(!m.dataset.i){m.dataset.i=1;q.oninput=()=>{sel=0;draw()};q.onkeydown=e=>{if(e.key==="ArrowDown"){sel=Math.min(sel+1,shown.length-1);draw();e.preventDefault()}else if(e.key==="ArrowUp"){sel=Math.max(sel-1,0);draw();e.preventDefault()}else if(e.key==="Enter"&&shown[sel])run(shown[sel])}}
 sel=0;draw()}
bK.onclick=openPal;
addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPal()}if(e.key==="Escape")document.querySelectorAll(".modal").forEach(x=>x.style.display="none")});
addEventListener("offline",()=>toast("You are offline: app shell works, translation needs internet"));addEventListener("online",()=>toast("Back online"));
renderSw();
window.OLUI={modal,show,vaultPut,vaultGet,V,exportLog,openBatch};
})();
