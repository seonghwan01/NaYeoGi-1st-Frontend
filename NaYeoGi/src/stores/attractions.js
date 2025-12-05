import { defineStore } from 'pinia'

export const useAttractionStore = defineStore('attractions', {
  state: () => ({
    categories: [
      { id: 'domestic', title: '국내 여행', count: 8, summary: '서울, 부산, 강릉 등 근교/지방 코스', tag: '힐링' },
      { id: 'overseas', title: '해외 여행', count: 5, summary: '오사카, 타이베이, 다낭 등 단거리 인기 루트', tag: '도시' },
      { id: 'camping', title: '캠핑/글램핑', count: 4, summary: '계절별 감성 캠핑 스팟과 장비 체크리스트', tag: '자연' },
      { id: 'resort', title: '호캉스', count: 6, summary: '수영장/스파 중심 호캉스 패키지 모음', tag: '휴식' },
      { id: 'food', title: '맛집투어', count: 7, summary: '지역별 미식 동선과 예약 포인트', tag: '미식' },
      { id: 'healing', title: '힐링', count: 6, summary: '산책로, 카페, 숙소가 가까운 조용한 코스', tag: '힐링' },
    ],
    featured: [
      {
        title: '경포대 해변',
        location: '강릉',
        category: '국내 여행',
        rating: 4.8,
        mood: '힐링',
        highlight: '바다 뷰 산책 + 노을 포인트',
      },
      {
        title: '카페 거리 나카자키초',
        location: '오사카',
        category: '해외 여행',
        rating: 4.6,
        mood: '도시 감성',
        highlight: '레트로 카페 & 소품샵 밀집',
      },
      {
        title: '노을 맛집 카페 라마다',
        location: '부산',
        category: '호캉스',
        rating: 4.5,
        mood: '뷰 맛집',
        highlight: '루프탑 바 + 광안대교 뷰',
      },
      {
        title: '청도 글램핑 포레스트',
        location: '경북',
        category: '캠핑/글램핑',
        rating: 4.7,
        mood: '자연',
        highlight: '불멍존, 숲 산책로 보유',
      },
    ],
  }),
})
