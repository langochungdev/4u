import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './assets/tailwind.css'
import App from './App.vue'
import router from './router/index'
import { DISABLE_DEVTOOLS } from '@/config/app'

;(function initRuntime() {
		try {
			;(window as any).__4U_disableDevTools = !!DISABLE_DEVTOOLS
			function onContext(e: Event) { if ((window as any).__4U_disableDevTools) e.preventDefault() }
			function onKeyDown(e: KeyboardEvent) { if (!(window as any).__4U_disableDevTools) return; if (e.key === 'F12') { e.preventDefault(); e.stopPropagation(); } }
			if ((window as any).__4U_disableDevTools) {
				document.addEventListener('contextmenu', onContext, { capture: true })
				document.addEventListener('keydown', onKeyDown, { capture: true })
			}
			;(window as any).__4U_toggleDevtoolsBlock = function toggle(toggle?: boolean) {
				const t = (typeof toggle === 'boolean') ? toggle : !(window as any).__4U_disableDevTools
				if (t) { document.addEventListener('contextmenu', onContext, { capture: true }); document.addEventListener('keydown', onKeyDown, { capture: true }) }
				else { document.removeEventListener('contextmenu', onContext, { capture: true }); document.removeEventListener('keydown', onKeyDown, { capture: true }) }
				;(window as any).__4U_disableDevTools = t
				return t
			}
		} catch (err) {
		}
})()

// Prevent double-tap-to-zoom on mobile browsers by blocking the second quick
// touchend default action; keeps layout stable for repeated taps.
;(function preventDoubleTap() {
	try {
		let lastTouch = 0
		const handler = (ev: TouchEvent) => {
			const now = Date.now()
			if (now - lastTouch <= 300) {
				// prevent the default zoom behavior on quick double taps
				ev.preventDefault()
			}
			lastTouch = now
		}
		document.addEventListener('touchend', handler, { passive: false })
		// expose toggle for debugging or future cleanup
		;(window as any).__4U_disableDoubleTapZoom = () => {
			document.removeEventListener('touchend', handler)
		}
	} catch (err) {
		// ignore errors in older browsers / environments
	}
})()

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.mount('#app')
