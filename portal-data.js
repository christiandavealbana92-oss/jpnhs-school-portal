/* Canonical Firebase data map for every portal. Keep these paths identical everywhere. */
(function(){
  const clean=v=>String(v??'').trim();
  const sid=clean(new URLSearchParams(location.search).get('school')||'');
  window.PortalData={
    schoolId:sid,
    path:{
      school:()=>`schools/${sid}`,
      students:()=>`studentsBySchool/${sid}`,
      student:id=>`studentsBySchool/${sid}/${clean(id)}`,
      staff:()=>`staff/${sid}`,
      staffMember:id=>`staff/${sid}/${clean(id)}`,
      sections:()=>`sections/${sid}`,
      assignments:()=>`assignments/${sid}`,
      community:()=>`community/${sid}`,
      posts:()=>`community/${sid}/posts`,
      notifications:()=>`community/${sid}/notifications`,
      account:uid=>`accounts/${sid}/${clean(uid)}`,
      accountIndex:id=>`accountIndex/${sid}/${clean(id)}`
    },
    async get(ref){return (await window.db.ref(ref).once('value')).val()},
    async set(ref,value){return window.db.ref(ref).set(value)},
    async update(ref,value){return window.db.ref(ref).update(value)}
  };
  window.SCHOOL_ID=sid;
})();
