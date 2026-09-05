/* One Firebase data model for Student, Teacher and future Registrar accounts. */
(function(){
 const CFG={apiKey:'AIzaSyDIm2towADazJ9yuhUaIzVfX7ZaQEFbCpI',authDomain:'jpnhs-a2ba2.firebaseapp.com',databaseURL:'https://jpnhs-a2ba2-default-rtdb.firebaseio.com',projectId:'jpnhs-a2ba2',storageBucket:'jpnhs-a2ba2.firebasestorage.app',messagingSenderId:'689552509381',appId:'1:689552509381:web:98d043fc17189a636ea3ac'};
 if(typeof firebase==='undefined'){window.PortalAuth={ready:false};return}
 if(!firebase.apps.length)firebase.initializeApp(CFG);
 const db=firebase.database(),auth=firebase.auth(),school=(new URLSearchParams(location.search).get('school')||'').trim();
 const norm=v=>String(v??'').trim().toLowerCase().replace(/[\s-]+/g,'');
 const ids=(role,key,r)=>role==='student'?[key,r.studentID,r.studentId,r.id,r.ID,r.lrn]:[key,r.staffID,r.staffId,r.teacherID,r.teacherId,r.id,r.ID];
 async function findRecord(role,id){
   if(!school)throw Error('School ID is missing. Open this portal with ?school=312422.');
   const path=role==='student'?`studentsBySchool/${school}`:`staff/${school}`; const target=norm(id);
   let snap=await db.ref(path+'/'+String(id).trim()).once('value');
   if(snap.exists())return {key:String(id).trim(),record:snap.val(),schoolID:school};
   snap=await db.ref(path).once('value'); const all=snap.val()||{};
   for(const [key,r] of Object.entries(all))if(r&&typeof r==='object'&&ids(role,key,r).some(x=>norm(x)===target))return {key,record:r,schoolID:school};
   return null;
 }
 async function createAccount({role,recordId,email,password,verify}){
   const found=await findRecord(role,recordId);
   if(!found)throw Error('That ID is not registered by the school. Check the ID and selected school.');
   const r=found.record||{};
   if(r.active===false||String(r.status||'').toLowerCase()==='inactive')throw Error('This school record is inactive.');
   if(role!=='student'&&!['teacher','faculty'].includes(String(r.role||'').toLowerCase())&&!String(r.role||'').toLowerCase().includes('teacher'))throw Error('This ID is registered, but not as a teacher.');
   if(role==='student'&&r.birthday&&verify){const a=String(verify).slice(0,10),b=String(r.birthday).slice(0,10);if(a!==b)throw Error('The verification information does not match the school record.');}
   if(r.email&&norm(r.email)!==norm(email))throw Error('Use the email registered by the school.');
   const idx=`accountIndex/${found.schoolID}/${found.key}`;if((await db.ref(idx).once('value')).exists())throw Error('An account already exists for this school record.');
   const cred=await auth.createUserWithEmailAndPassword(String(email).trim(),password),uid=cred.user.uid,roleName=String(role).toLowerCase();
   await db.ref(`accounts/${found.schoolID}/${uid}`).set({recordId:found.key,role:roleName,schoolID:found.schoolID,name:r.name||r.fullName||'',email:cred.user.email,active:true,createdAt:firebase.database.ServerValue.TIMESTAMP});
   await db.ref(idx).set({uid,role:roleName,active:true});
   return cred.user;
 }
 async function signIn(identifier,password,role){
   let email=String(identifier||'').trim();if(!email||!password)throw Error('Enter your ID/email and password.');
   let found=null;if(!email.includes('@')){found=await findRecord(role,email);if(!found)throw Error('No registered school record was found for that ID.');if(!found.record.email)throw Error('No email is registered for this school record. Ask the Administrator.');email=found.record.email;}
   const c=await auth.signInWithEmailAndPassword(email,password),uid=c.user.uid,link=(await db.ref(`accounts/${school}/${uid}`).once('value')).val();
   if(!link||link.active===false||String(link.role).toLowerCase()!==String(role).toLowerCase()){await auth.signOut();throw Error('Your Firebase login is not linked to this school record. Create the account first.');}
   const session={uid,schoolID:school,role:link.role,id:link.recordId,name:link.name||email,email:c.user.email};return session;
 }
 window.PortalAuth={ready:true,db,auth,school,findRecord,createAccount,signIn,logout:async()=>{await auth.signOut()}};
})();
