"use client";
import React, { useMemo, useState } from "react";

interface Exercise { id: string; prompt: string; inputType?: "number"|"text"; correct: (user:string)=>boolean; hint?: string; solution?: string; }
interface Section { id: string; title: string; theory: string; generator?: (n?:number)=>Exercise[]; }
interface Chapter { id: string; title: string; description: string; sections: Section[]; }
interface Subject { id: string; title: string; description: string; chapters: Chapter[]; }

const randInt = (a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
const pick = <T,>(arr:T[])=>arr[Math.floor(Math.random()*arr.length)];
const eqNum = (expect:number, got:string)=>{ const v = Number(String(got).replace(",",".")); return Math.abs(v-expect)<1e-9; };

function genNegAddSub(n=8): Exercise[]{ const ex:Exercise[]=[];
  for(let i=0;i<n;i++){ const a=randInt(-20,20), b=randInt(-20,20); const op=pick(["+","-"]); const res=op==="+"?a+b:a-b; const txt=`${a} ${op} ${b} = ?`;
    ex.push({id:`neg-${i}`, prompt:txt, inputType:"number", correct:(u)=>eqNum(res,u), hint:"Gebruik de getallenlijn (min=links, plus=rechts).", solution:txt.replace("?",String(res))});
  } return ex; }
function genNegMulDiv(n=6): Exercise[]{ const ex:Exercise[]=[];
  for(let i=0;i<n;i++){ const a=pick([-12,-9,-8,-6,-4,-3,-2,-1,1,2,3,4,6,8,9,12]); const b=pick([-12,-9,-8,-6,-4,-3,-2,-1,1,2,3,4,6,8,9,12]);
    const op=pick(["×","÷"]); let res:number, A=a; if(op==="×"){res=a*b;} else {res=Math.trunc(a/b); A=res*b;}
    const txt = op==="×"?`${a} × ${b} = ?`:`${A} ÷ ${b} = ?`;
    ex.push({id:`negmd-${i}`, prompt:txt, inputType:"number", correct:(u)=>eqNum(res,u), hint:"min×min=plus; plus×min=min.", solution:txt.replace("?",String(res))});
  } return ex; }
function genCoordsRead(n=6): Exercise[]{ const ex:Exercise[]=[];
  for(let i=0;i<n;i++){ const x=randInt(-5,5), y=randInt(-5,5);
    ex.push({id:`coord-${i}`, prompt:`Wat zijn de coördinaten van P? (x=${x}, y=${y})`, inputType:"text", correct:(u)=>{
      const [ux,uy]=(u||"").replace(/[()\\s]/g,"").split(","); return eqNum(x, ux??"") && eqNum(y, uy??"");
    }, hint:"Volgorde: (x, y)", solution:`(${x}, ${y})`});
  } return ex; }
function genRounding(n=6): Exercise[]{ const ex:Exercise[]=[];
  for(let i=0;i<n;i++){ const v=Math.random()*999+1, d=pick([0,1,2]); const res=Number(v.toFixed(d));
    ex.push({id:`round-${i}`, prompt:`Rond ${v.toFixed(3)} af op ${d} decimalen.`, inputType:"number", correct:(u)=>eqNum(res,u), hint:"5-9 omhoog, 0-4 omlaag.", solution:String(res)});
  } return ex; }
function genRatioPrice(n=6): Exercise[]{ const ex:Exercise[]=[];
  for(let i=0;i<n;i++){ const prijs=randInt(2,9), aantal=pick([250,500,750,1000]), vraag=pick([100,200,300,400]); const per100=(prijs/aantal)*100; const res=Number((per100*(vraag/100)).toFixed(2));
    ex.push({id:`ratio-${i}`, prompt:`${aantal} ml kost €${prijs}. Wat kost ${vraag} ml?`, inputType:"number", correct:(u)=>eqNum(res,u), hint:"Reken naar per 1 of per 100.", solution:`€${res}`});
  } return ex; }
function genSolidsRecognize(n=6): Exercise[]{ const vormen=[
  {name:"kubus", has:"alle ribben even lang"}, {name:"balk", has:"rechthoekige vlakken"}, {name:"cilinder", has:"twee cirkelvlakken en een mantel"},
  {name:"kegel", has:"één cirkelvlak en een top"}, {name:"piramide", has:"grondvlak + driehoekige zijvlakken"}, {name:"prisma", has:"twee gelijke evenwijdige grondvlakken"}
]; const ex:Exercise[]=[]; for(let i=0;i<n;i++){ const v=pick(vormen);
  ex.push({id:`solid-${i}`, prompt:`Welke ruimtefiguur heeft: ${v.has}?`, inputType:"text", correct:(u)=>String(u).trim().toLowerCase().includes(v.name), hint:"Denk aan vlakken/ribben/hoekpunten.", solution:v.name});
} return ex; }

const TH = {
  h1: "📘 **Hoofdstuk 1 – Ruimtefiguren**

### 🌟 Inleiding
Ruimtefiguren zijn **3D-vormen**: ze hebben lengte, breedte én hoogte. Je ziet ze overal in het dagelijks leven (dozen, blikjes, ijsjes, dobbelstenen).

### 🧱 Voorbeelden
- **Kubus** — alle ribben even lang, 6 vierkante vlakken (dobbelsteen)  
- **Balk** — 6 rechthoekige vlakken (pak melk)  
- **Cilinder** — 2 cirkelvlakken + gebogen mantel (blikje)  
- **Kegel** — 1 cirkelvlak + top (ijshoorntje)  
- **Piramide** — veelhoeksgrondvlak + driehoekige zijvlakken + top  
- **Prisma** — twee gelijke, evenwijdige grondvlakken

### 🧩 Begrippen
- **Vlak**: plat onderdeel van het oppervlak  
- **Ribbe**: rand waar twee vlakken elkaar raken  
- **Hoekpunt**: punt waar ribben samenkomen

💡 **Voorbeeld kubus**: 6 vlakken, 12 ribben, 8 hoekpunten.

### ✂️ Uitslag
De **uitslag** is de opengevouwen versie van een ruimtefiguur (bijv. 6 vierkanten voor een kubus).

### ⚠️ Veelgemaakte fouten
- Cilinder met hoeken tekenen (cilinder heeft geen hoekpunten)  
- Kubus ↔︎ balk door elkaar halen  
- Top vergeten bij piramide

### ✅ Samenvatting
3D-figuren herken je aan vlakken, ribben en hoekpunten. Denk aan echte voorwerpen om ze snel te herkennen.
",
  h2s1: "📘 **Hoofdstuk 2 – Rekenen met negatieve getallen**

### 🌡️ Wat zijn negatieve getallen?
Negatieve getallen zijn kleiner dan nul en liggen **links** van 0 op de getallenlijn. Voorbeelden: temperatuur −5°C, saldo −€20, diepte −10 m.

### ➕ Optellen (naar rechts)
- \`-4 + 6 = 2\` → start op −4, 6 naar rechts
- \`3 + (-2) = 1\` → start op 3, 2 naar links

### ➖ Aftrekken (naar links)
- \`3 - 5 = -2\` → 5 naar links
- \`-2 - 4 = -6\` → vanaf −2 nog 4 naar links

🔄 **Min min wordt plus**: \`-3 - (-2) = -3 + 2 = -1\`

### 💡 Tips
- Werk met een getallenlijn bij twijfel
- Let goed op de tekens in de som

### ⚠️ Veelgemaakte fouten
- Richting omdraaien op de getallenlijn
- Dubbele min vergeten om te zetten naar plus
",
  h2s2: "📘 **Hoofdstuk 2 – Rekenen met negatieve getallen**

### ✖️ Vermenigvuldigen & ➗ Delen — tekenregels
| Tekens | Resultaat | Voorbeeld |
|---|---|---|
| + × + | + | 3 × 2 = 6 |
| − × + | − | −4 × 2 = −8 |
| + × − | − | 6 × −3 = −18 |
| − × − | + | −5 × −2 = 10 |

Dezelfde tekens → **plus**. Verschillende tekens → **min**.

### 💡 Tip
Bij delen gelden dezelfde tekenregels als bij vermenigvuldigen.
",
  h3: "📘 **Hoofdstuk 3 – Het assenstelsel**

### 🧭 Wat is het?
- **x-as**: horizontaal (links–rechts)  
- **y-as**: verticaal (omhoog–omlaag)  
- **(0, 0)**: oorsprong (nulpunt)

### 📍 Coördinaten (x, y)
Eerst **x**, dan **y**:  
- P(3, 2) → 3 rechts, 2 omhoog  
- Q(−4, 1) → 4 links, 1 omhoog  
- R(2, −3) → 2 rechts, 3 omlaag

### 🔢 Kwadranten
1️⃣ (+, +) · 2️⃣ (−, +) · 3️⃣ (−, −) · 4️⃣ (+, −)

### ⚠️ Veelgemaakte fouten
- Volgorde omdraaien (y, x)  
- Minteken vergeten → verkeerde kwadrant
",
  h4s1: "📘 **Hoofdstuk 4 – Getallen: afronden**

### 🔎 Regel
Kijk naar het eerst weg te laten cijfer:  
- **0–4** → naar **beneden**  
- **5–9** → naar **boven**

### 🧮 Voorbeelden
- 3,46 op 1 decimaal → **3,5**  
- 148 op tientallen → **150**

💡 Tip: schrijf op *waarop* je afrondt (decimalen, tientallen).
",
  h4s2: "📘 **Hoofdstuk 4 – Verhoudingen & prijs berekenen**

### ⚖️ Verhoudingen
Vergelijken van aantallen: 8 : 12 = 2 : 3 (vereenvoudig door te delen).

### 💶 Prijs per 1 / per 100
500 ml kost €3 → per 100 ml = €3 ÷ 5 = **€0,60**  
250 ml? → 2,5 × €0,60 = **€1,50**

💡 Tip: Maak een **verhoudingstabel** om fouten te voorkomen.
",
} as const;

const SUBJECTS: Subject[] = [
  { id:"wiskunde", title:"Wiskunde", description:"Getal & Ruimte — Leerjaar 1", chapters:[
    { id:"h1", title:"Hoofdstuk 1 – Ruimtefiguren", description:"Herkennen en beschrijven van 3D-figuren.", sections:[
      { id:"h1-s1", title:"Uitleg: Ruimtefiguren", theory: TH.h1, generator: genSolidsRecognize }
    ]},
    { id:"h2", title:"Hoofdstuk 2 – Rekenen met negatieve getallen", description:"Optellen/aftrekken en vermenigvuldigen/delen.", sections:[
      { id:"h2-s1", title:"Uitleg: Optellen & aftrekken", theory: TH.h2s1, generator: genNegAddSub },
      { id:"h2-s2", title:"Uitleg: Vermenigvuldigen & delen", theory: TH.h2s2, generator: genNegMulDiv }
    ]},
    { id:"h3", title:"Hoofdstuk 3 – Het assenstelsel", description:"Coördinaten (x, y) en kwadranten.", sections:[
      { id:"h3-s1", title:"Uitleg: Assenstelsel & coördinaten", theory: TH.h3, generator: genCoordsRead }
    ]},
    { id:"h4", title:"Hoofdstuk 4 – Getallen, afronden en verhoudingen", description:"Afronden en verhoudingen.", sections:[
      { id:"h4-s1", title:"Uitleg: Afronden", theory: TH.h4s1, generator: genRounding },
      { id:"h4-s2", title:"Uitleg: Verhoudingen & prijs", theory: TH.h4s2, generator: genRatioPrice }
    ]}
  ]},
  { id:"nederlands", title:"Nederlands", description:"Basis taalkunde & spelling (placeholder).", chapters:[
    { id:"nl1", title:"Woordsoorten & spelling", description:"Eenvoudige startoefeningen.", sections:[
      { id:"nl1-s1", title:"Kleine taalquiz", theory:"Korte voorbeeldsectie. Later te vervangen door echte leerlijnen." }
    ]}
  ]},
  { id:"engels", title:"Engels", description:"Simple present / vocab (placeholder).", chapters:[
    { id:"en1", title:"Simple present", description:"He/she/it + s, do/does.", sections:[
      { id:"en1-s1", title:"Korte quiz", theory:"Voorbeeldsectie (nog geen generator)." }
    ]}
  ]}
];

export default function LearnApp(){
  const [showWelcome, setShowWelcome] = useState(true);
  const [subjectId, setSubjectId] = useState<string|null>(null);
  const [chapterId, setChapterId] = useState<string|null>(null);
  const [sectionId, setSectionId] = useState<string|null>(null);
  const [mode, setMode] = useState<"uitleg"|"oefenen"|"toets">("uitleg");

  const subject = useMemo(()=>SUBJECTS.find(s=>s.id===subjectId)??null,[subjectId]);
  const chapter = useMemo(()=>subject?.chapters.find(c=>c.id===chapterId)??null,[subject,chapterId]);
  const section = useMemo(()=>chapter?.sections.find(s=>s.id===sectionId)??null,[chapter,sectionId]);

  const [items, setItems] = useState<Exercise[]>([]);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  const [submitted, setSubmitted] = useState(false);

  const startPractice = (count=6)=>{ if(!section?.generator) return; setItems(section.generator(count)); setAnswers({}); setSubmitted(false); setMode("oefenen"); };
  const startQuiz = ()=>{ if(!section?.generator) return; setItems(section.generator(8)); setAnswers({}); setSubmitted(false); setMode("toets"); };
  const correct = items.filter(it=>it.correct(answers[it.id]??"")).length;
  const score = submitted ? { correct, total: items.length, pct: Math.round(100*correct/Math.max(1,items.length)) } : null;

  const goSubjects = ()=>{ setShowWelcome(false); setSubjectId(null); setChapterId(null); setSectionId(null); setMode("uitleg"); setItems([]); setAnswers({}); setSubmitted(false); };
  const pickSubject = (id:string)=>{ setSubjectId(id); const ch = SUBJECTS.find(s=>s.id===id)?.chapters[0]; setChapterId(ch?.id??null); setSectionId(ch?.sections[0]?.id??null); setMode("uitleg"); setItems([]); setAnswers({}); setSubmitted(false); setShowWelcome(false); };
  const pickChapter = (id:string)=>{ setChapterId(id); const ch = subject?.chapters.find(c=>c.id===id); setSectionId(ch?.sections[0]?.id??null); setMode("uitleg"); setItems([]); setAnswers({}); setSubmitted(false); };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gray-900 text-white grid place-items-center font-bold">SA</div>
          <div>
            <h1 className="text-lg font-semibold">Sarah's App Leerjaar 1</h1>
            <p className="text-sm text-gray-500">Wiskunde leren met Sarah's App</p>
          </div>
          <div className="ml-auto flex gap-2">
            <button className="px-3 py-1.5 rounded-xl border" onClick={goSubjects}>Vakken</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        {showWelcome && !subject && (
          <div className="mb-6">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-2">🎓 Welkom bij Sarah's App Leerjaar 1</h2>
              <p className="text-gray-700">Kies een vak om te beginnen met leren. Lees eerst de uitleg en ga daarna oefenen of start de toetstrainer.</p>
              <button className="mt-4 px-4 py-2 rounded-xl bg-gray-900 text-white" onClick={()=>setShowWelcome(false)}>Ga verder</button>
            </div>
          </div>
        )}

        {!subject && !showWelcome && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Kies een vak</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SUBJECTS.map(v=>(
                <button key={v.id} className="text-left p-4 rounded-2xl border bg-white shadow-sm hover:shadow transition" onClick={()=>pickSubject(v.id)}>
                  <div className="text-sm text-gray-500">Vak</div>
                  <div className="text-lg font-semibold">{v.title}</div>
                  <p className="text-sm mt-1 text-gray-600">{v.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {subject && chapter && (
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">{chapter.title}</h2>
              <p className="text-gray-600 max-w-3xl">{chapter.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {subject.chapters.map(c => (
                  <button key={c.id} onClick={()=>pickChapter(c.id)} className={`px-3 py-1.5 rounded-xl border ${c.id===chapter.id?"bg-gray-900 text-white":"bg-white"}`}>{c.title}</button>
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {chapter.sections.map(s => (
                  <button key={s.id} onClick={()=>{ setSectionId(s.id); setMode("uitleg"); setItems([]); setAnswers({}); setSubmitted(false); }} className={`px-3 py-1.5 rounded-xl border ${sectionId===s.id?"bg-gray-900 text-white":"bg-white"}`}>{s.title}</button>
                ))}
              </div>
            </div>

            {section && (
              <div className="bg-white rounded-2xl border shadow-sm">
                <div className="border-b p-2 flex gap-2">
                  <button className={`px-3 py-1.5 rounded-lg ${mode==="uitleg"?"bg-gray-900 text-white":""}`} onClick={()=>setMode("uitleg")}>Uitleg</button>
                  <button className={`px-3 py-1.5 rounded-lg ${mode==="oefenen"?"bg-gray-900 text-white":""}`} onClick={()=>{ if(items.length===0) startPractice(); else setMode("oefenen"); }} disabled={!section.generator}>Oefenen</button>
                  <button className={`px-3 py-1.5 rounded-lg ${mode==="toets"?"bg-gray-900 text-white":""}`} onClick={()=>startQuiz()} disabled={!section.generator}>Toetstrainer</button>
                </div>

                <div className="p-4">
                  {mode === "uitleg" && (
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">{section.theory}</div>
                      <div className="mt-4 flex gap-2">
                        <button className="px-3 py-2 rounded-xl border" onClick={()=>startPractice()} disabled={!section.generator}>Start oefenen</button>
                        <button className="px-3 py-2 rounded-xl border" onClick={()=>startQuiz()} disabled={!section.generator}>Start toetstrainer</button>
                      </div>
                      {!section.generator && <p className="text-xs text-gray-500 mt-2">Oefenen/toets wordt toegevoegd zodra deze sectie opgaven heeft.</p>}
                    </div>
                  )}

                  {mode !== "uitleg" && (
                    <div>
                      {items.length === 0 && (
                        <div className="text-sm text-gray-600">Geen opgaven geladen. Kies "Start oefenen" of "Start toetstrainer".</div>
                      )}
                      {items.length > 0 && (
                        <div className="space-y-4">
                          {items.map((it, idx) => (
                            <div key={it.id} className="p-3 border rounded-xl">
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 grid place-items-center font-medium">{idx+1}</div>
                                <div className="flex-1">
                                  <p className="font-medium">{it.prompt}</p>
                                  {submitted && (
                                    <p className={`text-sm mt-1 ${it.correct(answers[it.id] ?? "")?"text-green-700":"text-red-700"}`}>
                                      {it.correct(answers[it.id] ?? "")?"✓ Goed":"✗ Fout"}
                                      {it.solution && !it.correct(answers[it.id] ?? "") && (<span className="ml-2">Oplossing: {it.solution}</span>)}
                                    </p>
                                  )}
                                  {!submitted && (
                                    <div className="mt-2">
                                      <input className="w-full sm:w-64 px-3 py-2 rounded-lg border" type={it.inputType ?? "text"} placeholder="Antwoord"
                                        value={answers[it.id] ?? ""} onChange={(e)=>setAnswers(a=>({...a, [it.id]: e.target.value}))} />
                                      {it.hint && <p className="text-xs text-gray-500 mt-1">Hint: {it.hint}</p>}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center gap-3">
                        {!submitted ? (
                          <button className="px-4 py-2 rounded-xl bg-gray-900 text-white" onClick={()=>setSubmitted(true)}>Nakijken</button>
                        ) : (
                          <>
                            <button className="px-3 py-2 rounded-xl border" onClick={()=>{ setSubmitted(false); setAnswers({}); }}>Opnieuw invullen</button>
                            <button className="px-3 py-2 rounded-xl border" onClick={()=>{ if(mode==="oefenen") startPractice(); else startQuiz(); }}>Nieuwe set</button>
                          </>
                        )}
                        {score && <div className="text-sm text-gray-700">Score: <span className="font-semibold">{score.correct}/{score.total}</span> ({score.pct}%)</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-6 text-xs text-gray-500">
        Sarah's App Leerjaar 1 — Uitgebreide uitleg (NL). Oefenopgaven zijn eigen materiaal; wiskunde-indeling gebaseerd op jouw foto.
      </footer>
    </div>
  );
}
