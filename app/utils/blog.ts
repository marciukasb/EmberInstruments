import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { BlogPost } from '../types/BlogPost';
import { formatDate } from './index';

const BLOG_DIR = join(process.cwd(), 'app/_data/_blog');

function coerceDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return (value as string) ?? '';
}

export async function readAllPosts(): Promise<BlogPost[]> {
  const files = await readdir(BLOG_DIR);
  const results = await Promise.allSettled(
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
          description: marked(content) as string,
          date: coerceDate(data.date),
          topic: (data.topic as string) ?? '',
          thumbnail: (data.thumbnail as string) ?? '',
        } satisfies BlogPost;
      })
  );
  const posts = results
    .filter((r): r is PromiseFulfilledResult<BlogPost> => r.status === 'fulfilled')
    .map(r => r.value);
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
      description: marked(content) as string,
      date: formatDate(coerceDate(data.date)),
      topic: (data.topic as string) ?? '',
      thumbnail: (data.thumbnail as string) ?? '',
    } satisfies BlogPost;
  } catch {
    return null;
  }
}
