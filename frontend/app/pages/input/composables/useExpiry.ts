import { ref } from 'vue'

export const useExpiry = () => {
  const expiresAt = ref<Date | null>(null);
  const countdown = ref<string>('');
  const countdownInterval = ref<number | null>(null);

  const calculateExpiryDate = (duration: '1day' | '1week' | '1month' | '6months'): Date => {
    const now = new Date();
    const expiry = new Date(now);
    switch (duration) {
      case '1day':
        expiry.setDate(expiry.getDate() + 2);
        break;
      case '1week':
        expiry.setDate(expiry.getDate() + 7);
        break;
      case '1month':
        expiry.setMonth(expiry.getMonth() + 1);
        break;
      case '6months':
        expiry.setMonth(expiry.getMonth() + 6);
        break;
    }
    expiry.setHours(0, 0, 0, 0);
    return expiry;
  };

  const updateCountdown = () => {
    if (!expiresAt.value) {
      countdown.value = '';
      return;
    }

    const now = new Date().getTime();
    const expiry = expiresAt.value.getTime();
    const distance = expiry - now;

    if (distance < 0) {
      countdown.value = 'Đã hết hạn';
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value);
        countdownInterval.value = null;
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdown.value = `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
  };

  const startCountdown = () => {
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value);
    }
    updateCountdown();
    countdownInterval.value = window.setInterval(updateCountdown, 1000);
  };

  return {
    expiresAt,
    countdown,
    countdownInterval,
    calculateExpiryDate,
    updateCountdown,
    startCountdown
  }
}