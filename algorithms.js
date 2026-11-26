// Min-heap, Dijkstra, Bellman-Ford and path helpers (no DOM code here)
class Heap{constructor(){this.k=[];this.v=[]}get size(){return this.k.length}
push(key,val){const k=this.k,v=this.v;let i=k.length;k.push(key);v.push(val);while(i>0){const p=(i-1)>>1;if(k[p]<=key)break;k[i]=k[p];v[i]=v[p];i=p}k[i]=key;v[i]=val}
pop(){const k=this.k,v=this.v,rk=k[0],rv=v[0],lk=k.pop(),lv=v.pop(),n=k.length;if(n){let i=0;for(;;){let c=2*i+1;if(c>=n)break;if(c+1<n&&k[c+1]<k[c])c++;if(k[c]>=lk)break;k[i]=k[c];v[i]=v[c];i=c}k[i]=lk;v[i]=lv}return[rk,rv]}}
function buildAdj(n,edges,skip){const a=Array.from({length:n},()=>[]);edges.forEach(([u,v,w],i)=>{if(skip&&skip.has(i))return;a[u].push([v,w]);a[v].push([u,w])});return a}
function dijkstra(adj,s){const n=adj.length,d=new Float64Array(n).fill(Infinity),p=new Int32Array(n).fill(-1);d[s]=0;const h=new Heap();h.push(0,s);let settled=0,checks=0;
 while(h.size){const[k,u]=h.pop();if(k>d[u])continue;settled++;for(const[v,w]of adj[u]){checks++;if(k+w<d[v]){d[v]=k+w;p[v]=u;h.push(d[v],v)}}}
 return{d,p,settled,checks}}
function bellman(adj,s){const n=adj.length,eu=[],ev=[],ew=[];adj.forEach((l,u)=>l.forEach(([v,w])=>{eu.push(u);ev.push(v);ew.push(w)}));
 const d=new Float64Array(n).fill(Infinity),p=new Int32Array(n).fill(-1),m=eu.length;d[s]=0;let passes=0,checks=0;
 for(let i=0;i<n-1;i++){passes++;let ch=false;for(let j=0;j<m;j++){checks++;const t=d[eu[j]]+ew[j];if(t<d[ev[j]]){d[ev[j]]=t;p[ev[j]]=eu[j];ch=true}}if(!ch)break}
 let neg=false;for(let j=0;j<m;j++)if(d[eu[j]]+ew[j]<d[ev[j]]){neg=true;break}
 return{d,p,passes,checks,neg}}
function pathOf(p,s,t){const r=[];for(let x=t;x!==-1;x=p[x]){r.push(x);if(x===s)return r.reverse()}return null}
function eid(a,b){return E.findIndex(e=>(e[0]===a&&e[1]===b)||(e[0]===b&&e[1]===a))}
function pathEdges(path){const s=new Set();if(path)for(let i=1;i<path.length;i++)s.add(eid(path[i-1],path[i]));return s}
function avgMs(fn,reps){const t=performance.now();for(let i=0;i<reps;i++)fn();return(performance.now()-t)/reps}

