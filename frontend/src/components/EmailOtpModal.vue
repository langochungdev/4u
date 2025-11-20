<template>
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div class="bg-white rounded-lg p-5 w-full max-w-md">
            <div v-if="step === 'email'">
        <label class="block text-sm text-muted-foreground mb-2">Email</label>
        <input v-model="emailInput" type="email" class="w-full p-2 border rounded mb-4"
          placeholder="nhập email của bạn" @keydown.enter.prevent="sendOtp" />
                <div class="flex justify-center gap-2">
                    <button @click="onClose" class="win2k-button">Đóng</button>
                    <button :disabled="loading || !validEmail" @click="sendOtp" class="win2k-button">
                        <span v-if="loading" class="loading-spinner"></span>
                        <span v-else>Gửi mã</span>
                    </button>
                </div>
            </div>

            <div v-else>
                <div class="mb-4 -mx-5 -mt-5">
                    <img v-if="otpSuggest" :src="otpSuggest" alt="Ảnh hướng dẫn lấy mã OTP"
                        class="w-full object-cover rounded-t-lg" />
                </div>
                <p class="text-sm font-bold text-yellow-800 mb-1">⚠️ Kiểm tra <strong>thư rác</strong> hoặc
                    <strong>thùng rác</strong>
                </p>

                <label class="block text-sm text-muted-foreground mb-2">Nhập mã OTP</label>
        <div class="flex justify-center gap-2 mb-4">
          <input
            v-for="index in otpDigits.length"
            :key="index"
            v-model="otpDigits[index - 1]"
            @keydown="handleKeyDown(index - 1, $event)"
            @input="handleOtpInput(index - 1, $event)"
            @paste="handlePaste($event)"
            @keydown.enter.prevent="verifyOtp"
            type="tel"
            inputmode="numeric"
            pattern="[0-9]*"
            maxlength="1"
            autocomplete="one-time-code"
            aria-label="OTP digit"
            class="otp-box"
          />
        </div>
                <div class="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <div>Chưa nhận mã? <button class="underline" @click="sendOtp">Gửi lại</button></div>
                    <div v-if="attempts">Lần gửi: {{ attempts }}</div>
                </div>
                <div class="flex justify-center gap-2">
                    <button @click="onClose" class="win2k-button">Đóng</button>
                    <button :disabled="verifying || otpDigits.filter(d => d).length < 4" @click="verifyOtp"
                        class="win2k-button">
                        <span v-if="verifying" class="loading-spinner"></span>
                        <span v-else>Xác thực</span>
                    </button>
                </div>
            </div>

            <div v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</div>
            <div v-if="message" class="mt-3 text-sm text-green-600">{{ message }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { OTP_BYPASS } from '@/config/app'
import otpSuggest from './otp-suggest.png'

const props = defineProps({
  modelValue: Boolean,
  defaultEmail: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue', 'verified'])

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const emailInput = ref(props.defaultEmail)
const otpDigits = ref(['', '', '', ''])
const step = ref('email')
const loading = ref(false)
const verifying = ref(false)
const error = ref('')
const message = ref('')
const attempts = ref(0)

const validEmail = computed(() => !!emailInput.value && emailInput.value.includes('@'))

watch(() => props.defaultEmail, (v) => (emailInput.value = v || ''))

function handleKeyDown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !otpDigits.value[index] && index > 0) {
    const prevInput = (event.target as HTMLElement).parentElement?.querySelector(`input:nth-child(${index})`) as HTMLInputElement
    prevInput?.focus()
    setTimeout(() => {
      otpDigits.value[index - 1] = ''
    }, 0)
  }
}

function handleOtpInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/[^0-9]/g, '') // only numbers
  if (value.length > 1) value = value.charAt(0) || '' // only one digit
  otpDigits.value[index] = value
  if (value && index < 3) {
    // focus next
    const nextInput = target.parentElement?.querySelector(`input:nth-child(${index + 2})`) as HTMLInputElement
    nextInput?.focus()
  }
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text') || ''
  const digits = pasted.replace(/[^0-9]/g, '').split('').slice(0, 4)
  for (let i = 0; i < 4; i++) {
    otpDigits.value[i] = digits[i] || ''
  }
  const lastFilledIndex = Math.min(digits.length - 1, 3)
  const lastInput = (event.target as HTMLElement).parentElement?.querySelector(`input:nth-child(${lastFilledIndex + 1})`) as HTMLInputElement
  lastInput?.focus()
}

function onClose() {
  visible.value = false
  error.value = ''
  message.value = ''
  otpDigits.value = ['', '', '', '']
  step.value = 'email'
}

async function sendOtp() {
  error.value = ''
  message.value = ''
  if (!validEmail.value) return
  loading.value = true
    try {
      if (OTP_BYPASS) {
        attempts.value += 1
        step.value = 'otp'
        message.value = 'Đã bật chế độ bypass OTP (dev): nhập bất kỳ mã 4 chữ số.'
        return
      }
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}user/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Failed to send OTP')
      }
      attempts.value += 1
      step.value = 'otp'
      message.value = 'Đã gửi mã OTP vào email của bạn.'
    } catch (e: any) {
      error.value = e.message || String(e)
    } finally {
      loading.value = false
    }
}

async function verifyOtp() {
  error.value = ''
  verifying.value = true
    try {
      // require 4 digits to verify (guard if invoked by Enter prematurely)
      if (otpDigits.value.filter(d => d).length < 4) {
        verifying.value = false
        return
      }
      if (OTP_BYPASS) {
        message.value = 'Xác thực thành công (dev bypass).'
        emit('verified', emailInput.value)
        visible.value = false
        return
      }
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}user/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.value, otp: otpDigits.value.join('') })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Invalid OTP')
      }
      message.value = 'Xác thực thành công.'
      // emit verified email
      emit('verified', emailInput.value)
      visible.value = false
    } catch (e: any) {
      error.value = e.message || String(e)
    } finally {
      verifying.value = false
    }
}
</script>

<style scoped>
.win2k-button {
    border: 1px outset #d0d0c8;
    background-color: #e0e0e0;
    color: black;
    font-size: 14px;
    padding: 12px 24px;
    cursor: pointer;
    min-width: 120px;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    transition: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.win2k-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #808080;
    border-radius: 50%;
    border-top-color: #000;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.otp-box {
    width: 40px;
    height: 40px;
    border: 1px inset #d0d0c8;
    border-left-color: #404040;
    border-top-color: #404040;
    border-right-color: white;
    border-bottom-color: white;
    background-color: white;
    color: black;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 18px;
    text-align: center;
    outline: none;
}
</style>
