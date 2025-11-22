export default defineNitroErrorHandler((error, event) => {
  // Log enhanced error details for better debugging in server logs
  try {
    console.error('Nitro error message:', error?.message)
    console.error('Nitro error stack:', error?.stack)
    if (event?.node?.req) {
      console.error('Request method:', event.node.req.method, 'URL:', event.node.req.url)
    }
  } catch (e) {
    console.error('Error while logging Nitro error details:', e)
  }

  return {
    statusCode: error.statusCode || 500,
    statusMessage: error.statusMessage || 'Internal Server Error',
    message: error.message || 'Something went wrong'
  }
})
