export default defineNuxtRouteMiddleware((to) => {
  // Check if this is an ecard route (has ID param and not preview mode)
  const id = to.params.id
  const isPreview = to.query.preview === 'true'
  
  if (id && !isPreview && typeof id === 'string') {
    // Build dynamic metadata for ecard
    const currentUrl = `https://story4u.online${to.path}`
    const ecardTitle = `Xem thiệp của bạn - STORY4U`
    const ecardDescription = `Ai đó đã gửi cho bạn một thiệp điện tử đặc biệt. Nhấn vào để xem ngay!`
    const ecardImage = `https://story4u.online/meta-img.webp`
    
    // Set SEO metadata for server-side rendering
    useSeoMeta({
      title: ecardTitle,
      description: ecardDescription,
      ogTitle: ecardTitle,
      ogDescription: ecardDescription,
      ogImage: ecardImage,
      ogUrl: currentUrl,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: ecardTitle,
      twitterDescription: ecardDescription,
      twitterImage: ecardImage
    })
    
    useHead({
      link: [
        { rel: 'canonical', href: currentUrl }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "url": currentUrl,
            "name": ecardTitle,
            "description": ecardDescription,
            "image": ecardImage,
            "isPartOf": { 
              "@type": "WebSite", 
              "name": "STORY4U", 
              "url": "https://story4u.online" 
            }
          })
        }
      ]
    })
  }
})
