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
