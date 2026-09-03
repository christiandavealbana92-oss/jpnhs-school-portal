/* School Portal shared authentication helper.
   Firebase Authentication stores passwords; Realtime Database stores only the account link. */
(function(){
  const CFG={apiKey:"AIzaSyDIm2towADazJ9yuhUaIzVfX7ZaQEFbCpI",authDomain:"jpnhs-a2ba2.firebaseapp.com",databaseURL:"https://jpnhs-a2ba2-default-rtdb.firebaseio.com",projectId:"jpnhs-a2ba2",storageBucket:"jpnhs-a2ba2.firebasestorage.app",messagingSenderId:"689552509381",appId:"1:689552509381:web:98d043fc17189a636ea3ac"};
  if(!firebase.apps.length) firebase.initializeApp(CFG);
  const auth=firebase.auth(),db=firebase.database();
  const school=new URLSearchParams(location.search).get('school')||'jpnhs';
  function saveSession(a){sessionStorage.setItem('schoolPortalAuth',JSON.stringify(a));}
  function clearSession(){sessionStorage.removeItem('schoolPortalAuth');localStorage.removeItem('schoolPortalUser');}
  async function signIn(identifier,password,role){
    if(!identifier||!password) throw new Error('Enter your ID/email and password.');
    let email=identifier.trim();
    if(!email.includes('@')){
      const path=role==='student'?'studentsBySchool/':'staff/';
      const snap=await db.ref(path+school+'/'+email).once('value'); const rec=snap.val();
      if(!rec) throw new Error('No registered account was found for that ID.');
      if(role==='student' && rec.active===false) throw new Error('This student account is disabled.');
      if(role!=='student' && String(rec.role||'').toLowerCase()!==role) throw new Error('This ID is not registered for this portal.');
      if(!rec.email) throw new Error('This account has no registered email. Please ask the Administrator/Registrar to enable account access.');
      email=rec.email;
    }
    const cred=await auth.signInWithEmailAndPassword(email,password);
    const uid=cred.user.uid;
    const link=(await db.ref('accounts/'+school+'/'+uid).once('value')).val();
    if(!link || link.active===false || (role && link.role!==role)) {await auth.signOut();throw new Error('Your account is not linked to this school portal yet. Use Create Account first or contact the Administrator.');}
    const u={uid,schoolID:school,role:link.role,id:link.recordId,name:link.name||cred.user.displayName||email,email:cred.user.email};
    saveSession(u); localStorage.setItem('schoolPortalUser',JSON.stringify({key:role+':'+link.recordId,name:u.name,role:role==='admin'?'Administrator':role[0].toUpperCase()+role.slice(1)}));
    return u;
  }
  async function createAccount({role,recordId,email,password,verify}){
    const path=role==='student'?'studentsBySchool/':'staff/';
    const rec=(await db.ref(path+school+'/'+recordId).once('value')).val();
    if(!rec) throw new Error('That ID is not registered by the school.');
    if(rec.active===false) throw new Error('This record is inactive.');
    if(role!=='student' && String(rec.role||'').toLowerCase()!==role) throw new Error('That ID is not registered for this role.');
    if(role==='student' && rec.birthday && verify!==rec.birthday) throw new Error('The verification information does not match the school record.');
    if(role!=='student' && rec.email && String(rec.email).toLowerCase()!==email.toLowerCase()) throw new Error('Use the email registered by the school.');
    const existing=await db.ref('accountIndex/'+school+'/'+recordId).once('value');
    if(existing.exists()) throw new Error('An account has already been created for this ID.');
    const cred=await auth.createUserWithEmailAndPassword(email,password);
    const uid=cred.user.uid;
    await db.ref('accounts/'+school+'/'+uid).set({recordId:String(recordId),role,schoolID:school,name:rec.name||'',email:cred.user.email,active:true,createdAt:firebase.database.ServerValue.TIMESTAMP});
    await db.ref('accountIndex/'+school+'/'+recordId).set({uid,role,active:true});
    saveSession({uid,schoolID:school,role,id:String(recordId),name:rec.name||'',email:cred.user.email});
    localStorage.setItem('schoolPortalUser',JSON.stringify({key:role+':'+recordId,name:rec.name||email,role:role[0].toUpperCase()+role.slice(1)}));
    return cred.user;
  }
  window.PortalAuth={auth,db,school,signIn,createAccount,logout:async()=>{clearSession();await auth.signOut();}};
})();
