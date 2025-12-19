<template>
  <div class="content-card">
    <slot></slot>
  </div>
</template>

<script setup>
// 이 컴포넌트는 스타일과 슬롯만 제공하므로 스크립트 로직은 필요 없습니다.
</script>

<style scoped>
.content-card {
  /* join-card와 login-card의 스타일을 기반으로 하되, 좀 더 범용적으로 만듭니다. */
  background-color: rgba(255, 255, 255, 0.7); /* 약간 더 불투명하게 조정 */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 2rem;
  color: #333; /* 콘텐츠가 주로 어두운 텍스트일 것이므로 기본 텍스트 색상 지정 */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
}
</style>