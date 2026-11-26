// Map rendering, results panel and user interaction
const $=s=>document.querySelector(s);
let src=0,dst=8,nextPick="src";const closed=new Set();
function render(){
 const adj=buildAdj(N.length,E,closed);
 const dj=dijkstra(adj,src),bf=bellman(adj,src);
 const dp=pathOf(dj.p,src,dst),bp=pathOf(bf.p,src,dst);
 const dE=pathEdges(dp),bE=pathEdges(bp);
 let s=`<svg viewBox="0 0 800 500" role="img" aria-label="City road map">`;
 E.forEach(([a,b,w],i)=>{const[x1,y1]=[N[a][1],N[a][2]],[x2,y2]=[N[b][1],N[b][2]],cl=closed.has(i);
  s+=`<g class="edge" data-i="${i}" style="cursor:pointer"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--road)" stroke-width="${cl?2:4}" ${cl?'stroke-dasharray="3 7"':''} stroke-linecap="round"/>`;
  if(dE.has(i))s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--dj)" stroke-width="9" stroke-linecap="round" opacity=".85"/>`;
  if(bE.has(i))s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--bf)" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>`;
  s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="transparent" stroke-width="22"/>`;
  s+=`<text class="w" x="${(x1+x2)/2}" y="${(y1+y2)/2+4}" text-anchor="middle">${cl?"closed":w+" km"}</text></g>`});
 N.forEach(([nm,x,y],i)=>{const on=i===src||i===dst,ty=y<150?y-18:y+27;
  s+=`<g class="node" tabindex="0" role="button" data-i="${i}" aria-label="${nm}"><circle cx="${x}" cy="${y}" r="${on?13:9}" fill="${i===src?'var(--dj)':i===dst?'var(--bf)':'var(--node)'}" stroke="var(--ring)" stroke-width="4"/><text x="${x}" y="${ty}" text-anchor="middle">${nm}</text></g>`});
 $("#map").innerHTML=s+"</svg>";

 const reps=2000,tD=avgMs(()=>dijkstra(adj,src),reps)*1000,tB=avgMs(()=>bellman(adj,src),reps)*1000;
 const d=dj.d[dst],route=p=>p?p.map(i=>N[i][0]).join(" to "):"No route: the closed roads cut this trip off.";
 const km=v=>isFinite(v)?v+" km":"none";
 const card=(cls,title,v,p,l1,v1,chk,t)=>`<div class="card ${cls}"><h3>${title}</h3><div class="big">${km(v)}</div><div class="route">${route(p)}</div><dl><dt>${l1}</dt><dd>${v1}</dd><dt>Road checks</dt><dd>${chk}</dd><dt>Time on this map</dt><dd>${t.toFixed(1)} µs</dd></dl></div>`;
 const same=dj.d[dst]===bf.d[dst];
 $("#results").innerHTML=`<h2>${N[src][0]} to ${N[dst][0]}</h2>`+
  card("","Dijkstra",dj.d[dst],dp,"Locations settled",dj.settled,dj.checks,tD)+
  card("b","Bellman-Ford",bf.d[dst],bp,"Passes over all roads",bf.passes,bf.checks,tB)+
  `<div class="verdict">${same?"Both algorithms agree on the distance.":"The algorithms disagree. Check the road data."} Bellman-Ford negative cycle: ${bf.neg?"found":"none"}. ${tB>tD?`Dijkstra was ${(tB/tD).toFixed(1)}× faster here.`:""}</div>`;
 $("#src").value=src;$("#dst").value=dst;
}
function pick(i){if(nextPick==="src"){src=i;nextPick="dst"}else{dst=i;nextPick="src"}render()}
$("#map").addEventListener("click",e=>{const n=e.target.closest(".node"),g=e.target.closest(".edge");
 if(n)pick(+n.dataset.i);else if(g){const i=+g.dataset.i;closed.has(i)?closed.delete(i):closed.add(i);render()}});
$("#map").addEventListener("keydown",e=>{const n=e.target.closest(".node");if(n&&(e.key==="Enter"||e.key===" ")){e.preventDefault();const i=+n.dataset.i;pick(i);$(`.node[data-i="${i}"]`).focus()}});
["#src","#dst"].forEach(id=>{const el=$(id);N.forEach((n,i)=>el.add(new Option(n[0],i)));el.addEventListener("change",()=>{src=+$("#src").value;dst=+$("#dst").value;render()})});
$("#reset").addEventListener("click",()=>{closed.clear();render()});
$("#theme").addEventListener("click",()=>{const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme:dark)").matches;r.dataset.theme=dark?"light":"dark"});

