JPNHS SCHOOL PORTAL — FULL STATIC BUILD

Files:
- super-admin.html — multi-school control panel, plans, feature toggles, staff creation, academic configuration, backup
- registrar.html — cascading enrollment, student records, section blocking, teacher/subject/section assignments, Excel/PDF
- teacher.html — assigned-class grade entry, Core Values, attendance, reports
- student.html — student login by ID + birthday, grades, Core Values, attendance, 2-page PDF
- archive.html — browser-only Excel archive viewer; no Firebase connection
- closed.html — renewal message

Firebase configuration is embedded in the HTML files for the supplied project.

IMPORTANT SECURITY NOTE:
This is a static frontend architecture. Student login by ID + birthday cannot be made truly private with Firebase Realtime Database alone because static pages have no trusted server/custom-token service. Before production use with real student data, use Firebase Authentication/custom claims or a small trusted backend/Cloud Function to issue per-user access tokens and enforce school/role rules. Do not use broad auth!=null database rules for production.

GITHUB PAGES:
Upload the HTML files to the repository root and enable Settings > Pages > Deploy from branch > main > /(root).

FIREBASE:
Enable Email/Password Authentication. Create the Super Admin email account manually. Realtime Database rules should remain locked until authentication and role rules are configured.

PLAN PRESETS:
BASIC 15000/year; STANDARD 30000/year; PREMIUM 50000/year. Super Admin can override individual features.

YEAR-END:
Use Export ALL Data to Excel before closing/archiving a school year. Upload that backup to archive.html later; archive.html stores nothing after the browser session ends.
