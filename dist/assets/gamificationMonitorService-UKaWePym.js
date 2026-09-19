import{g as f}from"./index-C7GBxT6E.js";const g=[44,48,52];async function k(a,o,u,l){const n=o+1,e=f();try{const r={message_count:n,premium_type:`woche_${n}`,updated_at:new Date().toISOString()},{error:i}=await e.from("profiles").update(r).eq("id",a);i&&console.warn("Profiles update failed, trying fallback:",i.message)}catch(r){console.warn("Could not update user week in profiles:",r)}if(g.includes(n)){const r=`flow_alert_sent_week_${n}_${a}`;localStorage.getItem(r)||(localStorage.setItem(r,new Date().toISOString()),await b(n,u,l,a))}}async function b(a,o,u,l){const n=f(),e=Math.max(0,52-a);let r="ℹ️ INFORMATION",i="Frühzeitige Information";a>=52?(r="🏆 MEISTERSCHAFT VOLLENDET",i="Nutzer hat alle 52 Wochen absolviert!"):a>=48?(r="🟠 ERHÖHTE AUFMERKSAMKEIT",i=`Endspurt! Nur noch ${e} Wochen Vorlaufzeit bis zum Kursende.`):a>=44&&(r="⚠️ FRÜHWARNUNG GAMIFICATION (7-8 WOCHEN VORLAUF)",i=`Genau 7 bis 8 Wochen Vorlaufzeit (${e} Wochen verbleibend). Perfektes Zeitfenster zur Erstellung neuer Inhalte!`);try{const{error:c}=await n.functions.invoke("smart-responder",{body:{name:"Flow der Stille Gamification Radar",email:o||"system@flow-der-stille.de",message:`[${r}] 52-Wochen-Achtsamkeitskurs

Status-Update für die Wochenaufgaben:
Ein Nutzer hat soeben WOCHE ${a} von 52 erreicht!

-----------------------------------------
Nutzer: ${u||"Kunde"} <${o||"Nicht angegeben"}>
Nutzer-ID: ${l||"Unbekannt"}
Aktuelle Woche: Woche ${a} von 52 (${Math.round(a/52*100)} % absolviert)
Verbleibende Wochen bis zum Ziel: ${e} Woche(n)
Dringlichkeitsstufe: ${i}
Datum: ${new Date().toLocaleString("de-DE")}
-----------------------------------------

💡 Empfohlene Handlungsschritte für das Team:
- Neue Achtsamkeitsübungen oder Meditationen vorbereiten
- Folgeinhalte für Level 2 / Fortgeschrittene planen
- Im Admin-Dashboard prüfen, wie viele weitere Nutzer folgen

Du kannst den Status jederzeit direkt in deinem Admin-Bereich unter "Mein Bereich" oder im Admin-Dashboard einsehen.`,honeypot:""}});return!c}catch(c){return console.error("Fehler beim Senden der Alarm-E-Mail:",c),!1}}async function _(){const a=f();try{const{data:o,error:u}=await a.from("profiles").select("id, email, first_name, last_name, full_name, message_count, updated_at, created_at, premium_type");if(u||!o)throw u||new Error("No profiles returned");const l={};for(let t=1;t<=52;t++)l[t]=0;const n={phase1:0,phase2:0,phase3:0,phase4:0};let e=1,r=null;const i=o.map(t=>{const h=parseInt(t.message_count,10),s=!isNaN(h)&&h>0?Math.min(52,h):1;l[s]=(l[s]||0)+1,s<=13?n.phase1++:s<=26?n.phase2++:s<=39?n.phase3++:n.phase4++;const p=(t.first_name||t.full_name||t.email?.split("@")[0]||"Nutzer").trim(),m={id:t.id,email:t.email||"",name:p,week:s,percentage:Math.round(s/52*100),phase:s<=13?1:s<=26?2:s<=39?3:4,lastActive:t.updated_at||t.created_at,appVersion:t.premium_type||void 0};return s>=e&&(e=s,r=m),m});i.sort((t,h)=>h.week-t.week);let c="green",d=`🟢 Alles im grünen Bereich: Spitzenreiter ist in Woche ${e}/52. Mehr als 8 Wochen Vorlaufzeit verbleiben.`;return e>=52?(c="red",d="🏆 Kursende erreicht: Nutzer haben alle 52 Wochen absolviert!"):e>=48?(c="orange",d=`🟠 Erhöhte Aufmerksamkeit: Spitzenreiter in Woche ${e}/52. Nur noch ${52-e} Wochen verbleibend bis zum Kursende.`):e>=44&&(c="yellow",d=`⚠️ Frühwarnung aktiv (7–8 Wochen Vorlaufzeit): Spitzenreiter in Woche ${e}/52! Genau das ideale Zeitfenster (${52-e} Wochen Vorlauf) zur Vorbereitung neuer Übungen.`),{totalTrackedUsers:o.length,maxWeekReached:e,leadUser:r,phaseCounts:n,weekDistribution:l,alertLevel:c,alertMessage:d,users:i}}catch(o){return console.error("Fehler beim Laden der Gamification-Verteilung:",o),{totalTrackedUsers:0,maxWeekReached:1,leadUser:null,phaseCounts:{phase1:0,phase2:0,phase3:0,phase4:0},weekDistribution:{},alertLevel:"green",alertMessage:"Verbindung zu Gamification-Daten wird hergestellt...",users:[]}}}export{b as a,_ as f,k as s};
