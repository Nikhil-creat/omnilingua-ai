"use strict";
/* OmniLingua AI v4: Edge AI (on-device), neural RAG, AI-vision OCR, face-to-face interpreter,
   live captions, MQM quality audit, term mining, passphrase vault (PBKDF2), agent-flow viz, PWA share/backup */
(()=>{
const U=window.OLUI,X=window.OLX={q:null,fi:-1,edgeOK:"Translator" in self};
const c2=n=>SC(n).slice(0,2),nameOf=c=>(L.find(l=>l[1].slice(0,2)===String(c).slice(0,2))||[c])[0];

/* ---------- Edge AI: browser built-in on-device Translator + LanguageDetector ---------- */
async function edgeLang(t){if(!("LanguageDetector" in self))throw new Error("Pick a source language: auto-detect isn't available in this browser");const d=await LanguageDetector.create();return(await d.detect(t.slice(0,500)))[0].detectedLanguage}
async function edgeEngine(sl,tl,onp){const a=await Translator.availability({sourceLanguage:sl,targetLanguage:tl});if(a==="unavailable")throw new Error(`On-device model for ${sl}→${tl} isn't available in this browser`);return Translator.create({sourceLanguage:sl,targetLanguage:tl,monitor(m){m.addEventListener("downloadprogress",e=>onp&&onp(Math.round(e.loaded*100)))}})}
X.edgeQuick=async(text,to,from="auto")=>(await edgeEngine(from==="auto"?await edgeLang(text):c2(from),c2(to))).translate(text);
X.edge=async(raw,from,to)=>{
 if(!X.edgeOK){toast("On-device translation isn't supported here → using Fast mode");setMode("fast");return translate()}
 $("go").disabled=true;$("out").textContent="";$("extra").innerHTML="";$("multi").innerHTML="";
 try{setPips(1);$("steps").textContent="🛰 Edge AI: detecting language…";const sl=from==="auto"?await edgeLang(raw):c2(from);
  const t=await edgeEngine(sl,c2(to),p=>$("steps").textContent=`⬇ Downloading on-device model ${p}% (one-time)`);
  $("steps").textContent="🛰 Translating on-device…";let out="";for(const p of chunk(raw,1500)){out+=(out?"\n\n":"")+await t.translate(p);$("out").textContent=out}
  $("out").dir=["Arabic","Urdu"].includes(to)?"rtl":"ltr";setPips(5,[1]);$("dom").textContent="domain: —";$("reg").textContent="mode: edge";$("conf").style.width="0";$("cs").textContent="on-device · private";
  $("steps").textContent="✅ Done · Edge AI: on-device, no data left your browser, no API key needed";
  last={src:raw,out,from:nameOf(sl),to,dom:"",conf:null,id:Date.now()};addHist(last)
 }catch(e){$("out").textContent="⚠ "+e.message;$("steps").textContent="Edge error";setPips(-1)}
 $("go").disabled=false};
if(!X.edgeOK)document.querySelector('#modes [data-m="edge"]')?.remove();if(S.mode==="edge"&&!X.edgeOK)setMode("agentic");

/* ---------- Neural semantic search (transformers.js, on-device, opt-in) ---------- */
const N={pipe:null,on:false,busy:false};
async function neuralOn(){if(N.pipe){N.on=true;return}if(N.busy)return;N.busy=true;toast("Loading on-device embedding model (~25MB, cached after first load)…");
 try{const m=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.2");m.env.allowLocalModels=false;N.pipe=await m.pipeline("feature-extraction","Xenova/all-MiniLM-L6-v2",{dtype:"q8"});N.on=true;toast("🧬 Neural semantic search ON")}
 catch(e){N.on=false;S.neural=false;saveS();$("neu").checked=false;toast("Neural model failed: "+String(e.message||e).slice(0,60))}N.busy=false}
const emb=async t=>Array.from((await N.pipe(t.slice(0,400),{pooling:"mean",normalize:true})).data);
X.prep=async text=>{X.q=null;if(!N.on)return;try{let n=0;for(const e of TM)if(!e.nv&&n++<400)e.nv=await emb(e.t);X.q=await emb(text)}catch{X.q=null}};
const _tr=translate;translate=async()=>{if(N.on)await X.prep($("in").value);return _tr()};$("go").onclick=()=>translate();

/* ---------- AI Vision OCR (multimodal models) ---------- */
const VIS=/gpt-4o|gpt-4\.1|gpt-5|gemini|claude|llama-4|vision|\bvl\b|pixtral|grok-4/i;
X.visionModel=()=>VIS.test($("model").value)?$("model").value:MODELS.find(m=>VIS.test(m))||null;
const shrink=f=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>{const k=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);res(c.toDataURL("image/jpeg",.85))};im.onerror=rej;im.src=URL.createObjectURL(f)});
const conv=ms=>ms.map(m=>Array.isArray(m.content)?{...m,content:m.content.map(p=>p.type==="image_url"?{type:"image",source:{type:"base64",media_type:"image/jpeg",data:p.image_url.url.split(",")[1]}}:p)}:m);
const _l2=llm;llm=(m,o,mo,r)=>_l2(P==="anthropic"?conv(m):m,o,mo,r);
const _oi=ocrImage;ocrImage=async f=>{const vm=$("vOcr").checked&&KEY&&P?X.visionModel():null;if(!vm)return _oi(f);
 $("oimg").src=URL.createObjectURL(f);$("sb").style.display="block";$("grid").style.display=$("sl").style.display="block";$("ocrs").textContent="🔮 AI Vision reading…";const c=$("ov");c.getContext("2d").clearRect(0,0,c.width,c.height);
 try{const url=await shrink(f);const t=await llm([{role:"user",content:[{type:"text",text:"Transcribe ALL visible text in this image exactly as written (any script, including handwriting), preserving line breaks. Output only the text."},{type:"image_url",image_url:{url}}]}],{temp:0},vm);$("in").value=t.trim();upd();$("ocrs").textContent="✅ AI Vision OCR via "+vm}
 catch(e){toast("Vision OCR failed → classic OCR");$("grid").style.display=$("sl").style.display="none";return _oi(f)}
 $("grid").style.display=$("sl").style.display="none"};

/* ---------- Face-to-face interpreter ---------- */
function openConv(){const m=U.modal("mConv","🗣 Face-to-face interpreter",`<small>Tap your button, speak, and the other person hears the translation.</small><div class="row" style="margin:8px 0"><select id="cvA"></select><span>⇄</span><select id="cvB"></select></div><div id="cvLog" style="height:240px;overflow:auto;padding:4px"></div><div class="row" style="margin-top:8px"><button class="pri" id="cvMa" style="flex:1;padding:14px">🎙 A speaks</button><button class="pri" id="cvMb" style="flex:1;padding:14px">🎙 B speaks</button></div><label class="row m"><input type="checkbox" id="cvSpeak" checked> Speak translations aloud</label>`);U.show(m);
 if(m.dataset.i)return;m.dataset.i=1;L.forEach(l=>{$("cvA").add(new Option(l[0],l[0]));$("cvB").add(new Option(l[0],l[0]))});$("cvA").value="English";$("cvB").value=$("tgt").value==="English"?"Hindi":$("tgt").value;let rec=null;
 const bubble=(side,src)=>{const d=document.createElement("div");d.className="card";if(side==="b"){d.style.marginLeft="auto";d.style.borderColor="var(--p)"}d.style.width="88%";const s=document.createElement("small");s.textContent=src;const t=document.createElement("div");t.textContent="…";d.append(s,t);$("cvLog").append(d);$("cvLog").scrollTop=1e9;return t};
 const listen=side=>{if(!SR)return toast("Speech recognition isn't supported in this browser");const from=$(side==="a"?"cvA":"cvB").value,to=$(side==="a"?"cvB":"cvA").value,btn=$(side==="a"?"cvMa":"cvMb"),lbl=side==="a"?"🎙 A speaks":"🎙 B speaks";try{rec&&rec.abort()}catch{}
  rec=new SR();rec.lang=SC(from);rec.interimResults=true;rec.continuous=false;btn.textContent="🎙 Listening…";
  rec.onresult=async e=>{const r=e.results[e.results.length-1];btn.textContent="🎙 "+r[0].transcript.slice(-24);if(!r.isFinal)return;const t=bubble(side,r[0].transcript);try{const out=await quick(r[0].transcript,to);t.textContent=out;if($("cvSpeak").checked)speak(out,to)}catch(x){t.textContent="⚠ "+x.message}};
  rec.onend=()=>btn.textContent=lbl;rec.onerror=e=>toast("Mic: "+e.error);rec.start()};
 $("cvMa").onclick=()=>listen("a");$("cvMb").onclick=()=>listen("b")}

/* ---------- Live captions ---------- */
function openCaps(){const m=U.modal("mCaps","📺 Live captions",`<div class="row"><select id="cpS"></select>→<select id="cpT"></select></div><div class="row" style="margin:8px 0"><button class="pri" id="cpGo">▶ Start</button><label class="row m">Size <input type="range" id="cpZ" min="18" max="56" value="30"></label></div><div id="cpOut" style="min-height:220px;max-height:50vh;overflow:auto;padding:12px;border-radius:12px;background:#000a"></div><small id="cpI"></small>`);U.show(m);
 if(m.dataset.i)return;m.dataset.i=1;$("cpS").add(new Option("Auto (device language)","auto"));L.forEach(l=>{$("cpS").add(new Option(l[0],l[0]));$("cpT").add(new Option(l[0],l[0]))});$("cpT").value=$("tgt").value;let rec=null,on=false,wl=null;
 $("cpZ").oninput=e=>$("cpOut").style.fontSize=e.target.value+"px";$("cpOut").style.fontSize="30px";
 $("cpGo").onclick=async()=>{if(on){on=false;try{rec.abort()}catch{}try{wl&&wl.release()}catch{}$("cpGo").textContent="▶ Start";return}
  if(!SR)return toast("Speech recognition isn't supported in this browser");try{wl=await navigator.wakeLock.request("screen")}catch{}
  on=true;$("cpGo").textContent="⏹ Stop";const start=()=>{rec=new SR();rec.continuous=true;rec.interimResults=true;rec.lang=$("cpS").value==="auto"?navigator.language||"en-US":SC($("cpS").value);
   rec.onresult=async e=>{let it="";for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal){const src=r[0].transcript.trim();if(!src)continue;const d=document.createElement("div");d.style.marginBottom="10px";const t=document.createElement("div");t.textContent="…";const s=document.createElement("small");s.textContent=src;d.append(t,s);$("cpOut").append(d);while($("cpOut").children.length>8)$("cpOut").firstChild.remove();$("cpOut").scrollTop=1e9;quick(src,$("cpT").value).then(o=>t.textContent=o).catch(x=>t.textContent="⚠ "+x.message)}else it+=r[0].transcript}$("cpI").textContent=it};
   rec.onend=()=>{if(on)try{start()}catch{}};rec.onerror=e=>{if(e.error!=="no-speech")toast("Mic: "+e.error)};rec.start()};start()}}

/* ---------- MQM quality audit + term mining ---------- */
const bq=document.createElement("button");bq.id="bQual";bq.textContent="🧪 Quality";const bt2=document.createElement("button");bt2.id="bTerms";bt2.textContent="🧠 Terms";$("savetm").before(bq,bt2);
bq.onclick=async()=>{if(!need())return;const ex=$("extra");ex.innerHTML='<div class="card">🧪 Auditing translation (MQM)…</div>';
 try{const j=J(await llm([{role:"system",content:`You are an MQM translation auditor. Compare SOURCE and TRANSLATION (${last.to}). Return ONLY JSON {"errors":[{"type":"accuracy|fluency|terminology|style|omission","severity":"minor|major|critical","span":"exact text in the translation","fix":"corrected text","why":"short reason"}],"summary":"one sentence"}. Use an empty errors array if the translation is good.`},{role:"user",content:`SOURCE:\n${last.src.slice(0,3000)}\n\nTRANSLATION:\n${last.out.slice(0,4000)}`}],{json:true,temp:0}));
  const errs=Array.isArray(j.errors)?j.errors.slice(0,12):[],sc=OLLib.mqmScore(errs,last.out.split(/\s+/).length);ex.innerHTML="";const c=document.createElement("div");c.className="card";
  const h=document.createElement("b");h.textContent=`🧪 MQM score ${sc}/100`;c.append(h,document.createTextNode("\n"+(j.summary||"")+"\n"+(errs.length?errs.map(e=>`• [${e.severity}/${e.type}] "${e.span}" → ${e.fix}${e.why?" ("+e.why+")":""}`).join("\n"):"No errors found ✅")));ex.append(c);$("conf").style.width=sc+"%";$("cs").textContent=sc+"% MQM";
  if(errs.length){const b=document.createElement("button");b.textContent="✨ Apply fixes";b.onclick=async()=>{b.disabled=true;try{const o=await llm([{role:"system",content:`Apply the listed fixes and return ONLY the corrected ${last.to} translation.`},{role:"user",content:`SOURCE:\n${last.src}\n\nTRANSLATION:\n${last.out}\n\nFIXES: ${JSON.stringify(errs)}`}],{temp:0});$("out").textContent=o;last.out=o;toast("Fixes applied")}catch(e){toast(e.message)}b.disabled=false};c.append(document.createElement("br"),b)}
 }catch(e){ex.textContent="⚠ "+e.message}};
bt2.onclick=async()=>{if(!need())return;const ex=$("extra");ex.innerHTML='<div class="card">🧠 Mining terminology…</div>';
 try{const j=J(await llm([{role:"system",content:'Extract up to 12 domain-specific terms or named entities from SOURCE with the equivalent used in TRANSLATION. Return ONLY JSON {"terms":[{"s":"","t":""}]}'},{role:"user",content:`SOURCE:\n${last.src.slice(0,3000)}\n\nTRANSLATION:\n${last.out.slice(0,4000)}`}],{json:true,temp:0}));
  const ts=(j.terms||[]).filter(x=>x.s&&x.t);ex.innerHTML="";const c=document.createElement("div");c.className="card";c.append(Object.assign(document.createElement("b"),{textContent:"🧠 Terms found"}));
  ts.forEach((x,i)=>{const l=document.createElement("label");l.className="row";const k=document.createElement("input");k.type="checkbox";k.checked=true;k.dataset.i=i;l.append(k,document.createTextNode(`${x.s} → ${x.t}`));c.append(l)});
  if(ts.length){const b=document.createElement("button");b.className="pri";b.textContent="＋ Add selected to TM";b.onclick=()=>{const sel=[...c.querySelectorAll("input:checked")].map(k=>ts[+k.dataset.i]);addTM(sel.map(x=>`${x.s} => ${x.t}`));toast(sel.length+" terms added");ex.innerHTML=""};c.append(b)}else c.append(document.createTextNode("\nNo terms found."));ex.append(c)
 }catch(e){ex.textContent="⚠ "+e.message}};

/* ---------- passphrase vault lock (PBKDF2 250k + AES-GCM) ---------- */
const _ck=ck;let lockKey=null,up=null;const isLock=()=>!!LS.g("ol_lock",0);
ck=async()=>isLock()?(lockKey||await unlockUI()):_ck();
const derive=async(pw,salt)=>crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:250000,hash:"SHA-256"},await crypto.subtle.importKey("raw",te.encode(pw),"PBKDF2",false,["deriveKey"]),{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
function unlockUI(){if(up)return up;up=new Promise(res=>{const o=document.createElement("div");o.className="lockov";o.innerHTML='<div class="g"><h3 style="margin-top:0">🔐 OmniLingua locked</h3><small>Enter your passphrase to unlock your API keys.</small><input id="lkIn" type="password" style="width:100%;margin:10px 0" autocomplete="current-password" aria-label="Passphrase"><div id="lkErr" class="mono" style="color:var(--bad)"></div><button class="pri" id="lkGo" style="width:100%;margin-top:8px">Unlock</button></div>';document.body.append(o);
  const go=async()=>{try{const k=await derive($("lkIn").value,ub(LS.g("ol_salt","")));const[i,c]=LS.g("ol_chk","").split(".");if(td.decode(await crypto.subtle.decrypt({name:"AES-GCM",iv:ub(i)},k,ub(c)))!=="OK")throw 0;lockKey=k;o.remove();up=null;res(k)}catch{$("lkErr").textContent="Wrong passphrase"}};
  $("lkGo").onclick=go;$("lkIn").onkeydown=e=>{if(e.key==="Enter")go()};setTimeout(()=>$("lkIn").focus(),50)});return up}
async function reseal(act,vault){LS.s("ol_vault",{});for(const[p,k]of Object.entries(vault))if(k)await U.vaultPut(p,k);if(act)await saveKey(act)}
async function enableLock(){if(isLock())return toast("Passphrase lock is already on");const pw=prompt("Set a passphrase (min 8 characters). If you forget it you must remove the key and enter it again.");if(!pw||pw.length<8)return toast("Passphrase too short");
 const act=KEY,vault={};for(const p of Object.keys(U.V()))vault[p]=await U.vaultGet(p);
 const salt=crypto.getRandomValues(new Uint8Array(16));lockKey=await derive(pw,salt);const iv=crypto.getRandomValues(new Uint8Array(12));
 LS.s("ol_salt",b64(salt));LS.s("ol_chk",b64(iv)+"."+b64(await crypto.subtle.encrypt({name:"AES-GCM",iv},lockKey,te.encode("OK"))));LS.s("ol_lock",1);
 await reseal(act,vault);LS.r("ol_k");toast("🔐 Passphrase lock enabled")}
async function disableLock(){if(!isLock())return toast("Lock is not enabled");if(!confirm("Remove passphrase lock? Keys will be stored with the device-only key again."))return;
 const act=KEY,vault={};for(const p of Object.keys(U.V()))vault[p]=await U.vaultGet(p);["ol_lock","ol_salt","ol_chk","ol_k"].forEach(k=>LS.r(k));lockKey=null;await reseal(act,vault);toast("🔓 Lock removed")}
async function lockNow(){if(!isLock())return toast("Set a passphrase lock first");KEY="";P=null;lockKey=null;window.OLX_UNLOCKED=false;await connect();await unlockUI();window.OLX_UNLOCKED=true;await loadKey()}
if(isLock())unlockUI().then(async()=>{window.OLX_UNLOCKED=true;await loadKey()});
let idle;const bump=()=>{clearTimeout(idle);if(isLock()&&KEY)idle=setTimeout(lockNow,10*60*1000)};["pointerdown","keydown"].forEach(ev=>addEventListener(ev,bump));

/* ---------- backup / restore / share ---------- */
const SECRET=["ol_v","ol_vault","ol_k","ol_chk","ol_salt","ol_lock"];
const backup=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith("ol_")&&!SECRET.includes(k))o[k]=localStorage.getItem(k)}dl("omnilingua-backup.json",JSON.stringify({v:4,data:o},null,2),"application/json")};
const wa=()=>{if(need())open("https://wa.me/?text="+encodeURIComponent(last.out),"_blank")};

/* ---------- agent-flow visualisation, spotlight, sound/haptics ---------- */
const cv=document.createElement("canvas");cv.id="flow";cv.width=600;cv.height=64;cv.className="w";cv.setAttribute("aria-hidden","true");$("pips").before(cv);const g=cv.getContext("2d");
const _sp=setPips;setPips=(a,d)=>{X.fi=a;_sp(a,d)};let ph=0;const xs=[0,1,2,3,4].map(i=>60+i*120);
const draw=()=>{ph+=.025;g.clearRect(0,0,600,64);const a=X.fi;
 for(let i=0;i<4;i++){g.strokeStyle=a>i?ACC:"#ffffff22";g.globalAlpha=a>i?.8:1;g.lineWidth=2;g.beginPath();g.moveTo(xs[i]+12,32);g.lineTo(xs[i+1]-12,32);g.stroke()}g.globalAlpha=1;
 if(a>=1&&a<=4){const k=ph%1,x=xs[a-1]+12+k*(xs[a]-xs[a-1]-24);g.fillStyle="#fff";g.shadowColor=ACC;g.shadowBlur=14;g.beginPath();g.arc(x,32,3.5,0,7);g.fill();g.shadowBlur=0}
 xs.forEach((x,i)=>{const act=i===a,done=i<a||a===5;g.beginPath();g.arc(x,32,act?10+Math.sin(ph*6)*2:8,0,7);g.fillStyle=done?ACC:act?"#fff":"#ffffff22";g.shadowColor=ACC;g.shadowBlur=act||done?16:0;g.fill();g.shadowBlur=0});
 if(!matchMedia("(prefers-reduced-motion:reduce)").matches)requestAnimationFrame(draw)};draw();
document.querySelectorAll(".pan").forEach(p=>p.addEventListener("pointermove",e=>{const r=p.getBoundingClientRect();p.style.setProperty("--mx",e.clientX-r.left+"px");p.style.setProperty("--my",e.clientY-r.top+"px")}));
let ac;const fx=()=>{if(!S.fx)return;try{navigator.vibrate&&navigator.vibrate(18);ac=ac||new AudioContext();const o=ac.createOscillator(),gn=ac.createGain();o.frequency.value=880;o.connect(gn);gn.connect(ac.destination);gn.gain.setValueAtTime(.06,ac.currentTime);gn.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+.18);o.start();o.stop(ac.currentTime+.2)}catch{}};
const _ah=addHist;addHist=e=>{_ah(e);fx()};

/* ---------- UI injection ---------- */
const vl=document.createElement("label");vl.className="row m";vl.innerHTML='<input type="checkbox" id="vOcr"> 🔮 AI Vision OCR (handwriting & complex scripts)';$("ocrLang").after(vl);$("vOcr").checked=!!S.vocr;$("vOcr").onchange=e=>{S.vocr=e.target.checked;saveS()};
const box=document.createElement("div");box.innerHTML='<hr style="border-color:#fff2;margin:14px 0"><div class="m" style="margin-bottom:6px">v4 · Edge AI, security & tools</div><label class="row"><input type="checkbox" id="neu"> 🧬 Neural semantic glossary search (on-device, ~25MB)</label><label class="row"><input type="checkbox" id="fxT"> 🔊 Sound &amp; haptics</label><div class="row"><button id="lkOn">🔐 Passphrase lock</button><button id="lkOff">🔓 Remove lock</button></div><div class="row"><button id="bkB">💾 Backup</button><label class="btn">♻ Restore<input type="file" id="bkR" accept=".json" hidden></label></div><div class="row"><button id="sConv">🗣 Interpreter</button><button id="sCaps">📺 Captions</button></div>';
$("wipe").parentElement.before(box);
$("neu").checked=!!S.neural;$("neu").onchange=async e=>{S.neural=e.target.checked;saveS();if(S.neural)await neuralOn();else N.on=false};if(S.neural)neuralOn();
$("fxT").checked=!!S.fx;$("fxT").onchange=e=>{S.fx=e.target.checked;saveS();fx()};
$("lkOn").onclick=enableLock;$("lkOff").onclick=disableLock;$("bkB").onclick=backup;$("sConv").onclick=openConv;$("sCaps").onclick=openCaps;
$("bkR").onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());Object.entries(j.data||{}).forEach(([k,v])=>{if(k.startsWith("ol_")&&!SECRET.includes(k))localStorage.setItem(k,v)});location.reload()}catch{toast("Invalid backup file")}};
window.OLX_ACTS=()=>[{n:"Face-to-face interpreter",f:openConv},{n:"Live captions",f:openCaps},{n:"Quality audit (MQM)",f:()=>bq.click()},{n:"Extract terminology to TM",f:()=>bt2.click()},{n:"Set passphrase lock",f:enableLock},{n:"Lock vault now",f:lockNow},{n:"Remove passphrase lock",f:disableLock},{n:"Backup workspace",f:backup},{n:"Restore workspace",f:()=>$("bkR").click()},{n:"Share translation on WhatsApp",f:wa},{n:"Mode: edge (on-device)",f:()=>X.edgeOK?setMode("edge"):toast("Not supported in this browser")},{n:"Toggle neural glossary search",f:()=>$("neu").click()},{n:"Toggle sound & haptics",f:()=>$("fxT").click()}];

/* ---------- PWA entry points: share target + shortcuts ---------- */
const q=new URLSearchParams(location.search),sh=[q.get("title"),q.get("text"),q.get("url")].filter(Boolean).join("\n");if(sh){$("in").value=sh;upd();toast("Shared text received")}
const act=q.get("action");if(act==="conversation")setTimeout(openConv,400);if(act==="captions")setTimeout(openCaps,400);if(act==="batch")setTimeout(U.openBatch,400);
})();
