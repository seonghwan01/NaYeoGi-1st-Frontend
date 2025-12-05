<script setup>
const user = {
  name: '성환이형님',
  email: 'user@nayeogi.dev',
  tier: '감성 여행자',
  stats: [
    { label: '스토리북', value: 12 },
    { label: '추천 코스', value: 5 },
    { label: '저장한 스팟', value: 18 },
  ],
}

const shortcuts = [
  { label: '프로필 수정', note: '이름, 소개, 프로필 이미지', action: '수정' },
  { label: '비밀번호 변경', note: '최근 90일 기준', action: '변경' },
  { label: '알림 설정', note: '이메일/푸시/웹 알림', action: '열기' },
  { label: '결제·구독', note: '플랜 / 결제 내역 확인', action: '관리' },
]
</script>

<template>
  <section class="header">
    <div>
      <p class="eyebrow">Member</p>
      <h1>내 정보</h1>
      <p class="lede">사용자 카드와 설정 섹션만 있는 기본 페이지입니다.</p>
    </div>
    <span class="badge">더미 데이터</span>
  </section>

  <section class="layout">
    <div class="profile">
      <div class="avatar">{{ user.name.charAt(0) }}</div>
      <div>
        <h2>{{ user.name }}</h2>
        <p class="muted">{{ user.email }}</p>
        <span class="pill">{{ user.tier }}</span>
      </div>
      <div class="stats">
        <div v-for="item in user.stats" :key="item.label" class="stat">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div class="settings">
      <h3>설정</h3>
      <div class="list">
        <article v-for="item in shortcuts" :key="item.label" class="row">
          <div>
            <h4>{{ item.label }}</h4>
            <p>{{ item.note }}</p>
          </div>
          <button type="button" class="ghost">{{ item.action }}</button>
        </article>
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
  margin: 4px 0;
  font-size: 26px;
}

.lede {
  color: #475569;
  max-width: 520px;
}

.badge {
  padding: 8px 12px;
  border-radius: 12px;
  background: #f8fafc;
  color: #0f172a;
  border: 1px dashed #e2e8f0;
  font-weight: 700;
}

.layout {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.profile {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px 16px;
  align-items: center;
}

.avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #dbeafe;
  color: #1d4ed8;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 28px;
}

.muted {
  margin: 2px 0;
  color: #475569;
}

.pill {
  background: #e0f2fe;
  color: #1d4ed8;
  padding: 6px 10px;
  border-radius: 10px;
  font-weight: 700;
  display: inline-block;
  margin-top: 6px;
}

.stats {
  grid-column: 1 / -1;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  min-width: 110px;
}

.stat strong {
  display: block;
  font-size: 18px;
}

.stat span {
  color: #475569;
}

.settings {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 10px;
}

.settings h3 {
  margin: 0;
}

.list {
  display: grid;
  gap: 10px;
}

.row {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.row h4 {
  margin: 0;
}

.row p {
  margin: 2px 0 0;
  color: #475569;
}

.ghost {
  border: 1px dashed #cbd5e1;
  background: #fff;
  color: #0f172a;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
}
</style>
