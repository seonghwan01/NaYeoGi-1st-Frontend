<script setup>
import { computed, ref } from 'vue'
import { useStorybookStore } from '@/stores/storybook'

const store = useStorybookStore()

const title = ref('새 여행 스토리북')
const mood = ref('감성')
const photos = ref(6)
const tags = ref('바다, 카페')
const note = ref('AI가 만든 초안에 코멘트를 추가하고 팀원과 공유하세요.')

const drafts = computed(() => store.drafts)
const templates = computed(() => store.templates)

const createDraft = () => {
  const parsedTags = tags.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  store.addDraft({
    title: title.value,
    mood: mood.value,
    photos: photos.value,
    tags: parsedTags,
    note: note.value,
  })

  title.value = '새 여행 스토리북'
  mood.value = '감성'
  photos.value = 6
  tags.value = '바다, 카페'
  note.value = 'AI가 만든 초안에 코멘트를 추가하고 팀원과 공유하세요.'
}
</script>

<template>
  <section class="header">
    <div>
      <p class="eyebrow">Storybook</p>
      <h1>AI 스토리북 만들기</h1>
      <p class="lede">사진 수, 분위기, 태그만 넣으면 초안이 생성되도록 설계된 기본 페이지입니다.</p>
    </div>
    <div class="badges">
      <span class="badge">Pinia</span>
      <span class="badge badge--ghost">스토어 더미 데이터</span>
    </div>
  </section>

  <section class="layout">
    <div class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Draft</p>
          <h2>새 스토리북 생성</h2>
        </div>
        <button class="primary" type="button" @click="createDraft">초안 추가</button>
      </div>

      <div class="form">
        <label>
          <span>제목</span>
          <input v-model="title" placeholder="여행 제목" />
        </label>
        <label>
          <span>분위기</span>
          <select v-model="mood">
            <option>감성</option>
            <option>활기</option>
            <option>잔잔</option>
            <option>모험</option>
          </select>
        </label>
        <label>
          <span>사진 수</span>
          <input v-model.number="photos" type="number" min="1" max="50" />
        </label>
        <label>
          <span>태그 (쉼표로 구분)</span>
          <input v-model="tags" placeholder="바다, 카페" />
        </label>
        <label>
          <span>요청 메모</span>
          <textarea v-model="note" rows="3"></textarea>
        </label>
      </div>

      <div class="templates">
        <p class="eyebrow">템플릿</p>
        <div class="template-grid">
          <article v-for="template in templates" :key="template.title" class="template">
            <h3>{{ template.title }}</h3>
            <p>{{ template.description }}</p>
          </article>
        </div>
      </div>
    </div>

    <div class="list">
      <h2>초안 목록</h2>
      <p class="hint">주요 필드를 눌러 세부 컴포넌트를 연결해보세요.</p>
      <div class="draft" v-for="draft in drafts" :key="draft.id">
        <div class="draft-meta">
          <span class="badge">{{ draft.status }}</span>
          <span class="pill">{{ draft.mood }}</span>
        </div>
        <h3>{{ draft.title }}</h3>
        <p class="muted">사진 {{ draft.photos }}장 · {{ draft.tags.join(', ') }}</p>
        <p class="note">{{ draft.note }}</p>
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
  max-width: 620px;
}

.badges {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 10px;
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 700;
  font-size: 12px;
}

.badge--ghost {
  background: #f8fafc;
  color: #475569;
  border: 1px dashed #cbd5e1;
}

.layout {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  gap: 16px;
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.panel h2 {
  margin: 4px 0 0;
  font-size: 20px;
}

.form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px 14px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-weight: 700;
  color: #0f172a;
}

input,
select,
textarea {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  font-size: 14px;
  color: #0f172a;
}

textarea {
  resize: vertical;
}

.primary {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.25);
}

.primary:hover {
  background: #1d4ed8;
}

.templates {
  margin-top: 14px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 10px;
}

.template {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.template h3 {
  margin: 0 0 4px;
  font-size: 15px;
}

.template p,
.muted,
.note,
.hint {
  color: #475569;
  margin: 0;
}

.list {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  display: grid;
  gap: 12px;
}

.list h2 {
  margin: 0;
}

.hint {
  font-size: 14px;
  margin-top: -4px;
}

.draft {
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.draft-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 4px;
}

.pill {
  background: #dbeafe;
  color: #1e3a8a;
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.note {
  margin-top: 6px;
  line-height: 1.4;
}
</style>
