<script setup>
import { onMounted } from 'vue';
import { useStorybookStore } from '@/stores/storybook';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';

const storyStore = useStorybookStore();
const { myStories, isLoading, error } = storeToRefs(storyStore);

onMounted(() => {
  storyStore.fetchMyStories();
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
          <h2 class="fw-bold">📖 나의 여행 기록</h2>
        </div>

        <div v-if="isLoading" class="text-center py-5">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">스토리북을 불러오는 중입니다...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          스토리를 불러오는 중 오류가 발생했습니다.
        </div>

        <div v-else-if="myStories.length === 0" class="text-center text-muted py-5">
          <p class="fs-5">아직 작성된 스토리북이 없습니다.</p>
          <p>여행 계획을 바탕으로 멋진 스토리를 만들어보세요!</p>
        </div>

        <div v-else class="row g-4">
          <div v-for="story in myStories" :key="story.storyId" class="col-lg-4 col-md-6">
            <RouterLink :to="`/storybook/display/${story.storyId}`" class="card-link">
              <div class="card h-100 shadow-sm story-card">
                <div class="thumbnail-wrapper">
                  <img
                    :src="story.thumbnailPath || '/img/story_image.png'"
                    class="card-img-top"
                    alt="Story thumbnail"
                  />
                  <div class="thumbnail-overlay"></div>
                </div>
                <div class="card-body">
                  <h5 class="card-title fw-bold text-truncate">{{ story.title }}</h5>
                  <p class="card-text text-muted small mb-2">
                    {{ story.createdDate }}
                  </p>
                </div>
                <div class="card-footer bg-transparent border-top-0 d-flex justify-content-end align-items-center">
                  <span class="text-danger">❤️</span>
                  <span class="ms-1">{{ story.hit }}</span>
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
/* 유리창 효과 스타일 */
.library-card {
  background-color: rgba(255, 255, 255, 0.256);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
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


.story-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
  overflow: hidden;
}

.story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
  transition: transform 0.3s ease;
}

.story-card:hover .card-img-top {
  transform: scale(1.05);
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4), transparent 50%);
}

.card-title {
  color: #333;
}

.card-body {
  background-color: #fff;
}
</style>
