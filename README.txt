JPNHS SCHOOL PORTAL

Files: index.html, super-admin.html, registrar.html, teacher.html, student.html, archive.html, closed.html
Firebase project: jpnhs-a2ba2
Realtime Database: https://jpnhs-a2ba2-default-rtdb.firebaseio.com/

IMPORTANT SETUP:
1. Firebase Authentication: create Super Admin email christiandavealbana92@gmail.com.
2. Super Admin creates Registrar and Teacher accounts from Staff Management.
3. Configure Realtime Database Security Rules before real student data is entered.
4. The Archive Portal is offline with respect to Firebase; it only reads uploaded Excel files in browser memory.
5. CDN libraries require internet when using the online pages. Archive.html can work without Firebase but its CDN libraries still need to be cached/downloaded or internet unless you self-host those libraries.
