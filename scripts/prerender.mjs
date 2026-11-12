import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

const rootDir = process.cwd();
const distDir = path.join(rootDir, 'dist');
const ssrDir = path.join(rootDir, 'dist-ssr');

// Only pre-render the 5 public indexable routes
const ROUTES = [
  '/',
  '/faq',
  '/contact',
  '/privacy-policy',
  '/terms-conditions',
];

async function prerender() {
  const templatePath = path.join(distDir, 'index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Build the SSR entry bundle using Vite so JSX and imports resolve cleanly
  await build({
    build: {
      ssr: path.join(rootDir, 'src/entry-prerender.jsx'),
      outDir: ssrDir,
      emptyOutDir: true,
    },
    logLevel: 'silent',
  });

  const entryUrl = pathToFileURL(path.join(ssrDir, 'entry-prerender.js')).href;
  const { render } = await import(entryUrl);

  for (const route of ROUTES) {
    const { html, head } = render(route);

    // Replace default title & description with route-specific Helmet tags
    let pageHtml = template
      .replace(/<title>[\s\S]*?<\/title>/i, '')
      .replace(/<meta\s+name="description"[\s\S]*?\/>/i, '')
      .replace('</head>', `    ${head}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`);

    const outPath =
      route === '/'
        ? path.join(distDir, 'index.html')
        : path.join(distDir, route.slice(1), 'index.html');

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, pageHtml, 'utf-8');
    console.log(`Pre-rendered: ${route} -> ${path.relative(rootDir, outPath)}`);
  }

  // Clean up temporary SSR build folder
  fs.rmSync(ssrDir, { recursive: true, force: true });
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
