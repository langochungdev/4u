import { writeFileSync, readdirSync, readFileSync } from 'fs'
import { resolve, join } from 'path'

const DOMAIN = 'https://story4u.online'
const OUTPUT_PATH = resolve(process.cwd(), 'public/sitemap.xml')
const CONFIG_PATH = resolve(process.cwd(), 'app/pages/home/config')

// Define static routes
const routes = [
  { path: '/', priority: 1.0, changefreq: 'daily' },
  { path: '/home', priority: 1.0, changefreq: 'daily' },
  { path: '/input', priority: 0.9, changefreq: 'weekly' },
]

// Auto-scan template configs from config files
function scanTemplateConfigs() {
  const templateCategories = {}
  
  try {
    // Check if config directory exists
    try {
      readdirSync(CONFIG_PATH)
    } catch (e) {
      console.warn('⚠️  Config directory not found, skipping template scan')
      return templateCategories
    }
    
    const configFiles = readdirSync(CONFIG_PATH).filter(file => 
      file.endsWith('.ts') && file !== 'section.helper.ts'
    )
    
    configFiles.forEach(file => {
      const filePath = join(CONFIG_PATH, file)
      const content = readFileSync(filePath, 'utf-8')
      
      // Extract section id from SECTION object
      const sectionIdMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
      if (!sectionIdMatch) return
      
      const categoryId = sectionIdMatch[1]
      
      // Extract template keys from TEMPLATES_CONFIG object
      // Match everything between the opening { and closing };
      const configMatch = content.match(/TEMPLATES_CONFIG[^=]*=\s*\{([\s\S]*?)\};/);
      if (!configMatch) return
      
      const configContent = configMatch[1]
      // Match all template keys (strings before colon)
      const templateMatches = [...configContent.matchAll(/['"]([^'"]+)['"]\s*:/g)]
      
      if (templateMatches.length > 0) {
        templateCategories[categoryId] = templateMatches.map(m => m[1])
        console.log(`📁 Found ${templateMatches.length} templates in "${categoryId}" category`)
      }
    })
    
  } catch (error) {
    console.error('⚠️  Error scanning config files:', error.message)
  }
  
  return templateCategories
}

// Scan and generate template routes dynamically
const templateCategories = scanTemplateConfigs()

Object.entries(templateCategories).forEach(([category, templates]) => {
  const isSeasonalCategory = ['christmas', 'valentine'].includes(category)
  const changefreq = category === '20-11' ? 'monthly' : 'yearly'
  const priority = isSeasonalCategory ? 0.7 : 0.8

  templates.forEach(template => {
    routes.push({
      path: `/${category}/${template}`,
      priority,
      changefreq
    })
  })
})

// Generate XML
function generateSitemap() {
  const lastmod = new Date().toISOString().split('T')[0]
  
  const urls = routes.map(route => `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
${urls}
  
</urlset>`

  writeFileSync(OUTPUT_PATH, xml, 'utf8')
  console.log(`✅ Sitemap generated successfully at ${OUTPUT_PATH}`)
  console.log(`📊 Total URLs: ${routes.length}`)
}

// Run
try {
  generateSitemap()
} catch (error) {
  console.error('❌ Error generating sitemap:', error)
  console.warn('⚠️  Continuing build without sitemap...')
  // Don't exit with error to prevent build failure
}
