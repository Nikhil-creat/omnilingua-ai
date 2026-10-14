const test=require("node:test"),assert=require("node:assert");
const L=require("../js/lib.js");
test("detect provider from key prefix",()=>{
 assert.equal(L.detect("gsk_abc"),"groq");assert.equal(L.detect("sk-ant-api03-x"),"anthropic");
 assert.equal(L.detect("sk-or-v1-x"),"openrouter");assert.equal(L.detect("AIzaSyX"),"gemini");
 assert.equal(L.detect("xai-x"),"xai");assert.equal(L.detect("sk-proj-x"),"openai");assert.equal(L.detect("nope"),null)});
test("chunk keeps paragraphs and respects size",()=>{
 const t=Array.from({length:6},(_,i)=>"p"+i+"x".repeat(900)).join("\n\n");const c=L.chunk(t,2000);
 assert.ok(c.length>=3);assert.equal(c.join("\n\n"),t)});
test("PII mask/unmask round trip",()=>{
 const s="Mail ravi@example.com or call +91 9876543210, PAN ABCDE1234F, Aadhaar 1234 5678 9012";
 const m=L.maskPII(s);assert.ok(!/ravi@|9876543210|ABCDE1234F|1234 5678/.test(m.text));assert.equal(m.map.length,4);
 assert.equal(L.unmaskPII(m.text,m),s)});
test("dates and short numbers are not masked",()=>{
 const s="Meeting on 2026-10-13 20:25 for 12345 items";assert.equal(L.maskPII(s).text,s)});
test("unmask tolerates spacing from the model",()=>{
 const m=L.maskPII("a@b.co");assert.equal(L.unmaskPII("x [[ P1 ]] y",m),"x a@b.co y")});
test("CSV helpers",()=>{
 assert.equal(L.csvFirstCol('"Hello, world",x'),"Hello, world");assert.equal(L.csvFirstCol("a,b"),"a");
 assert.equal(L.toCSV([["a",'say "hi"']]),'"a","say ""hi"""')});
