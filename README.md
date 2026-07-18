# Notesphere — Personal Notes + Public Blog Platform (React + Firebase)

A full-stack notes app where authenticated users organize personal notes in a
VS Code–style folder/file tree, write in Markdown with **KaTeX math support**,
attach metadata (cover image, tags), and **publish** any note as a public blog
post. The public side has search, tag browsing, trending, likes/views, user
profiles, and a follow system with an activity feed and simple recommendations.

## Features

- 🔐 **Auth-gated app** — Email/password + Google sign-in via Firebase Auth. Only
  signed-in users can create/edit/delete/publish notes; everything else is
  enforced server-side by Firestore Security Rules (see `firestore.rules`).
- 🗂 **Hierarchical folders/files** — nested folder tree in the sidebar, create
  files/folders anywhere, rename/delete recursively, like a mini VS Code explorer.
- 📝 **Markdown editor** with live split-pane preview, autosave, and full
  **KaTeX** math rendering (`$inline$` and `$$block$$`).
- 🖼 **Metadata** — cover image (uploaded to Firebase Storage) + tags per note.
- 🌍 **Publish button** — copies the note into a public `posts` collection
  (editable independently afterward) and flips the note to "published" with a
  link back to the live post. **Unpublish** removes it from the public feed.
- ⬇️ **Download** any note/post as **.md** or **.pdf** (client-side, no server
  needed) — `html2pdf.js` renders the live preview pane to PDF.
- 🔎 **Search** across title/content/tags/author, **tag browser**, and a
  **Trending** page (simple score: views + 3×likes over recent posts).
- ❤️ **Likes & views** on public posts.
- 👤 **Public profile pages** — bio, published posts grid, follower/following
  counts, Follow/Unfollow, and an activity feed (publishes, follows, likes).
- 🤝 **Recommendations** — suggested authors to follow (by follower count) and
  tag-overlap based post recommendations, computed client-side from Firestore
  data (swap in a Cloud Function / BigQuery job later for real scale).

## Tech stack

- React 18 + Vite, React Router
- Tailwind CSS
- Firebase: Auth, Firestore, Storage (Hosting config included)
- `react-markdown` + `remark-math` + `rehype-katex` + `remark-gfm`
- `html2pdf.js` for PDF export

## Firestore data model

```
users/{uid}
  uid, displayName, username, email, photoURL, bio,
  followers: string[], following: string[], createdAt

notes/{noteId}                 // PRIVATE — owner only
  ownerId, parentId (null = root folder), type: 'folder' | 'file',
  name, tags: string[], cover, content (markdown),
  published: bool, publishedPostId,
  createdAt, updatedAt

posts/{postId}                 // PUBLIC — published blogs
  authorId, authorName, authorUsername, authorPhoto,
  title, content, cover, tags: string[], noteId,
  views: number, likeCount: number, likes: string[],
  createdAt, updatedAt

activity/{id}
  userId, type: 'publish' | 'follow' | 'like', targetId, meta, createdAt
```

## Setup

1. **Create a Firebase project** at https://console.firebase.google.com.
2. Enable **Authentication** → Sign-in methods: Email/Password and Google.
3. Enable **Firestore Database** (production mode) and **Storage**.
4. In Project Settings → General → "Your apps", create a Web app and copy the
   config values into a `.env` file (copy `.env.example` → `.env`):

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

5. Install the Firebase CLI and deploy rules/indexes:

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add        # select your project
   firebase deploy --only firestore:rules,firestore:indexes,storage
   ```

6. Install dependencies and run locally:

   ```bash
   npm install
   npm run dev
   ```

7. Build & deploy the frontend (optional, via Firebase Hosting):

   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Security notes

- All write access to `notes` is restricted to the document owner
  (`ownerId == request.auth.uid`) — see `firestore.rules`.
- `posts` are publicly readable (it's a public blog) but only the author can
  edit/delete their own post; any signed-in user may only mutate the
  `likes`/`likeCount`/`views` fields (enforced via `diff().affectedKeys()`).
- Storage cover uploads are restricted to the authenticated user's own
  `covers/{uid}/...` path and capped at 5MB, images only — see `storage.rules`.

## Extending further

- Add Cloud Functions to recompute trending scores on a schedule instead of
  client-side, and to fan out activity/notifications to followers.
- Add full-text search (Algolia/Typesense) instead of the current client-side
  substring search once the `posts` collection grows large.
- Add comments as a `posts/{postId}/comments` subcollection.
