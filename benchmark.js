// Random city generator, timing and chart for the benchmark section
const SIZES=[100,250,500,1000,2000,4000];
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function randomCity(n,seed){const r=rng(seed),perm=[...Array(n).keys()];for(let i=n-1;i>0;i--){const j=Math.floor(r()*(i+1));[perm[i],perm[j]]=[perm[j],perm[i]]}
 const ed=[];for(let i=1;i<n;i++)ed.push([perm[i-1],perm[i],1+Math.floor(r()*20)]);
 for(let i=0;i<n;i++){const u=Math.floor(r()*n),v=Math.floor(r()*n);if(u!==v)ed.push([u,v,1+Math.floor(r()*20)])}return ed}
function best(fn){let b=1e9;for(let i=0;i<3;i++){const t=performance.now();fn();b=Math.min(b,performance.now()-t)}return b}
function chart(rows){const W=640,H=280,L=48,R=16,T=16,B=34,mx=Math.max(...rows.map(r=>r.b),.01),xm=SIZES[SIZES.length-1],X=v=>L+(W-L-R)*v/xm,Y=v=>H-B-(H-T-B)*v/mx;
 let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Runtime in milliseconds versus number of locations">`;
 for(let i=0;i<=4;i++){const v=mx*i/4,y=Y(v);s+=`<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" stroke="var(--line)"/><text class="ax" x="${L-6}" y="${y+4}" text-anchor="end">${v.toFixed(v<10?1:0)}</text>`}
 SIZES.forEach(n=>s+=`<text class="ax" x="${X(n)}" y="${H-12}" text-anchor="middle">${n}</text>`);
 const ln=(k,c,dash)=>`<polyline fill="none" stroke="${c}" stroke-width="3" ${dash?'stroke-dasharray="8 5"':''} points="${rows.map(r=>X(r.n)+","+Y(r[k])).join(" ")}"/>`+rows.map(r=>`<circle cx="${X(r.n)}" cy="${Y(r[k])}" r="4" fill="${c}"/>`).join("");
 return s+ln("d","var(--dj)")+ln("b","var(--bf)",true)+"</svg>"}
function tableHtml(rows){return`<table><tr><th>Locations</th><th>Roads</th><th>Dijkstra (ms)</th><th>Bellman-Ford (ms)</th><th>Ratio</th><th>Same result</th></tr>`+rows.map(r=>`<tr><td>${r.n}</td><td>${r.m}</td><td>${r.d.toFixed(2)}</td><td>${r.b.toFixed(2)}</td><td>${(r.b/r.d).toFixed(1)}×</td><td>${r.ok?"Yes":"No"}</td></tr>`).join("")+`</table>`}
$("#bench").addEventListener("click",async()=>{const btn=$("#bench"),rows=[];btn.disabled=true;
 for(const n of SIZES){$("#bstat").textContent=`Testing ${n} locations…`;await new Promise(r=>setTimeout(r,30));
  const ed=randomCity(n,n),adj=buildAdj(n,ed),d=best(()=>dijkstra(adj,0)),b=best(()=>bellman(adj,0)),x=dijkstra(adj,0).d,y=bellman(adj,0).d;
  let ok=true;for(let i=0;i<n;i++)if(x[i]!==y[i]){ok=false;break}
  rows.push({n,m:ed.length*2,d,b,ok});$("#chart").innerHTML=chart(rows);$("#table").innerHTML=tableHtml(rows)}
 $("#bstat").textContent="Done. Bellman-Ford grows faster as the city grows.";btn.disabled=false});
