<script setup>
import { onMounted, ref, watch } from 'vue';
import { useStorybookStore } from '@/stores/storybook';
import { usePlanStore } from '@/stores/plan';
import { useMemberStore } from '@/stores/members';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

const storyStore = useStorybookStore();
const planStore = usePlanStore();
const memberStore = useMemberStore();

const { myStories, isLoading, error } = storeToRefs(storyStore);
const { myPlans } = storeToRefs(planStore);
const { userInfo } = storeToRefs(memberStore);

const selectedPlanId = ref(""); // 선택된 필터 (빈 문자열이면 전체 보기)

// planId가 변경되면 스토리를 다시 조회합니다.
watch(selectedPlanId, (newPlanId) => {
  if (newPlanId === "") {
    storyStore.fetchMyStories();
  } else {
    storyStore.fetchMyStories(newPlanId);
  }
});

onMounted(async () => {
  // 1. 스토리 목록 조회 (전체)
  storyStore.fetchMyStories();
  
  // 2. 필터링용 여행 계획 목록 조회
  if (userInfo.value?.userId) {
    await planStore.fetchMyPlans(userInfo.value.userId);
  } else {
    // 혹시 userInfo가 아직 로드 안 됐다면 (새로고침 직후 등)
    // getUserInfo가 완료된 후 실행되도록 하거나, 간단히 재시도 로직을 넣을 수 있음.
    // 여기서는 간단히 userInfo가 있을 때만 호출.
    await memberStore.getUserInfo();
    if (userInfo.value?.userId) {
      await planStore.fetchMyPlans(userInfo.value.userId);
    }
  }
});
</script>

<template>
  <div
    class="min-vh-100 w-100 position-relative d-flex align-items-center justify-content-center text-white"
    :style="{
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }"
  >
    <div class="position-relative container animate-fade-in-up my-5">
      <div class="library-card p-5 rounded-4 h-100">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="fw-bold text-white mb-0">📖 나의 여행 기록</h2>
          
          <!-- 필터 Dropdown (Custom Style) -->
          <div class="filter-wrapper">
            <label for="planFilter" class="filter-label">여행 계획 필터</label>
            <div class="custom-select-container">
              <select
                id="planFilter"
                class="form-select custom-select"
                v-model="selectedPlanId"
              >
                <option value="">📂 전체 여행 보기</option>
                <option v-for="plan in myPlans" :key="plan.id" :value="plan.id">
                  ✈️ {{ plan.title }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-white-50">스토리북을 불러오는 중입니다...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          스토리를 불러오는 중 오류가 발생했습니다.
        </div>

        <div v-else-if="myStories.length === 0" class="text-center text-white-50 py-5">
          <div class="fs-1 mb-3">📭</div>
          <p class="fs-5">아직 작성된 스토리북이 없습니다.</p>
          <p>여행 계획을 바탕으로 멋진 스토리를 만들어보세요!</p>
        </div>

        <div v-else class="row g-4">
          <div v-for="story in myStories" :key="story.storyId" class="col-lg-4 col-md-6">
            <RouterLink :to="`/storybook/view/${story.storyId}`" class="card-link">
              <div class="card h-100 shadow-sm story-card glass-card">
                <div class="thumbnail-wrapper">
                  <img
                    :src="story.thumbnailPath || '/img/story_image.png'"
                    class="card-img-top"
                    alt="Story thumbnail"
                  />
                  <div class="thumbnail-overlay">
                    <span class="badge bg-dark bg-opacity-75 plan-badge text-truncate">
                      {{ story.planTitle || '여행 계획 없음' }}
                    </span>
                  </div>
                </div>
                <div class="card-body text-white">
                  <h5 class="card-title fw-bold text-truncate mb-2">{{ story.title }}</h5>
                  <p class="card-text text-white-50 small mb-0">
                    📅 {{ story.createdDate }}
                  </p>
                </div>
                <div class="card-footer bg-transparent border-top-0 d-flex justify-content-between align-items-center">
                  <span class="badge bg-light text-dark bg-opacity-75 rounded-pill px-3">
                     {{ story.isPublic ? '공개' : '비공개' }}
                  </span>
                  <div class="text-danger">
                    <i class="bi bi-heart-fill"></i> {{ story.hit }}
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 유리창 효과 스타일 (컨테이너) */
.library-card {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}

/* 필터 스타일 */
.filter-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  display: none; /* 모바일 대응 등을 위해 레이블은 숨기고 placeholder 느낌으로 */
}

@media (min-width: 768px) {
  .filter-label {
    display: block;
  }
}

.custom-select-container {
  position: relative;
  min-width: 200px;
}

.custom-select {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 20px;
  padding-left: 1rem;
  padding-right: 2.5rem; /* 화살표 공간 */
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.custom-select:hover, .custom-select:focus {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
  outline: none;
}

.custom-select option {
  background-color: #333; /* 드롭다운 메뉴 배경색 (유리 효과가 적용되지 않는 브라우저 기본 UI 고려) */
  color: white;
}

/* 카드 스타일 */
.story-card {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
  border: none;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.15); /* 카드 자체도 약간의 투명도 */
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.story-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
}

.card-link {
  text-decoration: none;
  color: inherit;
}

.thumbnail-wrapper {
  position: relative;
  width: 100%;
  padding-top: 66.66%; /* 3:2 aspect ratio */
  overflow: hidden;
}

.thumbnail-wrapper .card-img-top {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.story-card:hover .card-img-top {
  transform: scale(1.1);
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 60%);
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 10px;
}

.plan-badge {
  font-size: 0.8rem;
  backdrop-filter: blur(4px);
  max-width: 90%;
}

.card-title {
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.card-body {
  padding: 1.25rem;
}

/* 애니메이션 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}
</style>
