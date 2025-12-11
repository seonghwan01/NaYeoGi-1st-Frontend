<template>
  <div class="recommend-page">
    <header class="page-header">
      <div class="title">최적의 여행지 추천을 위한 설문에 답을 해주세요</div>
    </header>

    <main class="content">
      <section class="survey-card">
        <div class="icon">📍</div>
        <h1 class="title">어디로 여행가시나요?</h1>
        <p class="subtitle">방문을 원하는 지역을 선택해 주세요.</p>
        <div class="chips">
          <button
            v-for="region in regions"
            :key="region"
            type="button"
            class="chip"
            :class="{ active: selectedRegion === region }"
            @click="selectRegion(region)"
          >
            <span class="chip-hash">#</span>
            {{ region }}
          </button>
        </div>
      </section>

      <section class="survey-card">
        <div class="icon">✨</div>
        <h2 class="title">내가 원하는 여행은?</h2>
        <p class="subtitle">서버에서 토픽을 불러옵니다.</p>
        <div class="chips">
          <div v-if="topicError" class="chip chip-error">{{ topicError }}</div>
          <template v-else>
            <button
              v-for="topic in topics"
              :key="topic.id"
              type="button"
              class="chip"
              :class="{ active: selectedTopics.includes(topic.id) }"
              @click="toggleTopic(topic.id)"
            >
              #{{ topic.question }}
            </button>
          </template>
        </div>
      </section>
    </main>

    <footer class="footer">
      <button type="button" class="next-btn" @click="recommendAttraction">설문 제출</button>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAttractionStore } from '@/stores/attractions'

const attractionStore = useAttractionStore()
const { regions, topics, topicError, selectedRegion, selectedTopics } = storeToRefs(attractionStore)
const { loadTopics, selectRegion, toggleTopic, recommendAttraction } = attractionStore

onMounted(() => {loadTopics() })
</script>

<style scoped>
.recommend-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f9fb;
  color: #1f2d3d;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  font-weight: 600;
}

.back-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #4a5568;
}

.progress {
  font-size: 14px;
  color: #94a3b8;
}

.content {
  flex: 1;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.survey-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  font-size: 22px;
  background: #eef4ff;
  color: #4f46e5;
  border-radius: 12px;
  margin-bottom: 12px;
}

.title {
  font-size: 22px;
  margin: 0;
  font-weight: 700;
}

.subtitle {
  margin: 8px 0 16px;
  color: #6b7280;
  font-size: 14px;
}

.chips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.chip {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #374151;
}

.chip:hover {
  border-color: #c7d2fe;
  background: #f3f4ff;
}

.chip.active {
  border-color: #4f46e5;
  background: #4f46e5;
  color: #fff;
  box-shadow: 0 6px 18px rgba(79, 70, 229, 0.2);
}

.chip-ghost {
  background: #f8fafc;
  color: #64748b;
  border-style: dashed;
  cursor: default;
}

.chip-error {
  background: #fff5f5;
  color: #b91c1c;
  border-color: #fecdd3;
  cursor: default;
}

.footer {
  position: sticky;
  bottom: 0;
  width: 100%;
  background: linear-gradient(180deg, rgba(247, 249, 251, 0.8) 0%, #f7f9fb 40%, #f7f9fb 100%);
  padding: 16px;
}

.next-btn {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  display: block;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  background: #4f46e5;
  box-shadow: 0 8px 20px rgba(79, 70, 229, 0.25);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.next-btn:hover {
  transform: translateY(-1px);
}

.next-btn:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .survey-card {
    padding: 22px 18px 18px;
  }

  .title {
    font-size: 20px;
  }

  .chips {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  }
}
</style>
