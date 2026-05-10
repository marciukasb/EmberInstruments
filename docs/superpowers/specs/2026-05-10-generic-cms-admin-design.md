# Generic CMS Admin — Design Spec

**Date:** 2026-05-10  
**Status:** Approved

---

## Goal

Build a generic, config-driven, web-based CMS admin panel that any GitHub-hosted static site project can use. The admin reads a `.cms.json` config file from the target repo and generates the appropriate editing UI. No backend — operates entirely client-side via the GitHub REST API.

Initial consumer: `EmberInstruments` (blog posts). Future projects plug in by adding their own `.cms.json`.

---

## Architecture

```
EmberInstrumentsAdmin (new repo)
  → Vite + React SPA
  → GitHub Actions → FTP → admin.emberinstruments.com (or any domain)

Target repos (e.g. EmberInstruments)
  → each has a .cms.json config file in root
  → admin reads/writes content via GitHub REST API
  → commits trigger each project's own CI/CD (GitHub Actions → FTP deploy)
```

Auth: one GitHub Personal Access Token (PAT) per project, stored in `localStorage`. No OAuth app, no backend.

---

## Project Config Format (`.cms.json`)

Each target repo contains a `.cms.json` at its root:

```json
{
  "collections": [
    {
      "name": "Blog Posts",
      "folder": "app/_data/_blog",
      "imageFolder": "public/images",
      "fields": [
        { "name": "title", "type": "text" },
        { "name": "summary", "type": "textarea" },
        { "name": "topic", "type": "text" },
        { "name": "date", "type": "date" },
        { "name": "thumbnail", "type": "image" },
        { "name": "body", "type": "markdown" }
      ]
    }
  ]
}
```

### Supported field types

| Type | UI |
|------|----|
| `text` | Single-line input |
| `textarea` | Multi-line input |
| `date` | Date picker |
| `select` | Dropdown (requires `options: []` in field config) |
| `image` | File picker — uploads to `imageFolder`, inserts path into field |
| `markdown` | Split-pane editor (raw left, rendered preview right) |

---

## Screens

### 1. Projects (home)
- List of saved projects (label + repo)
- "Add project" → form: display name, `owner/repo`, GitHub PAT
- Projects saved to `localStorage`
- Click a project → fetches `.cms.json` from repo → enters Collections screen

### 2. Collections
- Lists collections defined in `.cms.json` with post count
- Click a collection → enters Post List screen

### 3. Post List
- Lists all `.md` files in the collection's `folder`, showing title + date parsed from frontmatter
- "New post" button → Post Editor (blank)
- Edit / Delete actions per row

### 4. Post Editor
- Dynamically rendered form from the collection's field config
- `image` fields: file picker uploads immediately on selection, field value set to resulting path
- `markdown` fields: split-pane editor (raw markdown left, live preview right)
- **Publish** — commits to the repo's default branch (triggers CI/CD → deploy)
- **Save draft** — commits to a `cms-drafts` branch (no deploy triggered). To publish a draft, open it and click Publish — the admin re-commits the file to the default branch.

---

## Data Flow (GitHub REST API)

All calls are made from the browser using the stored PAT as a Bearer token.

| Action | API call |
|--------|----------|
| Load config | `GET /repos/{owner}/{repo}/contents/.cms.json` |
| List posts | `GET /repos/{owner}/{repo}/contents/{folder}` |
| Open post | `GET /repos/{owner}/{repo}/contents/{folder}/{slug}.md` → base64 decode → parse frontmatter + body |
| Save post | `PUT /repos/{owner}/{repo}/contents/{folder}/{slug}.md` (base64 content + file SHA for updates) |
| Upload image | `PUT /repos/{owner}/{repo}/contents/{imageFolder}/{filename}` (base64) |
| Delete post | `DELETE /repos/{owner}/{repo}/contents/{folder}/{slug}.md` (requires file SHA) |

Commit message format: `cms: publish "{title}"` / `cms: update "{title}"` / `cms: delete "{title}"`

---

## Markdown File Format

```markdown
---
title: "Post Title"
summary: "A short summary"
topic: "Category"
date: "2026-05-10"
thumbnail: "/images/photo.png"
---

Post body content here...
```

Frontmatter is serialized/parsed using `gray-matter`. The `body` field (markdown type) maps to the content below the frontmatter separator.

**Slug generation:** filename is derived from the `title` field at first save — lowercased, spaces replaced with hyphens, non-alphanumeric characters stripped. Example: `"My First Post"` → `my-first-post.md`. Slug is fixed at creation time and does not change when the title is edited.

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Vite + React + TypeScript |
| Styling | Plain CSS modules (no heavy UI framework) |
| Markdown editor | `@uiw/react-md-editor` |
| Frontmatter | `gray-matter` |
| GitHub API | `@octokit/rest` |
| Routing | `react-router-dom` |
| Auth state | `localStorage` (PAT + saved projects) |

---

## Deployment

- New GitHub repo: `EmberInstrumentsAdmin` (or similar)
- GitHub Actions workflow: `npm run build` → FTP upload `dist/` to Hostinger subdomain (e.g. `admin.emberinstruments.com`)
- Same FTP pattern as the main site

---

## Required Changes to EmberInstruments (main site)

The blog currently fetches posts from Siteleaf via RSS. This needs to be replaced with a local markdown reader at build time:

1. Add `gray-matter` dependency
2. Replace `fetchBlogPosts()` in `app/blog/page.tsx` with a function that reads `app/_data/_blog/*.md` using Node `fs` at build time
3. Add `.cms.json` to the repo root (config for the admin)
4. Add a sample blog post to `app/_data/_blog/` to verify the pipeline

---

## Out of Scope

- Multi-user access / roles
- Rich text (WYSIWYG) — markdown only
- Media library browser (images are uploaded per-field, not managed centrally)
- Preview deployments for drafts
