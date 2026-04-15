import { getArticles } from '@/lib/blogArticles';

export default async function sitemap() {
  const baseUrl = 'https://gamble-shield-ai.vercel.app';
  const lastModified = new Date('2026-03-19T14:41:03+00:00');

  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/best-casinos`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/tips-and-education`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/stream`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const articles = await getArticles();
  const blogRoutes = articles.map((post) => ({
    url: `${baseUrl}/blog/${post.slug || post.id}`,
    lastModified: post.date ? new Date(post.date) : lastModified,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
