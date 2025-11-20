#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';

// Config
const frontendRoot = path.resolve(new URL(import.meta.url).pathname, '../../');
const srcRoot = path.join(frontendRoot, 'src');
const publicRoot = path.join(frontendRoot, 'public');
const routerFile = path.join(srcRoot, 'router', 'index.ts');
const templatesRoot = path.join(srcRoot, 'pages', 'templates');

// Helper to traverse template directories and return {topic, id}
async function collectTemplateRoutes() {
  const templatePaths = [];
  try {
    const topics = await fs.promises.readdir(templatesRoot);
    for (const topic of topics) {
      const topicDir = path.join(templatesRoot, topic);
      const statTopic = await fs.promises.stat(topicDir).catch(() => null);
      if (!statTopic || !statTopic.isDirectory()) continue;
      const templates = await fs.promises.readdir(topicDir).catch(() => []);
      for (const templateId of templates) {
        const tDir = path.join(topicDir, templateId);
        const stat = await fs.promises.stat(tDir).catch(() => null);
        if (!stat || !stat.isDirectory()) continue;
        const indexVue = path.join(tDir, 'index.vue');
        const fileExists = await fs.promises.stat(indexVue).then(() => true).catch(() => false);
        if (fileExists) templatePaths.push(`/${topic}/${templateId}`);
      }
    }
  } catch (err) {
    console.error('Error scanning templates directory:', err);
  }
  return templatePaths;
}

// Extract route paths from router/index.ts
async function collectStaticRoutes() {
  const data = await fs.promises.readFile(routerFile, 'utf8');
  const pathRegex = /path:\s*['\"]([^'\"]+)['\"]/g;
  const routes = new Set();
  let match;
  while ((match = pathRegex.exec(data)) !== null) {
    const p = match[1];
    // Skip wildcard notFound or pathMatch
    if (p.includes(':pathMatch') || p.includes('*')) continue;
    // Skip API-like or internal catchall
    if (p === '/:pathMatch(.*)*') continue;
    // If route has param and is optional (has ?), strip param
    if (p.includes(':') && p.includes('?')) {
      const stripped = p.replace(/:\w+\?/, '');
      // Remove trailing slash
      routes.add(stripped.replace(/\/$/, ''));
      continue;
    }
    // If route contains required params like :id (without ?), skip
    if (p.includes(':')) continue;
    routes.add(p);
  }
  return Array.from(routes);
}

async function main() {
  const hostname = process.env.SITE_URL || process.env.SITE_HOSTNAME || 'https://your-domain.com';
  console.log('Using hostname:', hostname);
  const urls = new Set();

  // include root
  urls.add('/');

  // collect routes from router
  const staticRoutes = await collectStaticRoutes();
  for (const r of staticRoutes) { urls.add(r); }

  // collect template routes
  const templateRoutes = await collectTemplateRoutes();
  for (const r of templateRoutes) { urls.add(r); }

  const sitemapStream = new SitemapStream({ hostname });

  // Convert set to array and add priorities
  const urlArray = Array.from(urls).sort();

  for (const url of urlArray) {
    // basic priority rules
    const priority = url === '/' ? 1.0 : 0.8;
    sitemapStream.write({ url, changefreq: 'weekly', priority });
  }

  sitemapStream.end();

  try {
    const data = await streamToPromise(sitemapStream);
    const xml = data.toString();
    await fs.promises.mkdir(publicRoot, { recursive: true });
    const sitemapPath = path.join(publicRoot, 'sitemap.xml');
    await fs.promises.writeFile(sitemapPath, xml, 'utf8');
    console.log('Sitemap written to', sitemapPath);
  } catch (err) {
    console.error('Failed to generate sitemap:', err);
    process.exit(1);
  }
}

main();
