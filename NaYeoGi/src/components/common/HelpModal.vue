<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <button class="close-button" @click="close">&times;</button>
      <h2>NaYeoGi 사용법 안내</h2>
      <p>나만의 특별한 여행을 만들고 기록하는 <strong>NaYeoGi</strong>의 이용 순서입니다.</p>
      <ul class="help-list">
        <li>
          <div class="step-badge">STEP 1</div>
          <strong>AI 여행지 추천</strong>
          <p>내 취향에 딱 맞는 여행지들을 추천받고 나만의 여행 계획을 세워보세요.</p>
        </li>
        <li>
          <div class="step-badge">STEP 2</div>
          <strong>즐거운 여행</strong>
          <p>세워둔 계획을 따라 즐거운 여행을 다녀오세요!</p>
        </li>
        <li>
          <div class="step-badge">STEP 3</div>
          <strong>AI 여행 기록</strong>
          <p>다녀온 여행의 사진과 짧은 글을 올리면, AI가 여행에 딱 맞는 멋진 블로그를 자동으로 작성해줍니다.</p>
        </li>
      </ul>
      <div class="modal-footer">
        <button class="confirm-button" @click="close">확인했습니다</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// v-model을 통해 부모 컴포넌트에서 모달의 표시 여부를 제어할 수 있도록 합니다.
const show = defineModel({ type: Boolean, default: false });

// 'close' 이벤트를 부모에게 전달합니다.
const emit = defineEmits(['close']);

const close = () => {
  emit('close');
  show.value = false;
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* 헤더보다 확실히 위에 오도록 설정 */
  padding: 20px; /* 화면 가장자리와의 최소 여백 */
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 16px; /* 더 부드러운 라운딩 */
  width: 100%;
  max-width: 480px;
  max-height: 90vh; /* 화면 높이의 90%를 넘지 않도록 */
  overflow-y: auto; /* 내용이 많을 경우 스크롤 */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 1.8rem;
  font-weight: bold;
  color: #555;
  background: none;
  border: none;
  cursor: pointer;
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.help-list {
  list-style-type: none;
  padding: 0;
  margin: 20px 0;
}

.help-list li {
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 3px solid #007bff;
  position: relative;
}

.step-badge {
  display: inline-block;
  background-color: #007bff;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  margin-bottom: 5px;
}

.help-list p {
  margin: 5px 0 0 0;
  font-size: 0.95rem;
  color: #666;
}

.modal-footer {
  margin-top: 25px;
  text-align: right;
}

.confirm-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  font-size: 1rem;
}

.confirm-button:hover {
  background-color: #0056b3;
}
</style>
