import { defineStore } from 'pinia'

export const useStorybookStore = defineStore('storybook', {
  state: () => ({
    drafts: [
      {
        id: 1,
        title: '제주 푸른 밤',
        mood: '감성',
        photos: 12,
        status: '작성 중',
        tags: ['제주', '바다', '노을'],
        note: '노을 사진 5장으로 초안 생성 완료',
      },
      {
        id: 2,
        title: '부산 주말 스냅',
        mood: '활기',
        photos: 8,
        status: '검수 대기',
        tags: ['우정', '도시'],
        note: '코멘트만 추가하면 발행 가능',
      },
    ],
    templates: [
      { title: '감성 에세이', description: '잔잔한 톤 & 긴 문장 위주' },
      { title: '대화형 기록', description: '대화체로 가볍게 읽히는 스타일' },
      { title: '아이와 함께', description: '사진 캡션을 따뜻한 어조로' },
    ],
    nextId: 3,
  }),
  actions: {
    addDraft(payload) {
      this.drafts.unshift({
        id: this.nextId++,
        status: '작성 중',
        photos: payload.photos ?? 0,
        mood: payload.mood ?? '기본',
        title: payload.title ?? '새 스토리북',
        tags: payload.tags ?? [],
        note: payload.note ?? '',
      })
    },
  },
})
