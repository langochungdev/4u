export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.requiresAuth && !useCookie('user_email').value) {
    return navigateTo('/input')
  }
})