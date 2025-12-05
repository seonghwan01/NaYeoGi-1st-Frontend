<script setup>
import { computed, ref } from 'vue'
import { usePlanStore } from '@/stores/plan'

const planStore = usePlanStore()

const mood = ref('힐링')
const party = ref('친구 2명')
const budget = ref('중간')

const plan = computed(() => planStore.recommendedPlan)
</script>

<template>
  <section class="header">
    <div>
      <p class="eyebrow">Recommendation</p>
      <h1>AI 여행지 추천</h1>
      <p class="lede">여행 성향을 간단히 입력하면 더미 데이터 기반의 추천 동선이 표시됩니다.</p>
    </div>
    <div class="badge">초기 스켈레톤</div>
  </section>

  <section class="layout">
    <div class="panel">
      <div class="panel-header">
        <h2>여행 정보 입력</h2>
        <small>아직 API 없이 로컬 상태만 변경</small>
      </div>
      <div class="form">
        <label>
          <span>여행 분위기</span>
          <select v-model="mood">
            <option>힐링</option>
            <option>액티비티</option>
            <option>미식</option>
            <option>도시 탐험</option>
          </select>
        </label>
        <label>
          <span>동행</span>
          <select v-model="party">
            <option>친구 2명</option>
            <option>연인</option>
            <option>가족</option>
            <option>혼자</option>
          </select>
        </label>
        <label>
          <span>예산</span>
          <select v-model="budget">
            <option>중간</option>
            <option>넉넉</option>
            <option>가성비</option>
          </select>
        </label>
        <button type="button" class="primary">추천 보기</button>
      </div>
      <p class="helper">실제 API 연결 시 위 입력값을 payload 로 사용하면 됩니다.</p>
    </div>

    <div class="plan">
      <header class="plan-header">
        <div>
          <p class="eyebrow">추천 플랜</p>
          <h2>{{ plan.destination }} · {{ plan.theme }}</h2>
        </div>
        <div class="tags">
          <span class="pill">{{ plan.duration }}</span>
          <span class="pill">{{ plan.party }}</span>
          <span class="pill">{{ plan.budget }}</span>
        </div>
      </header>
      <p class="summary">{{ plan.summary }}</p>
      <ul class="timeline">
        <li v-for="stop in plan.stops" :key="stop.title">
          <div class="time">{{ stop.time }}</div>
          <div>
            <h3>{{ stop.title }}</h3>
            <p>{{ stop.note }}</p>
          </div>
        </li>
      </ul>
      <div class="alternatives">
        <p class="eyebrow">대체 시나리오</p>
        <div class="alt" v-for="item in plan.alternatives" :key="item.label">
          <strong>{{ item.label }}</strong>
          <span>{{ item.value }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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
  margin: 6px 0;
  font-size: 26px;
}

.lede {
  color: #475569;
  max-width: 620px;
}

.badge {
  padding: 8px 12px;
  border-radius: 12px;
  background: #ecfeff;
  color: #0f172a;
  font-weight: 700;
  border: 1px dashed #67e8f9;
}

.layout {
  display: grid;
  grid-template-columns: 1.1fr 1.4fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.panel,
.plan {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.panel h2 {
  margin: 0;
}

small {
  color: #94a3b8;
}

.form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  align-items: end;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
  color: #0f172a;
}

select {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f8fafc;
}

.primary {
  background: #0ea5e9;
  color: #fff;
  border: none;
  padding: 11px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(14, 165, 233, 0.25);
}

.helper {
  color: #475569;
  margin-top: 10px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.plan h2 {
  margin: 4px 0 0;
  font-size: 22px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pill {
  background: #e0f2fe;
  color: #1d4ed8;
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 12px;
}

.summary {
  color: #334155;
  margin: 10px 0 14px;
}

.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.timeline li {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.timeline h3 {
  margin: 0;
}

.timeline p {
  margin: 4px 0 0;
  color: #475569;
}

.time {
  font-weight: 800;
  color: #0ea5e9;
}

@media (max-width: 640px) {
  .timeline li {
    grid-template-columns: 1fr;
  }
  .time {
    justify-self: start;
  }
}

.alternatives {
  margin-top: 14px;
  border-top: 1px dashed #e2e8f0;
  padding-top: 12px;
  display: grid;
  gap: 8px;
}

.alt {
  display: flex;
  gap: 10px;
  align-items: center;
}

.alt span {
  color: #475569;
}
</style>
