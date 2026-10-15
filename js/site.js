"use strict";
/* Translator AI: site shell behaviour (menu, reveal, scrollspy, counters, demo, contact, vCard, legal) */
(()=>{
const $=id=>document.getElementById(id),reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;
document.documentElement.classList.add("js-rv");
const bg=$("burger"),mn=$("menu");
bg.onclick=()=>{const o=mn.classList.toggle("open");bg.setAttribute("aria-expanded",String(o))};
mn.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mn.classList.remove("open");bg.setAttribute("aria-expanded","false")}));
/* reveal on scroll */
if("IntersectionObserver" in window){
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll(".rv").forEach(el=>io.observe(el));
 const links=[...mn.querySelectorAll("a")],sp=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle("act",a.getAttribute("href")==="#"+e.target.id))}),{rootMargin:"-45% 0px -50% 0px"});
 links.map(a=>document.querySelector(a.getAttribute("href"))).filter(Boolean).forEach(s=>sp.observe(s));
}else document.querySelectorAll(".rv").forEach(el=>el.classList.add("in"));
/* animated counters */
document.querySelectorAll("[data-n]").forEach(el=>{const t=+el.dataset.n;if(reduce||!t){el.textContent=t;return}let v=0;const step=()=>{v=Math.min(t,v+Math.max(1,Math.ceil(t/30)));el.textContent=v;if(v<t)setTimeout(step,45)};setTimeout(step,500)});
/* hero live demo: rotating translations (static samples, no API) */
const D=[["Hindi","नमस्ते, आप कैसे हैं?"],["Telugu","హలో, మీరు ఎలా ఉన్నారు?"],["Spanish","Hola, ¿cómo estás?"],["Japanese","こんにちは、お元気ですか？"],["French","Bonjour, comment allez-vous ?"],["German","Hallo, wie geht es dir?"],["Korean","안녕하세요, 어떻게 지내세요?"],["Arabic","مرحبًا، كيف حالك؟"]];let di=0;
if(!reduce)setInterval(()=>{const o=$("dmOut");o.classList.add("fade");setTimeout(()=>{di=(di+1)%D.length;$("dmLang").textContent=D[di][0];o.textContent=D[di][1];o.dir=D[di][0]==="Arabic"?"rtl":"ltr";o.classList.remove("fade")},350)},2800);
/* contact form -> mailto (no backend) */
$("cform").addEventListener("submit",e=>{e.preventDefault();const b=`${$("cfM").value}\n\n— ${$("cfN").value} (${$("cfE").value})`;location.href="mailto:sriramojunikhil66@gmail.com?subject="+encodeURIComponent("Translator AI: message from "+$("cfN").value)+"&body="+encodeURIComponent(b)});
/* save contact (vCard; email and public links only) */
$("vcf").onclick=()=>{const v="BEGIN:VCARD\nVERSION:3.0\nFN:Nikhil Chary Sriramoju\nN:Sriramoju;Nikhil Chary;;;\nEMAIL:sriramojunikhil66@gmail.com\nURL:https://github.com/Nikhil-creat\nURL:https://in.linkedin.com/in/nikhil-chary-sriramoju-95041b38a\nNOTE:AI/ML & Full-Stack Developer · B.Tech CSE · Thorrur, Telangana, India\nEND:VCARD";
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([v],{type:"text/vcard"}));a.download="Nikhil-Chary-Sriramoju.vcf";a.click()};
/* legal dialogs */
const LEGAL={privacy:["🔒 Privacy","<p>Translator AI has no server and no analytics or tracking. Your text, history, glossary and settings stay in your browser's storage.</p><p>When you use a cloud mode, your text is sent directly from your browser to the AI provider you chose, under that provider's own terms. Edge mode keeps everything on your device. API keys are stored encrypted in your browser and are never sent anywhere except to their provider.</p><p>Share links contain your source text inside the link itself.</p>"],terms:["📄 Terms of use","<p>This software is provided under the MIT License, as is, without warranty. You are responsible for your API keys, usage costs and for complying with your AI provider's terms.</p><p>Do not use it for unlawful content. The developer is not liable for losses arising from its use.</p>"],disclaimer:["⚠ AI disclaimer","<p>AI translations can be inaccurate, incomplete or biased. Always review important text. Do not rely on this tool alone for legal, medical, safety-critical or official certified translations.</p>"]};
document.querySelectorAll("[data-legal]").forEach(b=>b.onclick=()=>{const k=b.dataset.legal,[t,h]=LEGAL[k];const m=OLUI.modal("mLegal"+k,t,h);OLUI.show(m)});
/* back to top */
const tt=$("toTop");addEventListener("scroll",()=>{tt.style.display=scrollY>700?"inline-flex":"none"},{passive:true});tt.onclick=()=>scrollTo({top:0,behavior:reduce?"auto":"smooth"});
})();
