import { defineStore } from 'pinia'

export const usePlanStore = defineStore('plan', {
  state: () => ({
    recommendedPlan: {
      destination: '강릉',
      theme: '힐링/카페투어',
      duration: '1박 2일',
      party: '친구 2명',
      budget: '중간',
      summary: '카페 · 바다 뷰 동선 위주, 이동은 차량 기준',
      stops: [
        { time: '09:00', title: '경포대 해변', note: '산책 & 사진 포인트 체크' },
        { time: '12:00', title: '안목 커피 거리', note: '카페 2곳 중 택1, 노트북 좌석 확인' },
        { time: '15:00', title: '주문진 시장', note: '늦은 점심 & 시장 뷰' },
        { time: '18:30', title: '사천진 해변', note: '노을 촬영 후 숙소 체크인' },
        { time: '다음날 10:00', title: '카페 보헤미안', note: '브런치 후 귀가' },
      ],
      alternatives: [
        { label: '비 오는 날', value: '뮤지엄/북카페 묶음으로 대체' },
        { label: '차 없는 경우', value: '버스 정류장 반경 500m 내 스팟으로 재배치' },
      ],
    },
  }),
})
