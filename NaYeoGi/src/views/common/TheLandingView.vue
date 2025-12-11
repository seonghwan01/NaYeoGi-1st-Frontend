<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const bgImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80";

const goMain = () => {
  router.push({ name: 'main' }); // 라우터에 설정된 name: 'main'으로 이동
};
</script>

<template>
  <div class="min-vh-100 w-100 position-relative d-flex align-items-center justify-content-center text-white"
       :style="{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
    <div class="position-absolute top-0 start-0 w-100 h-100" style="background-color: rgba(0, 0, 0, 0.4);"></div>
    <div class="position-relative text-center animate-fade-in-up">
      <h1 class="display-3 fw-bold mb-4">
        여행을 기록하다,<br />기억을 그리다.
      </h1>
      <p class="lead mb-5">
        당신의 사진에 AI의 감성을 더해<br />세상에 하나뿐인 스토리북을 만들어드립니다.
      </p>
      <button
        @click="goMain"
        class="btn btn-primary btn-lg px-5 py-3"
      >
        시작하기
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 등장 애니메이션 */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}
</style>
