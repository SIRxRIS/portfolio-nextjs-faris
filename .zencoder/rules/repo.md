# Repository Notes

- **Framework**: Next.js app using TypeScript.
- **Key Components**: AdminPanel handles CRUD operations for projects and certificates with Firebase.
- **Data Sources**: Combines Firestore documents with local JSON fallback located in `src/data`.
- **Styling**: Mix of Tailwind CSS, MUI AppBar/Tabs, and custom components.
- **Common Issue**: Ensure Firestore responses include required `id` fields to avoid `undefined` in handlers.
