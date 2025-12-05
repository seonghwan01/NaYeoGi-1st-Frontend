<script setup>
import { computed } from 'vue'
import { useAttractionStore } from '@/stores/attractions'

const store = useAttractionStore()
const categories = computed(() => store.categories)
const featured = computed(() => store.featured)
</script>

<template>
  <section class="header">
    <div>
      <p class="eyebrow">Attraction</p>
      <h1>카테고리별 여행지</h1>
      <p class="lede">주제별로 나뉜 더미 데이터를 확인하고, 팀원이 맡은 영역에 바로 컴포넌트를 붙일 수 있습니다.</p>
    </div>
    <span class="badge">데이터: Pinia</span>
  </section>

  <section class="categories">
    <h2>카테고리</h2>
    <div class="grid">
      <article v-for="category in categories" :key="category.id" class="card">
        <div class="card-top">
          <span class="pill">{{ category.tag }}</span>
          <span class="count">{{ category.count }}개</span>
        </div>
        <h3>{{ category.title }}</h3>
        <p>{{ category.summary }}</p>
        <button type="button" class="ghost">목록 보기</button>
      </article>
    </div>
  </section>

  <section class="featured">
    <div class="header-row">
      <h2>추천 스팟</h2>
      <small>리스트/카드 컴포넌트로 교체 예정 영역</small>
    </div>
    <div class="stack">
      <article v-for="spot in featured" :key="spot.title" class="spot">
        <div class="spot-main">
          <span class="pill">{{ spot.category }}</span>
          <div>
            <h3>{{ spot.title }}</h3>
            <p>{{ spot.location }} · {{ spot.mood }}</p>
          </div>
        </div>
        <div class="meta">
          <span class="rating">★ {{ spot.rating }}</span>
          <span>{{ spot.highlight }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

h1 {
  margin: 4px 0;
  font-size: 26px;
}

.lede {
  color: #475569;
  max-width: 640px;
}

.badge {
  padding: 8px 12px;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
  border: 1px dashed #e2e8f0;
  font-weight: 700;
}

.categories {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  margin-bottom: 16px;
}

.categories h2,
.featured h2 {
  margin: 0 0 12px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.card {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  display: grid;
  gap: 6px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card h3 {
  margin: 0;
}

.card p {
  margin: 0;
  color: #475569;
}

.count {
  font-weight: 700;
  color: #1d4ed8;
}

.pill {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
}

.ghost {
  justify-self: start;
  border: 1px dashed #cbd5e1;
  background: #fff;
  color: #0f172a;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.featured {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
}

.header-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

small {
  color: #94a3b8;
}

.stack {
  display: grid;
  gap: 10px;
}

.spot {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.spot-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spot h3 {
  margin: 0;
}

.spot p {
  margin: 2px 0 0;
  color: #475569;
}

.meta {
  margin-top: 6px;
  display: flex;
  gap: 10px;
  color: #0f172a;
  align-items: center;
  flex-wrap: wrap;
}

.rating {
  font-weight: 800;
  color: #ea580c;
}
</style>
