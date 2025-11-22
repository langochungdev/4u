export default defineNuxtPlugin(() => {
  // Load GTM after the page has loaded to improve initial performance
  if (process.client) {
    window.addEventListener('load', () => {
      // GTM script
      const script = document.createElement('script')
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-KF6W2TV6');`
      document.head.appendChild(script)

      // GTM noscript
      const noscript = document.createElement('noscript')
      const iframe = document.createElement('iframe')
      iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-KF6W2TV6'
      iframe.height = '0'
      iframe.width = '0'
      iframe.style.display = 'none'
      iframe.style.visibility = 'hidden'
      noscript.appendChild(iframe)
      document.body.appendChild(noscript)
    })
  }
})