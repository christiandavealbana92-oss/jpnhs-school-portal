/* School Portal Community Feed
   Text-only announcements/posts with multi-person call-outs.
   Requires Firebase Realtime Database and a global SCHOOL_ID.
*/
(function(){
"use strict";
const escC=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const q=(sel,root=document)=>root.querySelector(sel);
const qq=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
const sid=window.SCHOOL_ID || new URLSearchParams(location.search).get("school") || localStorage.getItem("schoolID") || "jpnhs";
const path=location.pathname.toLowerCase();
const isMain=/\/index\.html?$/.test(path)||path.endsWith("/");
const role=path.includes("admin")?"admin":path.includes("registrar")?"registrar":path.includes("teacher")?"teacher":path.includes("student")?"student":"guest";
const keyFor=()=>{try{
  const saved=JSON.parse(localStorage.getItem("schoolPortalUser")||"null");
  if(saved&&saved.key)return saved;
}catch(e){}
  if(role==="admin")return {key:"admin:Administrator",name:"Administrator",role:"Administrator"};
  return null;
};
const state={school:null,posts:{},targets:[],user:null};

function dbRef(p){return window.db&&window.db.ref("community/"+p);}
function fmt(ts){try{return new Date(ts).toLocaleString([], {year:"numeric",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});}catch(e){return ""}}
function initials(n){return String(n||"School Portal").trim().split(/\s+/).filter(Boolean).map(x=>x[0]).slice(0,2).join("").toUpperCase()||"SP"}
function partnerArr(s){const p=s&&s.partners;if(Array.isArray(p))return p;if(p&&typeof p==="object")return Object.values(p);return []}
function typeLabel(t){return t==="announcement"?"Announcement":t==="attention"?"Calling Attention":"Post"}
function targetKey(type,id){return (type==="student"?"student:":"staff:")+id}
function portalReady(){
  if(isMain)return true;
  const app=q("#adminApp")||q("#app");
  const login=q("#loginScreen")||q("#login");
  if(app) {
    const st=getComputedStyle(app);
    if(st.display==="none" || app.classList.contains("hidden")) return false;
  }
  if(login) {
    const st=getComputedStyle(login);
    if(st.display!=="none" && !login.classList.contains("hidden")) return false;
  }
  return true;
}
function setUser(){
  if(!portalReady()){state.user=null;return;}
  const saved=keyFor();
  if(saved){state.user=saved;return;}
  if(role==="student" && window.ST){state.user={key:"student:"+String(ST.studentID||new URLSearchParams(location.search).get("student")||""),name:ST.name||"Student",role:"Student"}}
  else if(role==="teacher" && window.ME){state.user={key:"staff:"+String(ME.staffID||ME.id||""),name:ME.name||"Teacher",role:"Teacher"}}
  else if(role==="registrar" && window.me){state.user={key:"staff:"+String(me.staffID||me.id||""),name:me.name||"Registrar",role:"Registrar"}}
}
function saveUser(u){try{localStorage.setItem("schoolPortalUser",JSON.stringify(u));}catch(e){}}
function clearUser(){try{localStorage.removeItem("schoolPortalUser");}catch(e){}}

function css(){
if(q("#communityStyles"))return;
const st=document.createElement("style");st.id="communityStyles";st.textContent=`
.community-wrap{max-width:780px;margin:0 auto}.community-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:18px}.community-head h1{margin:0;font-size:30px;letter-spacing:-.03em}.community-head p{margin:5px 0;color:#667085}.community-compose{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:16px;box-shadow:0 8px 28px rgba(15,23,42,.06);margin-bottom:16px}.community-row{display:flex;gap:8px;flex-wrap:wrap}.community-select,.community-input,.community-text{width:100%;border:1px solid #d9e1ec;border-radius:11px;padding:11px 12px;background:#fff;color:#172033;font:inherit}.community-text{min-height:105px;resize:vertical}.community-select{width:auto;min-width:160px}.community-btn{border:0;border-radius:11px;padding:10px 15px;font-weight:800;cursor:pointer}.community-primary{background:#2563eb;color:#fff}.community-soft{background:#eef4ff;color:#2455a4}.community-danger{background:#fff1f2;color:#b42318}.community-callout{margin-top:10px;padding:11px;border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc}.community-callout strong{display:block;font-size:12px;margin-bottom:7px}.community-targets{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.community-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid #dbe3ef;border-radius:999px;padding:5px 9px;background:#fff;font-size:12px}.community-chip button{border:0;background:transparent;cursor:pointer;color:#64748b}.community-post{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:17px;margin-bottom:13px;box-shadow:0 5px 20px rgba(15,23,42,.045)}.community-meta{display:flex;align-items:center;gap:10px}.community-avatar{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:#eef4ff;color:#2455a4;font-weight:900}.community-author{font-weight:800}.community-time{font-size:11px;color:#667085}.community-badge{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.06em;padding:4px 7px;border-radius:999px;background:#f1f5f9;color:#475569}.community-body{white-space:pre-wrap;line-height:1.6;margin:15px 0}.community-attn{padding:10px 12px;border-left:3px solid #2563eb;background:#f5f9ff;border-radius:8px;font-size:12px}.community-actions{display:flex;justify-content:space-between;align-items:center;gap:8px}.community-empty{padding:35px 15px;text-align:center;color:#667085}.community-notice{background:#fff8e8;border:1px solid #fde7a8;border-radius:15px;padding:12px 14px;margin-bottom:13px}.community-notice a{color:#2455a4;font-weight:800;text-decoration:none}.community-search{display:flex;gap:7px}.community-search input{flex:1}.community-search select{width:130px}.community-nav-badge{display:inline-grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:999px;background:#e11d48;color:#fff;font-size:10px;margin-left:5px}.community-main-shell{background:transparent}.community-main-top{position:sticky;top:0;z-index:30;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border-bottom:1px solid #e5e7eb}.community-main-nav{max-width:1080px;margin:auto;padding:12px 18px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}.community-main-nav a{color:#172033;text-decoration:none;font-weight:750;padding:9px 12px;border-radius:9px}.community-main-nav a:hover{background:#eef4ff;color:#2455a4}.community-main-nav .nav-spacer{flex:1}.community-main-logo{width:38px;height:38px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;display:grid;place-items:center;font-weight:900;background:#fff}.community-main-logo img{width:100%;height:100%;object-fit:contain}.community-main-feed{max-width:780px;margin:28px auto;padding:0 16px}.community-main-hero{max-width:1080px;margin:0 auto;padding:35px 18px 10px}.community-main-hero h1{font-size:42px;letter-spacing:-.045em;margin:0}.community-main-hero p{color:#667085}.community-main-grid{max-width:1080px;margin:auto;display:grid;grid-template-columns:minmax(0,780px) 250px;gap:22px;padding:0 18px}.community-sidecard{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:16px;position:sticky;top:85px;height:max-content}.community-sidecard h3{margin:0 0 9px}.community-sidecard p,.community-sidecard li{font-size:12px;color:#667085;line-height:1.5}.community-sidecard ul{padding-left:18px}.community-login-note{font-size:12px;color:#667085;margin-top:8px}@media(max-width:820px){.community-main-grid{grid-template-columns:1fr}.community-sidecard{display:none}.community-main-hero h1{font-size:34px}}
`;
document.head.appendChild(st);
}

async function loadSchool(){
 if(!window.db)return;
 try{state.school=(await window.db.ref("schools/"+sid).once("value")).val()||{};}catch(e){state.school={};}
}

async function loadPosts(){
 if(!window.db)return;
 try{state.posts=(await window.db.ref("community/"+sid+"/posts").once("value")).val()||{};}catch(e){state.posts={};}
}

async function loadTargets(){
 const out=[];
 try{
   const students=(await window.db.ref("studentsBySchool/"+sid).once("value")).val()||{};
   Object.entries(students).forEach(([id,s])=>out.push({type:"student",id,name:s.name||id,level:s.level||"",label:`${s.name||id} (${id})`}));
 }catch(e){}
 try{
   const staff=(await window.db.ref("staff/"+sid).once("value")).val()||{};
   Object.entries(staff).forEach(([id,s])=>out.push({type:"staff",id,name:s.name||id,role:s.role||"Staff",label:`${s.name||id} (${id})`}));
 }catch(e){}
 state.targets=out.sort((a,b)=>String(a.name).localeCompare(String(b.name)));
}

function sortedPosts(){return Object.entries(state.posts||{}).map(([id,p])=>({id,...p})).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));}

function buildCompose(){
 if(!state.user)return `<div class="community-compose"><strong>Sign in through your school portal to post.</strong><div class="community-login-note">The main school page is available for viewing. Posting is available only to Administrator, Registrar, and Teacher accounts after login.</div></div>`; const canPost=["Administrator","Registrar","Teacher"].includes(String(state.user.role||"")); if(!canPost)return `<div class="community-compose"><strong>School Community</strong><div class="community-login-note">Students can view school posts and announcements, but only Administrator, Registrar, and Teacher accounts can publish.</div></div>`;
 return `<div class="community-compose">
   <div class="community-row">
    <select id="communityType" class="community-select"><option value="post">Post</option><option value="announcement">Announcement</option><option value="attention">Calling the attention of...</option></select>
   </div>
   <textarea id="communityMessage" class="community-text" placeholder="Write an announcement or post..."></textarea>
   <div id="communityCalloutBox" class="community-callout" style="display:none">
    <strong>CALL OUT ONE OR MORE PEOPLE</strong>
    <div class="community-search"><input id="communitySearch" class="community-input" placeholder="Search by name or ID number"><select id="communitySearchMode" class="community-select"><option value="id">ID Search</option><option value="name">Name Search</option></select><button id="communityFind" class="community-btn community-soft">Search</button></div>
    <div id="communityResults"></div><div id="communityTargets" class="community-targets"></div>
   </div>
   <div class="community-row" style="margin-top:11px;justify-content:flex-end"><button id="communityPostBtn" class="community-btn community-primary">Publish</button></div>
 </div>`;
}

function renderComposer(){
 const box=q("#communityComposer"); if(!box)return;
 box.innerHTML=buildCompose();
 const type=q("#communityType");
 if(!type)return;
 const call=q("#communityCalloutBox");
 type.onchange=()=>call.style.display=type.value==="attention"?"block":"none";
 const targets=[];
 const renderT=()=>{q("#communityTargets").innerHTML=targets.map((t,i)=>`<span class="community-chip">${escC(t.name)} <small>${escC(t.id)}</small><button data-remove="${i}" aria-label="Remove">×</button></span>`).join("");qq("[data-remove]",q("#communityTargets")).forEach(b=>b.onclick=()=>{targets.splice(+b.dataset.remove,1);renderT()})};
 q("#communityFind").onclick=()=>{const term=q("#communitySearch").value.trim().toLowerCase(),mode=q("#communitySearchMode").value;if(!term){q("#communityResults").innerHTML="";return}const a=state.targets.filter(t=>(mode==="id"?String(t.id).toLowerCase().includes(term):String(t.name).toLowerCase().includes(term))).slice(0,12);q("#communityResults").innerHTML=a.length?a.map((t,i)=>`<button class="community-chip" data-add="${i}" style="margin-top:7px">${escC(t.name)} <small>${escC(t.id)}</small></button>`).join(""):"<div style='font-size:12px;color:#667085;margin-top:8px'>No matching person found.</div>";qq("[data-add]",q("#communityResults")).forEach((b,i)=>b.onclick=()=>{const t=a[i];if(!targets.some(x=>x.type===t.type&&String(x.id)===String(t.id)))targets.push(t);renderT()})};
 q("#communityPostBtn").onclick=async()=>{
  const msg=q("#communityMessage").value.trim(), typ=type.value;
  if(!msg){alert("Please enter a message.");return}
  if(typ==="attention"&&!targets.length){alert("Please call out at least one person.");return}
  const post={type:typ,message:msg,authorKey:state.user.key,authorName:state.user.name||"User",authorRole:state.user.role||"User",createdAt:Date.now(),callouts:typ==="attention"?targets.map(t=>({key:targetKey(t.type,t.id),type:t.type,id:String(t.id),name:t.name})):[]};
  try{
   const ref=window.db.ref("community/"+sid+"/posts").push(); post.id=ref.key; await ref.set(post);
   if(post.callouts.length){const writes={};post.callouts.forEach(t=>writes[t.key+"/"+post.id]={postId:post.id,message:msg,authorName:post.authorName,createdAt:post.createdAt,read:false});await window.db.ref("community/"+sid+"/notifications").update(writes);}
   q("#communityMessage").value="";targets.splice(0);renderT();await loadPosts();renderFeed();
  }catch(e){alert("Unable to publish: "+e.message)}
 };
}

async function removePost(id){
 const p=state.posts[id];if(!p||!state.user)return;
 const allowed=p.authorKey===state.user.key||state.user.role==="Administrator";
 if(!allowed){alert("Only the person who posted it or the Administrator can delete it.");return}
 if(!confirm("Delete this post?"))return;
 try{await window.db.ref("community/"+sid+"/posts/"+id).remove();if(p.callouts)for(const t of p.callouts)await window.db.ref("community/"+sid+"/notifications/"+t.key+"/"+id).remove();await loadPosts();renderFeed();}catch(e){alert("Unable to delete post: "+e.message)}
}

function postHTML(p,highlight){
 const mine=state.user&& (p.authorKey===state.user.key||state.user.role==="Administrator");
 const calls=(p.callouts||[]).map(x=>x.name).join(", ");
 return `<article class="community-post" id="post-${escC(p.id)}" style="${highlight?"outline:3px solid #93c5fd":""}">
  <div class="community-meta"><div class="community-avatar">${escC(initials(p.authorName))}</div><div style="flex:1"><div class="community-author">${escC(p.authorName)} <span class="community-badge">${escC(typeLabel(p.type))}</span></div><div class="community-time">${escC(p.authorRole||"")} · ${escC(fmt(p.createdAt))}</div></div></div>
  <div class="community-body">${escC(p.message)}</div>
  ${p.type==="attention"?`<div class="community-attn"><b>Calling the attention of:</b> ${escC(calls||"selected people")}</div>`:""}
  ${mine?`<div class="community-actions" style="margin-top:12px"><span></span><button class="community-btn community-danger" data-delete-post="${escC(p.id)}">Delete</button></div>`:""}
 </article>`;
}

function renderFeed(){
 const box=q("#communityFeed");if(!box)return;
 const wanted=new URLSearchParams(location.search).get("post");
 const posts=sortedPosts();
 box.innerHTML=posts.length?posts.map(p=>postHTML(p,p.id===wanted)).join(""):`<div class="community-empty">No posts yet. Be the first to share an announcement.</div>`;
 qq("[data-delete-post]",box).forEach(b=>b.onclick=()=>removePost(b.dataset.deletePost));
 if(wanted){setTimeout(()=>q("#post-"+CSS.escape(wanted))?.scrollIntoView({behavior:"smooth",block:"center"}),250)}
}

async function notifications(){
 if(!state.user||!window.db)return;
 let n={};try{n=(await window.db.ref("community/"+sid+"/notifications/"+state.user.key).once("value")).val()||{};}catch(e){}
 const unread=Object.values(n).filter(x=>x&&!x.read);
 const holder=q("#communityNotifications");
 if(holder)holder.innerHTML=unread.length?unread.map(x=>`<div class="community-notice"><b>New attention notice</b><br>${escC(x.authorName)} called your attention in a post.<br><a href="index.html?school=${encodeURIComponent(sid)}&post=${encodeURIComponent(x.postId)}">View the post →</a></div>`).join(""):"";
 const badge=q("[data-community-badge]");if(badge){badge.textContent=unread.length;badge.style.display=unread.length?"inline-grid":"none";}
}

function injectPortal(){
 if(isMain)return;
 css();
 const main=q("main.content")||q("main.main")||q(".content")||q(".main");
 if(!main)return;
 if(!q("#communityPage")){
  const sec=document.createElement("section");sec.id="communityPage";sec.className="page";sec.innerHTML=`<div class="community-wrap"><div class="community-head"><div><h1>Community</h1><p>School-wide posts, announcements, and attention notices.</p></div></div><div id="communityNotifications"></div><div id="communityComposer"></div><div id="communityFeed"></div></div>`;main.appendChild(sec);
 }
 const nav=q(".sidebar")||q(".side");
 if(nav&&!q("[data-page='community']")){
   const b=document.createElement("button");b.className="nav-button";b.dataset.page="community";b.innerHTML=`Community <span class="community-nav-badge" data-community-badge style="display:none">0</span>`;
   nav.appendChild(b);
   b.onclick=()=>{qq(".page",main).forEach(p=>p.classList.remove("active"));q("#communityPage").classList.add("active");qq(".nav-button",nav).forEach(x=>x.classList.remove("active"));b.classList.add("active");loadPosts().then(renderFeed);notifications()};
 }
 setUser();renderComposer();
 loadPosts().then(renderFeed);notifications();
 // If a portal page becomes logged in after this script runs, re-check identity.
 const timer=setInterval(()=>{setUser();if(state.user){renderComposer();notifications();clearInterval(timer)}},800);
}

async function injectMain(){
 css();
 document.body.classList.add("community-main-shell");
 const oldHeader=q("header"), oldMain=q("main"), oldFooter=q("footer");
 const app=document.createElement("div");app.id="communityMainApp";
 app.innerHTML=`<div class="community-main-top"><nav class="community-main-nav"><div id="communityMainLogo" class="community-main-logo">SP</div><strong id="communityMainName">School Portal</strong><span class="nav-spacer"></span><a id="navHome" href="#">Home</a><a id="navRegistrar" href="registrar.html">Registrar</a><a id="navTeacher" href="teacher.html">Teacher</a><a id="navStudent" href="student.html">Student</a><a id="navAdmin" href="admin.html">Administrator</a></nav></div><section class="community-main-hero"><div class="tag" style="color:#2563eb;font-weight:900;font-size:12px">SCHOOL COMMUNITY</div><h1 id="communityHeroName">School Portal</h1><p>Announcements, updates, and school-wide conversations in one place.</p></section><div class="community-main-grid"><main class="community-main-feed"><div id="communityNotifications"></div><div id="communityComposer"></div><div id="communityFeed"></div></main><aside class="community-sidecard"><h3>School Community</h3><p>View school posts and announcements. Students, teachers, registrars, and administrators can publish from their own portals.</p><div id="communityMainPartners"></div><p><b>Tip:</b> If someone calls your attention, you'll see a notification in your portal.</p></aside></div>`;
 document.body.appendChild(app);
 // Only hide the fallback page after the new community interface has been mounted.
 if(oldHeader)oldHeader.style.display="none";
 if(oldFooter)oldFooter.style.display="none";
 if(oldMain)oldMain.style.display="none";
 const school=state.school||{};const name=school.name||"School Portal";
 q("#communityMainName").textContent=school.shortName||name;q("#communityHeroName").textContent=name;
 const logo=q("#communityMainLogo");if(school.logo)logo.innerHTML=`<img src="${escC(school.logo)}" alt="School logo">`;else logo.textContent=initials(school.shortName||name);
 ["navHome","navRegistrar","navTeacher","navStudent","navAdmin"].forEach(id=>{const el=q("#"+id);if(el)el.href=(id==="navHome"?"index.html":id==="navRegistrar"?"registrar.html":id==="navTeacher"?"teacher.html":id==="navStudent"?"student.html":"admin.html")+"?school="+encodeURIComponent(sid)});
 const ps=partnerArr(school);q("#communityMainPartners").innerHTML=ps.length?`<div style="font-size:11px;font-weight:900;margin:12px 0 7px">PARTNERS</div>`+ps.map(p=>`<div style="display:flex;align-items:center;gap:7px;margin:6px 0;font-size:11px">${p.logo?`<img src="${escC(p.logo)}" style="width:27px;height:27px;object-fit:contain;border:1px solid #e5e7eb;border-radius:7px">`:``}<b>${escC(p.name||"Partner")}</b></div>`).join(""):"";
 // Main page is view-only: no compose.
 q("#communityComposer").innerHTML="";
 await loadPosts();renderFeed();
}

async function boot(){
 css();
 if(window.db){
   await loadSchool();
   setUser();
   if(isMain){await injectMain();return;}
   injectPortal();
 }
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>boot().catch(showCommunityError));else boot().catch(showCommunityError);
function showCommunityError(e){console.error("School Community failed to load:",e);const box=document.getElementById("communityFallback");if(box){box.style.display="block";const msg=document.getElementById("communityFallbackMsg");if(msg)msg.textContent="The school community is temporarily unavailable. Please refresh the page.";}}

window.SchoolCommunity={clearUser};
})();