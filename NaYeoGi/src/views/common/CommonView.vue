<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const shortcuts = [
  {
    title: 'AI 스토리북 만들기',
    description: '사진과 분위기를 고르면 AI가 초안을 만들어 줍니다.',
    to: '/storybook',
    tone: 'blue',
  },
  {
    title: 'AI 여행지 추천',
    description: '여행 목적과 동행 정보를 입력해 맞춤 코스를 받아보세요.',
    to: '/recommendations',
    tone: 'indigo',
  },
  {
    title: '카테고리별 여행지',
    description: '주제별로 모은 여행지 묶음에서 빠르게 시작하세요.',
    to: '/categories',
    tone: 'teal',
  },
]
</script>

<template>
  <section class="hero">
    <div>
      <p class="eyebrow">나여기 팀 스켈레톤</p>
      <h1>초기 구조를 빠르게 눌러보세요</h1>
      <p class="lede">
        각 페이지는 더미 데이터와 기본 섹션만 포함되어 있어 바로 확장하거나 실제 API를 연결하기 쉽습니다.
      </p>
    </div>
    <div class="panel">
      <div class="panel-title">작업 흐름</div>
      <ol>
        <li>페이지별 섹션에 컴포넌트 추가</li>
        <li>Pinia 스토어를 API 응답으로 교체</li>
        <li>스타일 시스템 혹은 디자인 토큰 결합</li>
      </ol>
    </div>
  </section>

  <section class="grid">
    <article
      v-for="item in shortcuts"
      :key="item.to"
      class="card"
      :class="`card--${item.tone}`"
      @click="router.push(item.to)"
    >
      <div class="card-header">
        <h2>{{ item.title }}</h2>
        <span class="pill">바로 가기</span>
      </div>
      <p>{{ item.description }}</p>
      <div class="footer">더보기 →</div>
    </article>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
  align-items: start;
  margin-bottom: 28px;
  padding: 20px;
  border-radius: 14px;
  background: #0b1c3f;
  color: #e2e8f0;
}

.eyebrow {
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 12px;
  color: #94a3b8;
}

h1 {
  margin: 6px 0 8px;
  font-size: clamp(24px, 4vw, 30px);
}

.lede {
  max-width: 540px;
  color: #cbd5e1;
  line-height: 1.6;
}

.panel {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 16px;
}

.panel-title {
  font-weight: 700;
  margin-bottom: 8px;
  color: #e2e8f0;
}

ol {
  margin: 0;
  padding-left: 16px;
  color: #cbd5e1;
  line-height: 1.5;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.1);
  border-color: #bfdbfe;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.card h2 {
  margin: 0;
  font-size: 18px;
  color: #0f172a;
}

.card p {
  margin: 8px 0 12px;
  color: #334155;
  line-height: 1.5;
}

.footer {
  font-weight: 700;
  color: #1d4ed8;
}

.pill {
  background: #e0f2fe;
  color: #075985;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.card--blue .pill { background: #dbeafe; color: #1d4ed8; }
.card--indigo .pill { background: #e0e7ff; color: #3730a3; }
.card--teal .pill { background: #ccfbf1; color: #0f766e; }
</style>
