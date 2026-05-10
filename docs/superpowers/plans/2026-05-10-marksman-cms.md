# Marksman CMS — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the EmberInstruments Siteleaf RSS blog feed with local markdown files, and build Marksman — a generic, config-driven Git CMS admin panel deployed to GitHub Pages.

**Architecture:** Two phases. Phase 1 updates EmberInstruments to read blog posts from `app/_data/_blog/*.md` at build time using `gray-matter` + Node `fs`. Phase 2 builds the Marksman Vite+React SPA in a new repo — a client-side app that reads/writes markdown files in any GitHub repo via the Octokit REST API, with pages dynamically rendered from a `.cms.json` config file in each target repo.

**Tech Stack:** Next.js 14, gray-matter, Node fs (Phase 1) · Vite + React + TypeScript, SCSS modules, @octokit/rest, gray-matter, @uiw/react-md-editor, react-router-dom, Vitest + jsdom (Phase 2)

---

## File Map

### Phase 1 — EmberInstruments (existing repo)

| Action | Path |
|--------|------|
| Modify | `package.json` |
| Create | `app/utils/blog.ts` |
| Modify | `app/types/BlogPost.ts` |
| Modify | `app/blog/page.tsx` |
| Rename | `app/blog/[title]/` → `app/blog/[slug]/` |
| Modify | `app/blog/[slug]/page.tsx` |
| Modify | `app/_components/BlogList/BlogListItem.tsx` |
| Create | `app/_data/_blog/sample-post.md` |
| Create | `.cms.json` |

### Phase 2 — Marksman (new repo at `~/Documents/Github/marksman`)

| Action | Path |
|--------|------|
| Create | `vite.config.ts` |
| Create | `src/types/index.ts` |
| Create | `src/lib/storage.ts` + `src/lib/storage.test.ts` |
| Create | `src/lib/frontmatter.ts` + `src/lib/frontmatter.test.ts` |
| Create | `src/lib/github.ts` |
| Create | `src/context/ProjectContext.tsx` |
| Create | `src/App.tsx` |
| Create | `src/main.tsx` |
| Create | `src/styles/globals.scss` + `src/styles/_variables.scss` |
| Create | `src/components/ui/Button.tsx` + `.module.scss` |
| Create | `src/components/ui/Loader.tsx` + `.module.scss` |
| Create | `src/components/fields/TextField.tsx` |
| Create | `src/components/fields/TextareaField.tsx` |
| Create | `src/components/fields/DateField.tsx` |
| Create | `src/components/fields/SelectField.tsx` |
| Create | `src/components/fields/ImageField.tsx` |
| Create | `src/components/fields/MarkdownField.tsx` |
| Create | `src/pages/ProjectsPage.tsx` + `.module.scss` |
| Create | `src/pages/CollectionsPage.tsx` + `.module.scss` |
| Create | `src/pages/PostListPage.tsx` + `.module.scss` |
| Create | `src/pages/PostEditorPage.tsx` + `.module.scss` |
| Create | `.github/workflows/deploy.yml` |

---

## Phase 1: EmberInstruments — Switch to Local Markdown

### Task 1: Install gray-matter and add shared blog reader utility

**Repo:** `EmberInstruments`

**Files:**
- Modify: `package.json`
- Modify: `app/types/BlogPost.ts`
- Create: `app/utils/blog.ts`

- [ ] **Step 1: Install gray-matter**

```bash
cd ~/Documents/Github/EmberInstruments
npm install gray-matter
```

Expected: `gray-matter` appears in `package.json` dependencies.

- [ ] **Step 2: Add `slug` field to BlogPost type**

Replace the contents of `app/types/BlogPost.ts`:

```typescript
export type BlogPost = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  date: string;
  topic: string;
  thumbnail: string;
};
```

- [ ] **Step 3: Create the shared blog reader utility**

Create `app/utils/blog.ts`:

```typescript
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import type { BlogPost } from '../types/BlogPost';
import { formatDate } from './index';

const BLOG_DIR = join(process.cwd(), 'app/_data/_blog');

export async function readAllPosts(): Promise<BlogPost[]> {
  const files = await readdir(BLOG_DIR);
  const posts = await Promise.all(
    files
      .filter(f => f.endsWith('.md'))
      .map(async filename => {
        const slug = filename.replace(/\.md$/, '');
        const raw = await readFile(join(BLOG_DIR, filename), 'utf-8');
        const { data, content } = matter(raw);
        return {
          slug,
          title: (data.title as string) ?? '',
          summary: (data.summary as string) ?? '',
          description: content,
          date: (data.date as string) ?? '',
          topic: (data.topic as string) ?? '',
          thumbnail: (data.thumbnail as string) ?? '',
        } satisfies BlogPost;
      })
  );
  return posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(p => ({ ...p, date: formatDate(p.date) }));
}

export async function readPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const raw = await readFile(join(BLOG_DIR, `${slug}.md`), 'utf-8');
    const { data, content } = matter(raw);
    return {
      slug,
      title: (data.title as string) ?? '',
      summary: (data.summary as string) ?? '',
      description: content,
      date: formatDate(data.date as string),
      topic: (data.topic as string) ?? '',
      thumbnail: (data.thumbnail as string) ?? '',
    } satisfies BlogPost;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/types/BlogPost.ts app/utils/blog.ts package.json package-lock.json
git commit -m "feat: add blog.ts utility to read markdown posts from filesystem"
```

---

### Task 2: Update blog list page and add sample post

**Files:**
- Modify: `app/blog/page.tsx`
- Create: `app/_data/_blog/sample-post.md`

- [ ] **Step 1: Add a sample blog post**

Create `app/_data/_blog/sample-post.md`:

```markdown
---
title: "Sample Post"
summary: "This is a sample blog post to verify the markdown pipeline."
topic: "General"
date: "2026-05-10"
thumbnail: "/images/placeholder.png"
---

This is the body of the sample post. It confirms that the markdown-based blog pipeline is working correctly.
```

- [ ] **Step 2: Replace blog list page**

Replace the full contents of `app/blog/page.tsx`:

```typescript
import BlogList from '../_components/BlogList/BlogList';
import { readAllPosts } from '../utils/blog';

export const metadata = {
  title: 'Blog',
  description: 'Latest posts from Ember Instruments',
};

export default async function Blog() {
  const posts = await readAllPosts();
  return (
    <main>
      <h1>Blog</h1>
      <BlogList posts={posts} />
    </main>
  );
}
```

- [ ] **Step 3: Verify the blog list builds**

```bash
npm run build
```

Expected: build completes with no errors. Check `out/blog.html` exists.

- [ ] **Step 4: Commit**

```bash
git add app/blog/page.tsx app/_data/_blog/sample-post.md
git commit -m "feat: switch blog list to read from local markdown files"
```

---

### Task 3: Update blog detail page and fix post links

**Files:**
- Rename: `app/blog/[title]/` → `app/blog/[slug]/`
- Modify: `app/blog/[slug]/page.tsx`
- Modify: `app/_components/BlogList/BlogListItem.tsx`

- [ ] **Step 1: Rename the dynamic route directory**

```bash
mv "app/blog/[title]" "app/blog/[slug]"
```

- [ ] **Step 2: Replace blog detail page**

Replace the full contents of `app/blog/[slug]/page.tsx`:

```typescript
import BlogPost from '../../_components/BlogPost/BlogPost';
import { readAllPosts, readPostBySlug } from '../../utils/blog';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Post',
  description: 'Latest post from Ember Instruments',
};

type PostProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const posts = await readAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function Post({ params }: PostProps) {
  const post = await readPostBySlug(params.slug);
  if (!post) notFound();
  return (
    <main>
      <BlogPost
        title={post.title}
        date={post.date}
        description={post.description}
      />
    </main>
  );
}
```

- [ ] **Step 3: Update BlogListItem to link by slug**

Replace the `href` in `app/_components/BlogList/BlogListItem.tsx`. Change:

```typescript
<Link href={`/blog/${title}`}>
```

To:

```typescript
<Link href={`/blog/${slug}`}>
```

Also destructure `slug` from props. The component signature becomes:

```typescript
const BlogListItem = ({ slug, title, summary, date, topic, thumbnail }: BlogPost) => {
```

- [ ] **Step 4: Verify full build**

```bash
npm run build
```

Expected: build succeeds, `out/blog/` contains `sample-post.html`.

- [ ] **Step 5: Commit**

```bash
git add "app/blog/[slug]/page.tsx" app/_components/BlogList/BlogListItem.tsx
git commit -m "feat: switch blog detail page to slug-based routing"
```

---

### Task 4: Add .cms.json config to EmberInstruments

**Files:**
- Create: `.cms.json`

- [ ] **Step 1: Create the CMS config file**

Create `.cms.json` in the repo root:

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

- [ ] **Step 2: Commit**

```bash
git add .cms.json
git commit -m "feat: add .cms.json config for Marksman CMS"
```

---

## Phase 2: Marksman — New Repo

> All tasks in Phase 2 are in a **new directory**: `~/Documents/Github/marksman`
> Create the GitHub repo `marksman` (public or private) before starting.

---

### Task 5: Scaffold Vite + React + TypeScript project

**Files:**
- Create: entire project scaffold
- Modify: `vite.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Create the project**

```bash
cd ~/Documents/Github
npm create vite@latest marksman -- --template react-ts
cd marksman
```

- [ ] **Step 2: Install dependencies**

```bash
npm install react-router-dom @octokit/rest gray-matter @uiw/react-md-editor sass
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom
```

- [ ] **Step 3: Configure vite.config.ts**

Replace the full contents of `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/marksman/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
  optimizeDeps: {
    include: ['gray-matter'],
  },
});
```

- [ ] **Step 4: Create test setup file**

Create `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:ui": "vitest --ui"
```

- [ ] **Step 6: Remove Vite boilerplate**

```bash
rm -rf src/assets src/App.css src/index.css
```

- [ ] **Step 7: Verify the dev server starts**

```bash
npm run dev
```

Expected: dev server running at `http://localhost:5173/marksman/`.

Stop the server (`Ctrl+C`).

- [ ] **Step 8: Initialise git and connect to remote**

```bash
git init
git remote add origin https://github.com/marciukasb/marksman.git
git add .
git commit -m "feat: scaffold Vite React TypeScript project"
git branch -M master
git push -u origin master
```

---

### Task 6: Define TypeScript types

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Create types file**

Create `src/types/index.ts`:

```typescript
export type FieldType = 'text' | 'textarea' | 'date' | 'select' | 'image' | 'markdown';

export interface FieldConfig {
  name: string;
  type: FieldType;
  options?: string[];
}

export interface CollectionConfig {
  name: string;
  folder: string;
  imageFolder: string;
  fields: FieldConfig[];
}

export interface CmsConfig {
  collections: CollectionConfig[];
}

export interface Project {
  id: string;
  label: string;
  owner: string;
  repo: string;
  pat: string;
}

export interface PostFile {
  name: string;
  path: string;
  sha: string;
}

export interface ParsedPost {
  data: Record<string, string>;
  body: string;
  sha: string;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts src/test-setup.ts
git commit -m "feat: add shared TypeScript types"
```

---

### Task 7: Implement storage.ts with tests

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/lib/storage.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/storage.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { getProjects, saveProject, deleteProject } from './storage';
import type { Project } from '../types';

const PROJECT: Project = {
  id: 'abc123',
  label: 'Ember Instruments',
  owner: 'marciukasb',
  repo: 'EmberInstruments',
  pat: 'ghp_test',
};

beforeEach(() => {
  localStorage.clear();
});

describe('getProjects', () => {
  it('returns empty array when nothing is stored', () => {
    expect(getProjects()).toEqual([]);
  });
});

describe('saveProject', () => {
  it('saves a project and retrieves it', () => {
    saveProject(PROJECT);
    expect(getProjects()).toEqual([PROJECT]);
  });

  it('replaces an existing project with the same id', () => {
    saveProject(PROJECT);
    saveProject({ ...PROJECT, label: 'Updated' });
    const projects = getProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].label).toBe('Updated');
  });

  it('saves multiple distinct projects', () => {
    saveProject(PROJECT);
    saveProject({ ...PROJECT, id: 'xyz', label: 'Other' });
    expect(getProjects()).toHaveLength(2);
  });
});

describe('deleteProject', () => {
  it('removes a project by id', () => {
    saveProject(PROJECT);
    deleteProject(PROJECT.id);
    expect(getProjects()).toEqual([]);
  });

  it('does not error when id does not exist', () => {
    expect(() => deleteProject('nonexistent')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- storage.test.ts
```

Expected: test file fails with "Cannot find module './storage'".

- [ ] **Step 3: Implement storage.ts**

Create `src/lib/storage.ts`:

```typescript
import type { Project } from '../types';

const KEY = 'marksman:projects';

export function getProjects(): Project[] {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Project[]) : [];
}

export function saveProject(project: Project): void {
  const rest = getProjects().filter(p => p.id !== project.id);
  localStorage.setItem(KEY, JSON.stringify([...rest, project]));
}

export function deleteProject(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(getProjects().filter(p => p.id !== id)));
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- storage.test.ts
```

Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: add storage lib for project persistence"
```

---

### Task 8: Implement frontmatter.ts with tests

**Files:**
- Create: `src/lib/frontmatter.ts`
- Create: `src/lib/frontmatter.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/frontmatter.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parsePost, serializePost, generateSlug } from './frontmatter';

describe('generateSlug', () => {
  it('lowercases and hyphenates a title', () => {
    expect(generateSlug('My First Post')).toBe('my-first-post');
  });

  it('strips non-alphanumeric characters', () => {
    expect(generateSlug('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple spaces and hyphens', () => {
    expect(generateSlug('one  two---three')).toBe('one-two-three');
  });
});

describe('parsePost', () => {
  it('parses frontmatter and body from raw markdown', () => {
    const raw = `---\ntitle: "Hello"\ndate: "2026-01-01"\n---\n\nBody here.`;
    const { data, body } = parsePost(raw);
    expect(data.title).toBe('Hello');
    expect(data.date).toBe('2026-01-01');
    expect(body.trim()).toBe('Body here.');
  });
});

describe('serializePost', () => {
  it('round-trips data and body through serialize then parse', () => {
    const data = { title: 'Test', date: '2026-05-10' };
    const body = 'Post content here.';
    const raw = serializePost(data, body);
    const parsed = parsePost(raw);
    expect(parsed.data.title).toBe('Test');
    expect(parsed.body.trim()).toBe('Post content here.');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test -- frontmatter.test.ts
```

Expected: fails with "Cannot find module './frontmatter'".

- [ ] **Step 3: Implement frontmatter.ts**

Create `src/lib/frontmatter.ts`:

```typescript
import matter from 'gray-matter';

export function parsePost(raw: string): { data: Record<string, string>; body: string } {
  const { data, content } = matter(raw);
  return { data: data as Record<string, string>, body: content };
}

export function serializePost(data: Record<string, string>, body: string): string {
  return matter.stringify(body, data);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test -- frontmatter.test.ts
```

Expected: all 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/frontmatter.ts src/lib/frontmatter.test.ts
git commit -m "feat: add frontmatter parse/serialize utility"
```

---

### Task 9: Implement github.ts (Octokit wrapper)

**Files:**
- Create: `src/lib/github.ts`

- [ ] **Step 1: Create the GitHub API wrapper**

Create `src/lib/github.ts`:

```typescript
import { Octokit } from '@octokit/rest';
import type { CmsConfig, PostFile } from '../types';

function client(pat: string) {
  return new Octokit({ auth: pat });
}

function decodeBase64(encoded: string): string {
  return decodeURIComponent(escape(atob(encoded.replace(/\n/g, ''))));
}

function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export async function fetchConfig(pat: string, owner: string, repo: string): Promise<CmsConfig> {
  const octokit = client(pat);
  const { data } = await octokit.repos.getContent({ owner, repo, path: '.cms.json' });
  if ('content' in data) {
    return JSON.parse(decodeBase64(data.content)) as CmsConfig;
  }
  throw new Error('.cms.json not found or is a directory');
}

export async function listFiles(pat: string, owner: string, repo: string, folder: string): Promise<PostFile[]> {
  const octokit = client(pat);
  const { data } = await octokit.repos.getContent({ owner, repo, path: folder });
  if (!Array.isArray(data)) return [];
  return data
    .filter(f => f.type === 'file' && f.name.endsWith('.md'))
    .map(f => ({ name: f.name, path: f.path, sha: f.sha }));
}

export async function fetchFile(pat: string, owner: string, repo: string, path: string): Promise<{ content: string; sha: string }> {
  const octokit = client(pat);
  const { data } = await octokit.repos.getContent({ owner, repo, path });
  if ('content' in data && !Array.isArray(data)) {
    return { content: decodeBase64(data.content), sha: data.sha };
  }
  throw new Error(`File not found: ${path}`);
}

export async function putFile(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  sha?: string,
  branch?: string,
): Promise<void> {
  const octokit = client(pat);
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: encodeBase64(content),
    ...(sha ? { sha } : {}),
    ...(branch ? { branch } : {}),
  });
}

export async function uploadImage(
  pat: string,
  owner: string,
  repo: string,
  imageFolder: string,
  filename: string,
  base64Content: string,
): Promise<string> {
  const octokit = client(pat);
  const path = `${imageFolder}/${filename}`;
  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({ owner, repo, path });
    if (!Array.isArray(data) && 'sha' in data) sha = data.sha;
  } catch {
    // file does not exist yet — no sha needed
  }
  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message: `cms: upload image ${filename}`,
    content: base64Content,
    ...(sha ? { sha } : {}),
  });
  return `/${path}`;
}

export async function deleteFile(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  sha: string,
): Promise<void> {
  const octokit = client(pat);
  await octokit.repos.deleteFile({
    owner,
    repo,
    path,
    message: `cms: delete ${path}`,
    sha,
  });
}

export async function ensureDraftsBranch(
  pat: string,
  owner: string,
  repo: string,
  defaultBranch: string,
): Promise<void> {
  const octokit = client(pat);
  try {
    await octokit.repos.getBranch({ owner, repo, branch: 'cms-drafts' });
  } catch {
    const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${defaultBranch}` });
    await octokit.git.createRef({
      owner,
      repo,
      ref: 'refs/heads/cms-drafts',
      sha: ref.object.sha,
    });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/github.ts
git commit -m "feat: add GitHub API wrapper (Octokit)"
```

---

### Task 10: Set up routing, context, and app shell

**Files:**
- Create: `src/context/ProjectContext.tsx`
- Create: `src/App.tsx`
- Create: `src/main.tsx`

- [ ] **Step 1: Create ProjectContext**

Create `src/context/ProjectContext.tsx`:

```typescript
import { createContext, useContext, useState } from 'react';
import type { Project, CmsConfig, CollectionConfig } from '../types';

interface ProjectContextValue {
  project: Project | null;
  config: CmsConfig | null;
  activeCollection: CollectionConfig | null;
  setProject: (p: Project, c: CmsConfig) => void;
  setActiveCollection: (c: CollectionConfig) => void;
  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProjectState] = useState<Project | null>(null);
  const [config, setConfig] = useState<CmsConfig | null>(null);
  const [activeCollection, setActiveCollection] = useState<CollectionConfig | null>(null);

  function setProject(p: Project, c: CmsConfig) {
    setProjectState(p);
    setConfig(c);
    setActiveCollection(null);
  }

  function clearProject() {
    setProjectState(null);
    setConfig(null);
    setActiveCollection(null);
  }

  return (
    <ProjectContext.Provider value={{ project, config, activeCollection, setProject, setActiveCollection, clearProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
```

- [ ] **Step 2: Create App.tsx with HashRouter**

Create `src/App.tsx`:

```typescript
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProjectProvider } from './context/ProjectContext';
import ProjectsPage from './pages/ProjectsPage';
import CollectionsPage from './pages/CollectionsPage';
import PostListPage from './pages/PostListPage';
import PostEditorPage from './pages/PostEditorPage';

export default function App() {
  return (
    <ProjectProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<ProjectsPage />} />
          <Route path="/:owner/:repo" element={<CollectionsPage />} />
          <Route path="/:owner/:repo/:collection" element={<PostListPage />} />
          <Route path="/:owner/:repo/:collection/new" element={<PostEditorPage />} />
          <Route path="/:owner/:repo/:collection/edit/:slug" element={<PostEditorPage />} />
        </Routes>
      </HashRouter>
    </ProjectProvider>
  );
}
```

- [ ] **Step 3: Update main.tsx**

Replace `src/main.tsx`:

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 4: Create global styles**

Create `src/styles/_variables.scss`:

```scss
$color-bg: #0f0f0f;
$color-surface: #1a1a1a;
$color-border: #2e2e2e;
$color-text: #e8e8e8;
$color-text-muted: #888;
$color-accent: #c8a96e;
$color-danger: #e05555;
$radius: 6px;
$font: 'Inter', system-ui, sans-serif;
```

Create `src/styles/globals.scss`:

```scss
@use 'variables' as *;

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: $font;
  background: $color-bg;
  color: $color-text;
  min-height: 100vh;
}

a { color: inherit; text-decoration: none; }

input, textarea, select, button {
  font-family: inherit;
  font-size: inherit;
}
```

- [ ] **Step 5: Stub out page files so the router compiles**

Create placeholder `src/pages/ProjectsPage.tsx`:
```typescript
export default function ProjectsPage() { return <div>Projects</div>; }
```

Create placeholder `src/pages/CollectionsPage.tsx`:
```typescript
export default function CollectionsPage() { return <div>Collections</div>; }
```

Create placeholder `src/pages/PostListPage.tsx`:
```typescript
export default function PostListPage() { return <div>PostList</div>; }
```

Create placeholder `src/pages/PostEditorPage.tsx`:
```typescript
export default function PostEditorPage() { return <div>PostEditor</div>; }
```

- [ ] **Step 6: Verify dev server compiles**

```bash
npm run dev
```

Expected: compiles with no TypeScript errors. Browser shows "Projects" at `http://localhost:5173/marksman/`. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add src/
git commit -m "feat: set up routing, ProjectContext, and app shell"
```

---

### Task 11: Shared UI components

**Files:**
- Create: `src/components/ui/Button.tsx` + `Button.module.scss`
- Create: `src/components/ui/Loader.tsx` + `Loader.module.scss`

- [ ] **Step 1: Create Button component**

Create `src/components/ui/Button.tsx`:

```typescript
import styles from './Button.module.scss';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

export default function Button({ variant = 'primary', loading, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading…' : children}
    </button>
  );
}
```

Create `src/components/ui/Button.module.scss`:

```scss
@use '../../styles/variables' as *;

.button {
  padding: 8px 18px;
  border: none;
  border-radius: $radius;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.15s;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.primary { background: $color-accent; color: #000; }
.secondary { background: $color-surface; color: $color-text; border: 1px solid $color-border; }
.danger { background: $color-danger; color: #fff; }
```

- [ ] **Step 2: Create Loader component**

Create `src/components/ui/Loader.tsx`:

```typescript
import styles from './Loader.module.scss';

export default function Loader() {
  return <div className={styles.loader} aria-label="Loading" />;
}
```

Create `src/components/ui/Loader.module.scss`:

```scss
@use '../../styles/variables' as *;

.loader {
  width: 28px;
  height: 28px;
  border: 3px solid $color-border;
  border-top-color: $color-accent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 40px auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/
git commit -m "feat: add Button and Loader UI components"
```

---

### Task 12: ProjectsPage

**Files:**
- Modify: `src/pages/ProjectsPage.tsx`
- Create: `src/pages/ProjectsPage.module.scss`

- [ ] **Step 1: Implement ProjectsPage**

Replace `src/pages/ProjectsPage.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, saveProject, deleteProject } from '../lib/storage';
import { fetchConfig } from '../lib/github';
import { useProject } from '../context/ProjectContext';
import Button from '../components/ui/Button';
import type { Project } from '../types';
import styles from './ProjectsPage.module.scss';

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(getProjects);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', owner: '', repo: '', pat: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setProject } = useProject();
  const navigate = useNavigate();

  async function handleOpen(project: Project) {
    setLoading(true);
    setError('');
    try {
      const config = await fetchConfig(project.pat, project.owner, project.repo);
      setProject(project, config);
      navigate(`/${project.owner}/${project.repo}`);
    } catch {
      setError(`Could not load .cms.json from ${project.owner}/${project.repo}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const project: Project = { id: generateId(), ...form };
    try {
      await fetchConfig(project.pat, project.owner, project.repo);
      saveProject(project);
      setProjects(getProjects());
      setShowForm(false);
      setForm({ label: '', owner: '', repo: '', pat: '' });
    } catch {
      setError('Could not connect. Check the repo name, PAT, and that .cms.json exists.');
    }
  }

  function handleDelete(id: string) {
    deleteProject(id);
    setProjects(getProjects());
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Marksman</h1>
      {error && <p className={styles.error}>{error}</p>}

      <ul className={styles.list}>
        {projects.map(p => (
          <li key={p.id} className={styles.item}>
            <button className={styles.itemLabel} onClick={() => handleOpen(p)} disabled={loading}>
              <span>{p.label}</span>
              <span className={styles.itemRepo}>{p.owner}/{p.repo}</span>
            </button>
            <Button variant="danger" onClick={() => handleDelete(p.id)}>Remove</Button>
          </li>
        ))}
      </ul>

      {showForm ? (
        <form className={styles.form} onSubmit={handleAdd}>
          <h2>Add project</h2>
          <input required placeholder="Label" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
          <input required placeholder="Owner (e.g. marciukasb)" value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))} />
          <input required placeholder="Repo (e.g. EmberInstruments)" value={form.repo} onChange={e => setForm(f => ({ ...f, repo: e.target.value }))} />
          <input required type="password" placeholder="GitHub PAT" value={form.pat} onChange={e => setForm(f => ({ ...f, pat: e.target.value }))} />
          <div className={styles.formActions}>
            <Button type="submit">Connect</Button>
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setShowForm(true)}>+ Add project</Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add page styles**

Create `src/pages/ProjectsPage.module.scss`:

```scss
@use '../styles/variables' as *;

.page { max-width: 600px; margin: 60px auto; padding: 0 24px; }
.title { font-size: 2rem; margin-bottom: 32px; }
.error { color: $color-danger; margin-bottom: 16px; font-size: 0.9rem; }

.list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }

.item {
  display: flex;
  align-items: center;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  overflow: hidden;
}

.itemLabel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 14px 18px;
  background: none;
  border: none;
  cursor: pointer;
  color: $color-text;
  text-align: left;
  &:hover { background: $color-border; }
}

.itemRepo { font-size: 0.8rem; color: $color-text-muted; margin-top: 2px; }

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: $color-surface;
  padding: 20px;
  border-radius: $radius;
  border: 1px solid $color-border;

  h2 { font-size: 1.1rem; margin-bottom: 4px; }

  input {
    background: $color-bg;
    border: 1px solid $color-border;
    color: $color-text;
    padding: 8px 12px;
    border-radius: $radius;
    outline: none;
    &:focus { border-color: $color-accent; }
  }
}

.formActions { display: flex; gap: 10px; margin-top: 6px; }
```

- [ ] **Step 3: Test in browser**

```bash
npm run dev
```

Open `http://localhost:5173/marksman/`. Verify: project list renders, "Add project" form opens/closes, connecting to a repo with a valid PAT and `.cms.json` navigates to the collections page. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ProjectsPage.tsx src/pages/ProjectsPage.module.scss
git commit -m "feat: implement ProjectsPage"
```

---

### Task 13: CollectionsPage

**Files:**
- Modify: `src/pages/CollectionsPage.tsx`
- Create: `src/pages/CollectionsPage.module.scss`

- [ ] **Step 1: Implement CollectionsPage**

Replace `src/pages/CollectionsPage.tsx`:

```typescript
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import styles from './CollectionsPage.module.scss';

export default function CollectionsPage() {
  const { project, config, setActiveCollection, clearProject } = useProject();
  const navigate = useNavigate();

  if (!project || !config) {
    navigate('/');
    return null;
  }

  function handleSelect(index: number) {
    const collection = config!.collections[index];
    setActiveCollection(collection);
    const encodedName = encodeURIComponent(collection.name);
    navigate(`/${project!.owner}/${project!.repo}/${encodedName}`);
  }

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => { clearProject(); navigate('/'); }}>← Projects</button>
      <h1 className={styles.title}>{project.label}</h1>
      <ul className={styles.list}>
        {config.collections.map((col, i) => (
          <li key={col.name}>
            <button className={styles.item} onClick={() => handleSelect(i)}>
              {col.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Add styles**

Create `src/pages/CollectionsPage.module.scss`:

```scss
@use '../styles/variables' as *;

.page { max-width: 600px; margin: 60px auto; padding: 0 24px; }
.back { background: none; border: none; color: $color-text-muted; cursor: pointer; margin-bottom: 24px; font-size: 0.9rem; }
.title { font-size: 1.8rem; margin-bottom: 24px; }
.list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.item {
  width: 100%;
  text-align: left;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  padding: 16px 20px;
  color: $color-text;
  cursor: pointer;
  font-size: 1rem;
  &:hover { border-color: $color-accent; }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/CollectionsPage.tsx src/pages/CollectionsPage.module.scss
git commit -m "feat: implement CollectionsPage"
```

---

### Task 14: PostListPage

**Files:**
- Modify: `src/pages/PostListPage.tsx`
- Create: `src/pages/PostListPage.module.scss`

- [ ] **Step 1: Implement PostListPage**

Replace `src/pages/PostListPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { listFiles, fetchFile, deleteFile } from '../lib/github';
import { parsePost } from '../lib/frontmatter';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import type { PostFile } from '../types';
import styles from './PostListPage.module.scss';

interface PostEntry {
  file: PostFile;
  title: string;
  date: string;
}

export default function PostListPage() {
  const { project, activeCollection } = useProject();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!project || !activeCollection) { navigate('/'); return; }
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const files = await listFiles(project!.pat, project!.owner, project!.repo, activeCollection!.folder);
      const entries = await Promise.all(
        files.map(async file => {
          const { content } = await fetchFile(project!.pat, project!.owner, project!.repo, file.path);
          const { data } = parsePost(content);
          return { file, title: data.title ?? file.name, date: data.date ?? '' };
        })
      );
      setPosts(entries.sort((a, b) => b.date.localeCompare(a.date)));
    } catch {
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(entry: PostEntry) {
    if (!confirm(`Delete "${entry.title}"?`)) return;
    try {
      await deleteFile(project!.pat, project!.owner, project!.repo, entry.file.path, entry.file.sha);
      setPosts(p => p.filter(x => x.file.sha !== entry.file.sha));
    } catch {
      setError('Failed to delete post.');
    }
  }

  function handleEdit(entry: PostEntry) {
    const slug = entry.file.name.replace(/\.md$/, '');
    navigate(`/${project!.owner}/${project!.repo}/${encodeURIComponent(activeCollection!.name)}/edit/${slug}`);
  }

  if (!project || !activeCollection) return null;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(`/${project.owner}/${project.repo}`)}>← {project.label}</button>
      <div className={styles.header}>
        <h1 className={styles.title}>{activeCollection.name}</h1>
        <Button onClick={() => navigate(`/${project.owner}/${project.repo}/${encodeURIComponent(activeCollection.name)}/new`)}>
          + New post
        </Button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <Loader /> : (
        <ul className={styles.list}>
          {posts.map(entry => (
            <li key={entry.file.sha} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{entry.title}</span>
                <span className={styles.itemDate}>{entry.date}</span>
              </div>
              <div className={styles.itemActions}>
                <Button variant="secondary" onClick={() => handleEdit(entry)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(entry)}>Delete</Button>
              </div>
            </li>
          ))}
          {posts.length === 0 && <p className={styles.empty}>No posts yet.</p>}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add styles**

Create `src/pages/PostListPage.module.scss`:

```scss
@use '../styles/variables' as *;

.page { max-width: 700px; margin: 60px auto; padding: 0 24px; }
.back { background: none; border: none; color: $color-text-muted; cursor: pointer; margin-bottom: 24px; font-size: 0.9rem; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.title { font-size: 1.8rem; }
.error { color: $color-danger; margin-bottom: 16px; }
.list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $color-surface;
  border: 1px solid $color-border;
  border-radius: $radius;
  padding: 14px 18px;
}
.itemInfo { display: flex; flex-direction: column; gap: 4px; }
.itemTitle { font-weight: 500; }
.itemDate { font-size: 0.8rem; color: $color-text-muted; }
.itemActions { display: flex; gap: 8px; }
.empty { color: $color-text-muted; }
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/PostListPage.tsx src/pages/PostListPage.module.scss
git commit -m "feat: implement PostListPage"
```

---

### Task 15: Field components (text, textarea, date, select)

**Files:**
- Create: `src/components/fields/TextField.tsx`
- Create: `src/components/fields/TextareaField.tsx`
- Create: `src/components/fields/DateField.tsx`
- Create: `src/components/fields/SelectField.tsx`
- Create: `src/components/fields/fields.module.scss`

- [ ] **Step 1: Create shared field styles**

Create `src/components/fields/fields.module.scss`:

```scss
@use '../../styles/variables' as *;

.field { display: flex; flex-direction: column; gap: 6px; }

.label { font-size: 0.85rem; color: $color-text-muted; text-transform: capitalize; }

.input, .textarea, .select {
  background: $color-bg;
  border: 1px solid $color-border;
  color: $color-text;
  padding: 8px 12px;
  border-radius: $radius;
  outline: none;
  width: 100%;
  &:focus { border-color: $color-accent; }
}

.textarea { resize: vertical; min-height: 100px; }
```

- [ ] **Step 2: Create TextField**

Create `src/components/fields/TextField.tsx`:

```typescript
import styles from './fields.module.scss';

interface Props {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextField({ name, value, onChange }: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{name}</label>
      <input className={styles.input} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
```

- [ ] **Step 3: Create TextareaField**

Create `src/components/fields/TextareaField.tsx`:

```typescript
import styles from './fields.module.scss';

interface Props {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function TextareaField({ name, value, onChange }: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{name}</label>
      <textarea className={styles.textarea} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
```

- [ ] **Step 4: Create DateField**

Create `src/components/fields/DateField.tsx`:

```typescript
import styles from './fields.module.scss';

interface Props {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function DateField({ name, value, onChange }: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{name}</label>
      <input type="date" className={styles.input} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
```

- [ ] **Step 5: Create SelectField**

Create `src/components/fields/SelectField.tsx`:

```typescript
import styles from './fields.module.scss';

interface Props {
  name: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}

export default function SelectField({ name, value, options, onChange }: Props) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{name}</label>
      <select className={styles.select} value={value} onChange={e => onChange(e.target.value)}>
        <option value="">— Select —</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/fields/
git commit -m "feat: add text, textarea, date, and select field components"
```

---

### Task 16: ImageField component

**Files:**
- Create: `src/components/fields/ImageField.tsx`

- [ ] **Step 1: Create ImageField**

Create `src/components/fields/ImageField.tsx`:

```typescript
import { useRef, useState } from 'react';
import { uploadImage } from '../../lib/github';
import styles from './fields.module.scss';
import imageStyles from './ImageField.module.scss';

interface Props {
  name: string;
  value: string;
  onChange: (value: string) => void;
  pat: string;
  owner: string;
  repo: string;
  imageFolder: string;
}

export default function ImageField({ name, value, onChange, pat, owner, repo, imageFolder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const path = await uploadImage(pat, owner, repo, imageFolder, file.name, base64);
        onChange(path);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Upload failed.');
      setUploading(false);
    }
  }

  return (
    <div className={styles.field}>
      <label className={styles.label}>{name}</label>
      <div className={imageStyles.row}>
        <input className={styles.input} value={value} onChange={e => onChange(e.target.value)} placeholder="/images/photo.png" />
        <button type="button" className={imageStyles.uploadBtn} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      {value && <img src={value} alt="preview" className={imageStyles.preview} />}
      {error && <span className={imageStyles.error}>{error}</span>}
    </div>
  );
}
```

Create `src/components/fields/ImageField.module.scss`:

```scss
@use '../../styles/variables' as *;

.row { display: flex; gap: 8px; }

.uploadBtn {
  background: $color-surface;
  border: 1px solid $color-border;
  color: $color-text;
  padding: 8px 14px;
  border-radius: $radius;
  cursor: pointer;
  white-space: nowrap;
  &:disabled { opacity: 0.5; }
}

.preview {
  margin-top: 8px;
  max-height: 120px;
  border-radius: $radius;
  object-fit: cover;
}

.error { font-size: 0.8rem; color: $color-danger; }
```

- [ ] **Step 2: Commit**

```bash
git add src/components/fields/ImageField.tsx src/components/fields/ImageField.module.scss
git commit -m "feat: add ImageField with GitHub upload"
```

---

### Task 17: MarkdownField component

**Files:**
- Create: `src/components/fields/MarkdownField.tsx`

- [ ] **Step 1: Create MarkdownField**

Create `src/components/fields/MarkdownField.tsx`:

```typescript
import MDEditor from '@uiw/react-md-editor';
import styles from './fields.module.scss';

interface Props {
  name: string;
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownField({ name, value, onChange }: Props) {
  return (
    <div className={styles.field} data-color-mode="dark">
      <label className={styles.label}>{name}</label>
      <MDEditor
        value={value}
        onChange={v => onChange(v ?? '')}
        height={400}
        preview="live"
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/fields/MarkdownField.tsx
git commit -m "feat: add MarkdownField with split-pane editor"
```

---

### Task 18: PostEditorPage

**Files:**
- Modify: `src/pages/PostEditorPage.tsx`
- Create: `src/pages/PostEditorPage.module.scss`

- [ ] **Step 1: Implement PostEditorPage**

Replace `src/pages/PostEditorPage.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { fetchFile, putFile, ensureDraftsBranch } from '../lib/github';
import { parsePost, serializePost, generateSlug } from '../lib/frontmatter';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import TextField from '../components/fields/TextField';
import TextareaField from '../components/fields/TextareaField';
import DateField from '../components/fields/DateField';
import SelectField from '../components/fields/SelectField';
import ImageField from '../components/fields/ImageField';
import MarkdownField from '../components/fields/MarkdownField';
import type { FieldConfig } from '../types';
import styles from './PostEditorPage.module.scss';

export default function PostEditorPage() {
  const { project, activeCollection } = useProject();
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const [values, setValues] = useState<Record<string, string>>({});
  const [fileSha, setFileSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(!!slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isNew = !slug;

  useEffect(() => {
    if (!project || !activeCollection) { navigate('/'); return; }
    if (!isNew) loadPost();
  }, []);

  async function loadPost() {
    const path = `${activeCollection!.folder}/${slug}.md`;
    try {
      const { content, sha } = await fetchFile(project!.pat, project!.owner, project!.repo, path);
      const { data, body } = parsePost(content);
      const bodyField = activeCollection!.fields.find(f => f.type === 'markdown');
      setValues({ ...data, ...(bodyField ? { [bodyField.name]: body } : {}) });
      setFileSha(sha);
    } catch {
      setError('Failed to load post.');
    } finally {
      setLoading(false);
    }
  }

  function setField(name: string, value: string) {
    setValues(v => ({ ...v, [name]: value }));
  }

  async function save(draft: boolean) {
    setSaving(true);
    setError('');
    try {
      const bodyField = activeCollection!.fields.find(f => f.type === 'markdown');
      const body = bodyField ? (values[bodyField.name] ?? '') : '';
      const frontmatter = Object.fromEntries(
        Object.entries(values).filter(([k]) => k !== bodyField?.name)
      );
      const content = serializePost(frontmatter, body);
      const title = values.title ?? 'untitled';
      const postSlug = isNew ? generateSlug(title) : slug!;
      const path = `${activeCollection!.folder}/${postSlug}.md`;
      const message = `cms: ${isNew ? 'publish' : 'update'} "${title}"`;
      let branch: string | undefined;
      if (draft) {
        await ensureDraftsBranch(project!.pat, project!.owner, project!.repo, 'master');
        branch = 'cms-drafts';
      }
      await putFile(project!.pat, project!.owner, project!.repo, path, content, message, fileSha, branch);
      navigate(`/${project!.owner}/${project!.repo}/${encodeURIComponent(activeCollection!.name)}`);
    } catch (e) {
      setError('Failed to save. Check your PAT permissions.');
    } finally {
      setSaving(false);
    }
  }

  function renderField(field: FieldConfig) {
    const value = values[field.name] ?? '';
    const onChange = (v: string) => setField(field.name, v);

    switch (field.type) {
      case 'text': return <TextField key={field.name} name={field.name} value={value} onChange={onChange} />;
      case 'textarea': return <TextareaField key={field.name} name={field.name} value={value} onChange={onChange} />;
      case 'date': return <DateField key={field.name} name={field.name} value={value} onChange={onChange} />;
      case 'select': return <SelectField key={field.name} name={field.name} value={value} options={field.options ?? []} onChange={onChange} />;
      case 'image': return (
        <ImageField
          key={field.name}
          name={field.name}
          value={value}
          onChange={onChange}
          pat={project!.pat}
          owner={project!.owner}
          repo={project!.repo}
          imageFolder={activeCollection!.imageFolder}
        />
      );
      case 'markdown': return <MarkdownField key={field.name} name={field.name} value={value} onChange={onChange} />;
      default: return null;
    }
  }

  if (!project || !activeCollection) return null;

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(`/${project.owner}/${project.repo}/${encodeURIComponent(activeCollection.name)}`)}>
        ← {activeCollection.name}
      </button>
      <h1 className={styles.title}>{isNew ? 'New post' : 'Edit post'}</h1>
      {error && <p className={styles.error}>{error}</p>}
      {loading ? <Loader /> : (
        <>
          <div className={styles.fields}>
            {activeCollection.fields.map(renderField)}
          </div>
          <div className={styles.actions}>
            <Button onClick={() => save(false)} loading={saving}>Publish</Button>
            <Button variant="secondary" onClick={() => save(true)} loading={saving}>Save draft</Button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add styles**

Create `src/pages/PostEditorPage.module.scss`:

```scss
@use '../styles/variables' as *;

.page { max-width: 800px; margin: 60px auto; padding: 0 24px 80px; }
.back { background: none; border: none; color: $color-text-muted; cursor: pointer; margin-bottom: 24px; font-size: 0.9rem; }
.title { font-size: 1.8rem; margin-bottom: 32px; }
.error { color: $color-danger; margin-bottom: 16px; }
.fields { display: flex; flex-direction: column; gap: 20px; }
.actions { display: flex; gap: 12px; margin-top: 32px; padding-top: 24px; border-top: 1px solid $color-border; }
```

- [ ] **Step 3: Test full flow in browser**

```bash
npm run dev
```

1. Open `http://localhost:5173/marksman/`
2. Add the EmberInstruments project (use your real PAT)
3. Open the project → open Blog Posts collection
4. Verify the sample post appears in the list
5. Click "Edit" on the sample post — verify all fields populate
6. Click "New post" — fill in fields, click "Publish"
7. Verify a new `.md` file appears in `EmberInstruments/app/_data/_blog/` on GitHub after the commit

Stop the server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/PostEditorPage.tsx src/pages/PostEditorPage.module.scss
git commit -m "feat: implement PostEditorPage with dynamic field rendering"
```

---

### Task 19: GitHub Actions deploy to GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [master]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

- [ ] **Step 2: Enable GitHub Pages in repo settings**

Go to `https://github.com/marciukasb/marksman/settings/pages` and set:
- Source: **Deploy from a branch**
- Branch: `gh-pages` / `/ (root)`

- [ ] **Step 3: Push and verify deploy**

```bash
git add .github/
git commit -m "ci: add GitHub Pages deploy workflow"
git push origin master
```

Expected: GitHub Actions runs the workflow, `gh-pages` branch is created, site is live at `https://marciukasb.github.io/marksman/` within ~2 minutes.

- [ ] **Step 4: Smoke test on GitHub Pages**

Open `https://marciukasb.github.io/marksman/` in the browser. Add the EmberInstruments project with your PAT. Verify you can navigate to Blog Posts and see the sample post.
