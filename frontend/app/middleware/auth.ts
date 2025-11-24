export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.requiresAuth && !useCookie('email', { maxAge: 315360000 }).value) {
    return navigateTo('/input')
  }
})