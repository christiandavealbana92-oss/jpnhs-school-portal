JPNHS SCHOOL PORTAL — MODERNIZED STATIC BUILD

Updated from the client preference PDF:
- Modern light UI using blue + maroon accents.
- Removed the temporary logo treatment for now.
- Added a modern public landing page: index.html.
- Kept the client-facing navigation limited to the school portal roles; the VA is not exposed in the public/client UI.

REGISTRAR FIXES
- Registrar can edit an existing student directly from Student Records.
- Editing saves back to the same Student ID/path instead of creating a new student.
- Existing grades, Core Values, attendance, and other stored fields are preserved during a student profile update.
- Edit mode clearly shows the Student ID being updated.
- Added Cancel Edit behavior.

TEACHER FIXES
- Teacher identity is normalized to the logged-in Staff ID.
- Teacher assignments are matched against the actual Staff ID, UID, and other stored identifiers for compatibility with existing records.
- Subject and section choices are tied to the teacher's active assignments.
- Students are filtered by assigned subject/section/level and school year.
- Grade fields are real number inputs with 0–100 validation.
- Grade saves update the selected student's existing grade data without overwriting unrelated subjects.
- Teacher data is refreshed after login so recently-created registrar assignments are visible.

PDF / DESIGN
The uploaded client preference PDF is treated as the design reference. It shows the public portal, Student/Teacher/Admin/Registrar login screens, Super Admin dashboard sections, configuration, backup, and VA screens. The current build modernizes that visual direction while keeping the existing working portal architecture. The logo is intentionally omitted for now.

VA
The VA is available from the landing page under a collapsed "Other Options" section so the owner can reach it in one go without placing it in the main client-facing menu. The VA page requires the configured owner email for sign-in. A static HTML page alone cannot provide trustworthy owner-only security; Firebase Database rules/custom claims or a trusted backend should enforce owner-only access server-side.

IMPORTANT SECURITY NOTE
This remains a static frontend architecture. For real student data, Firebase Realtime Database rules must enforce school and role permissions server-side. Do not rely only on hidden UI elements or page URLs for security.

GITHUB PAGES
Upload the HTML files to the repository root and enable Settings > Pages > Deploy from branch > main > /(root).

FILES
- index.html — modern public portal landing page
- super-admin.html — multi-school control panel
- registrar.html — enrollment, direct student editing, sections, assignments, reports
- teacher.html — assigned-class grade entry, Core Values, attendance, reports
- student.html — student portal
- archive.html — offline Excel archive viewer
- closed.html — renewal/closed portal screen
