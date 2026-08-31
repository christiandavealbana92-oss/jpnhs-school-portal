JPNHS SCHOOL PORTAL

ROLES
- Administrator: username Administrator / password isAdmin1234. Administrator manages school configuration, staff, portal status, backups, and VIEW which features are unlocked.
- VA: private owner area available through Index > Other Options > VA Access. VA controls feature unlocks and plan activation.
- Registrar: manages students, sections, subjects, and teacher assignments only within the grade levels enabled by Administrator.
- Teacher: sees students/classes through Registrar-created teacher assignments and enters grades.
- Student: normal student portal.

GRADE LEVEL SETUP
Administrator > Configuration lets the school check any levels it offers: Kindergarten, Grades 1-12, and College 1-4. The Registrar automatically receives only the checked levels.

SUBJECT SETUP
Subjects are added by the Registrar under Classes & Assignments. Administrator does not add subjects.

IMPORTANT
The Administrator username/password are implemented in the frontend for this static prototype. For production security, move authentication/authorization to Firebase Authentication + Realtime Database rules or a trusted backend; never rely on hidden menus or frontend credentials alone.


Community Feed Update
- Generic school-branded main feed.
- Text-only posts, announcements, and multi-person call-outs.
- Call-outs support ID Search or Name Search.
- Notifications link directly to the referenced post.
- Poster can delete their own post; Administrator can delete any post.
- VA remains private and is not shown in the main portal menu.
