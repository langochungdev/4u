export default defineNitroErrorHandler((error, event) => {
  console.error('Nitro error:', error)
  
  return {
    statusCode: error.statusCode || 500,
    statusMessage: error.statusMessage || 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  }
})
