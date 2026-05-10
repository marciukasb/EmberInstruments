import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fs/promises so tests don't touch the real filesystem
vi.mock('fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

import { readdir, readFile } from 'fs/promises';
import { readAllPosts, readPostBySlug } from './blog';

const SAMPLE_MD = `---
title: "Hello World"
summary: "A test post"
topic: "Tech"
date: "2026-01-15"
thumbnail: "/images/test.png"
---

Post body here.
`;

const SAMPLE_MD_2 = `---
title: "Older Post"
summary: "An older post"
topic: "News"
date: "2025-06-01"
thumbnail: "/images/old.png"
---

Older body.
`;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('readAllPosts', () => {
  it('returns empty array when no markdown files exist', async () => {
    vi.mocked(readdir).mockResolvedValue([] as any);
    const posts = await readAllPosts();
    expect(posts).toEqual([]);
  });

  it('parses frontmatter fields correctly', async () => {
    vi.mocked(readdir).mockResolvedValue(['hello-world.md'] as any);
    vi.mocked(readFile).mockResolvedValue(SAMPLE_MD as any);
    const posts = await readAllPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe('hello-world');
    expect(posts[0].title).toBe('Hello World');
    expect(posts[0].summary).toBe('A test post');
    expect(posts[0].topic).toBe('Tech');
    expect(posts[0].thumbnail).toBe('/images/test.png');
  });

  it('sorts posts by date descending (newest first)', async () => {
    vi.mocked(readdir).mockResolvedValue(['older-post.md', 'hello-world.md'] as any);
    vi.mocked(readFile)
      .mockResolvedValueOnce(SAMPLE_MD_2 as any)
      .mockResolvedValueOnce(SAMPLE_MD as any);
    const posts = await readAllPosts();
    expect(posts[0].slug).toBe('hello-world'); // 2026 > 2025
    expect(posts[1].slug).toBe('older-post');
  });

  it('formats date to human-readable string', async () => {
    vi.mocked(readdir).mockResolvedValue(['hello-world.md'] as any);
    vi.mocked(readFile).mockResolvedValue(SAMPLE_MD as any);
    const posts = await readAllPosts();
    expect(posts[0].date).toBe('January 15, 2026');
  });

  it('ignores non-markdown files', async () => {
    vi.mocked(readdir).mockResolvedValue(['hello-world.md', 'README.txt', '.DS_Store'] as any);
    vi.mocked(readFile).mockResolvedValue(SAMPLE_MD as any);
    const posts = await readAllPosts();
    expect(posts).toHaveLength(1);
  });

  it('skips files with malformed frontmatter without crashing', async () => {
    vi.mocked(readdir).mockResolvedValue(['good.md', 'bad.md'] as any);
    vi.mocked(readFile)
      .mockResolvedValueOnce(SAMPLE_MD as any)
      .mockRejectedValueOnce(new Error('ENOENT'));
    const posts = await readAllPosts();
    expect(posts).toHaveLength(1);
  });

  it('converts markdown body to HTML', async () => {
    vi.mocked(readdir).mockResolvedValue(['hello-world.md'] as any);
    vi.mocked(readFile).mockResolvedValue(SAMPLE_MD as any);
    const posts = await readAllPosts();
    expect(posts[0].description).toContain('<p>');
  });
});

describe('readPostBySlug', () => {
  it('returns null when file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));
    const post = await readPostBySlug('nonexistent');
    expect(post).toBeNull();
  });

  it('returns a parsed post for a valid slug', async () => {
    vi.mocked(readFile).mockResolvedValue(SAMPLE_MD as any);
    const post = await readPostBySlug('hello-world');
    expect(post).not.toBeNull();
    expect(post!.slug).toBe('hello-world');
    expect(post!.title).toBe('Hello World');
  });

  it('converts markdown body to HTML', async () => {
    vi.mocked(readFile).mockResolvedValue(SAMPLE_MD as any);
    const post = await readPostBySlug('hello-world');
    expect(post!.description).toContain('<p>');
  });
});
