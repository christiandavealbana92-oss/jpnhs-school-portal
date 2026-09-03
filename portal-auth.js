/* Shared School Portal authentication.
   IDs are matched against the existing Firebase school records, including legacy records
   where the ID is stored as a field instead of the Firebase child key. Passwords belong to Firebase Auth. */
(function(){
  const CFG={apiKey:"AIzaSyDIm2towADazJ9yuhUaIzVf7XaQEFbCpI",authDomain:"jpnhs-a2ba2.firebaseapp.com",databaseURL:"https://jpnhs-a2ba2-default-rtdb.firebaseio.com",projectId:"jpnhs-a2ba2",storageBucket:"jpnhs-a2ba2.firebasestorage.app",messagingSenderId:"689552509381",appId:"1:689552509381:web:98d043fc17189a636ea3ac"};
  const school=new URLSearchParams(location.search).get('school')||'jpnhs';
  if(typeof window.firebase==='undefined'){
    console.error('School Portal: Firebase SDK did not load before portal-auth.js.');
    window.PortalAuth={school,findRecord:async()=>{throw new Error('Firebase could not be loaded. Check your internet connection and make sure the Firebase scripts are present.');},signIn:async()=>{throw new Error('Firebase could not be loaded. Refresh the page and try again.');},createAccount:async()=>{throw new Error('Firebase could not be loaded. Refresh the page and try again.');},logout:async()=>{}};
    return;
  }
  if(!firebase.apps.length) firebase.initializeApp(CFG);
  const auth=firebase.auth(),db=firebase.database();
  const norm=v=>String(v??'').trim().toLowerCase().replace(/\s+/g,'');
  const roleNorm=v=>String(v??'').trim().toLowerCase();
  function saveSession(a){sessionStorage.setItem('schoolPortalAuth',JSON.stringify(a));}
  function clearSession(){sessionStorage.removeItem('schoolPortalAuth');localStorage.removeItem('schoolPortalUser');}
  async function findRecord(role,recordId){
    const path=role==='student'?'studentsBySchool':'staff';
    const target=norm(recordId);
    // Fast path: current data model uses the ID as the child key.
    let snap=await db.ref(path+'/'+school+'/'+String(recordId).trim()).once('value');
    if(snap.exists()) return {key:String(recordId).trim(),record:snap.val()};
    // Legacy/alternate model: search the school collection and match common ID fields.
    snap=await db.ref(path+'/'+school).once('value');
    const all=snap.val()||{};
    for(const [key,rec] of Object.entries(all)){
      if(!rec || typeof rec!=='object') continue;
      const candidates=role==='student'
        ? [key,rec.studentID,rec.studentId,rec.id,rec.ID,rec.lrn]
        : [key,rec.staffId,rec.staffID,rec.teacherID,rec.teacherId,rec.id,rec.ID];
      if(candidates.some(v=>norm(v)===target)) return {key,record:rec};
    }
    return null;
  }
  function validRole(rec,role){
    if(role==='student') return true;
    const r=roleNorm(rec.role);
    return r==='teacher' || r==='faculty' || r.includes('teacher');
  }
  async function signIn(identifier,password,role){
    if(!identifier||!password) throw new Error('Enter your ID/email and password.');
    let email=identifier.trim(), linkedRecord=null;
    if(!email.includes('@')){
      linkedRecord=await findRecord(role,email);
      if(!linkedRecord) throw new Error('No registered school record was found for that ID. Check the ID and selected school.');
      const rec=linkedRecord.record||{};
      if(rec.active===false || roleNorm(rec.status)==='inactive') throw new Error('This school record is inactive. Please contact the Administrator or Registrar.');
      if(!validRole(rec,role)) throw new Error('This ID is registered, but not for the selected portal.');
      if(!rec.email) throw new Error('No email is registered for this account. Please ask the Administrator/Registrar to enable account access.');
      email=String(rec.email).trim();
    }
    const cred=await auth.signInWithEmailAndPassword(email,password),uid=cred.user.uid;
    const link=(await db.ref('accounts/'+school+'/'+uid).once('value')).val();
    if(!link || link.active===false || (role && roleNorm(link.role)!==roleNorm(role))){await auth.signOut();throw new Error('Your login exists, but it has not been linked to this school record. Please use Create Account first.');}
    const u={uid,schoolID:school,role:link.role,id:link.recordId,name:link.name||cred.user.displayName||email,email:cred.user.email};
    saveSession(u); return u;
  }
  async function createAccount({role,recordId,email,password,verify}){
    const found=await findRecord(role,recordId);
    if(!found) throw new Error('That ID is not registered by the school. Check the ID, school, and record spelling/format.');
    const rec=found.record||{};
    if(rec.active===false || roleNorm(rec.status)==='inactive') throw new Error('This school record is inactive.');
    if(!validRole(rec,role)) throw new Error('That ID is registered, but not for the selected account type.');
    if(role==='student' && rec.birthday){
      const entered=String(verify||'').trim(), stored=String(rec.birthday||'').trim();
      if(entered!==stored && new Date(entered).toISOString().slice(0,10)!==new Date(stored).toISOString().slice(0,10)) throw new Error('The verification information does not match the school record.');
    }
    if(rec.email && norm(rec.email)!==norm(email)) throw new Error('Use the email registered by the school for this account.');
    const existing=await db.ref('accountIndex/'+school+'/'+found.key).once('value');
    if(existing.exists()) throw new Error('An account has already been created for this school record.');
    const cred=await auth.createUserWithEmailAndPassword(email.trim(),password),uid=cred.user.uid;
    const roleName=roleNorm(role);
    await db.ref('accounts/'+school+'/'+uid).set({recordId:found.key,role:roleName,schoolID:school,name:rec.name||rec.fullName||'',email:cred.user.email,active:true,createdAt:firebase.database.ServerValue.TIMESTAMP});
    await db.ref('accountIndex/'+school+'/'+found.key).set({uid,role:roleName,active:true});
    saveSession({uid,schoolID:school,role:roleName,id:found.key,name:rec.name||rec.fullName||'',email:cred.user.email});
    return cred.user;
  }
  window.PortalAuth={auth,db,school,findRecord,signIn,createAccount,logout:async()=>{clearSession();await auth.signOut();}};
})();
