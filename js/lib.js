/* OmniLingua AI: pure, unit-tested helpers (browser global OLLib + Node module) */
(function(root){
 const detect=k=>/^gsk_/.test(k)?"groq":/^sk-ant-/.test(k)?"anthropic":/^sk-or-/.test(k)?"openrouter":/^AIza/.test(k)?"gemini":/^xai-/.test(k)?"xai":/^sk-/.test(k)?"openai":null;
 const chunk=(t,n=2500)=>{const out=[];let cur="";for(const p of t.split(/\n{2,}/)){if((cur+p).length>n&&cur){out.push(cur);cur=""}cur+=(cur?"\n\n":"")+p}if(cur)out.push(cur);return out};
 /* Privacy Shield: mask personal identifiers before text leaves the browser */
 const RULES=[/[\w.+-]+@[\w-]+\.[\w.-]+/g,/\b\d{4}\s\d{4}\s\d{4}\b/g,/\b[A-Z]{5}\d{4}[A-Z]\b/g,/\b(?:\d[ -]?){13,16}\b/g,/(?<![\w.])(?:\+\d{1,3}[\s-]?)?(?:\d{10}|\d{5}[\s-]\d{5}|\d{3}[\s-]\d{3}[\s-]\d{4})(?![\w.])/g,/\b(?:\d{1,3}\.){3}\d{1,3}\b/g];
 function maskPII(text){const map=[];for(const r of RULES)text=text.replace(r,m=>{map.push(m);return `[[P${map.length}]]`});return{text,map}}
 const unmaskPII=(t,m)=>t.replace(/\[\[\s*P(\d+)\s*\]\]/g,(x,i)=>m.map[i-1]??x);
 const csvFirstCol=l=>{const m=l.match(/^"((?:[^"]|"")*)"/);return m?m[1].replace(/""/g,'"'):l.split(",")[0].trim()};
 const toCSV=rows=>rows.map(r=>r.map(c=>`"${String(c??"").replace(/"/g,'""')}"`).join(",")).join("\n");
 const api={detect,chunk,maskPII,unmaskPII,csvFirstCol,toCSV};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.OLLib=api;
})(typeof window!=="undefined"?window:globalThis);
