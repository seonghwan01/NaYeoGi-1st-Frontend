// src/constants/storyConstants.js

/**
 * [기능] 날씨 태그 카테고리별 데이터 정의
 * [사용처] StoryDayCard 컴포넌트에서 날씨 선택 버튼 렌더링 시 카테고리별로 렌더링
 */
export const WEATHER_TAGS_CATEGORIES = [
  {
    label: '맑음/흐림',
    items: [
      { id: 'sunny', label: '화창한 맑음', icon: '☀️' },
      { id: 'partly_cloudy', label: '구름 조금', icon: '⛅' },
      { id: 'cloudy', label: '잔뜩 흐림', icon: '☁️' },
      { id: 'sunset', label: '노을/석양', icon: '🌅' }, 
    ]
  },
  {
    label: '비/눈',
    items: [
      { id: 'rain', label: '비/소나기', icon: '☔' },
      { id: 'heavy_rain', label: '장대비', icon: '🌧️' },
      { id: 'snow', label: '눈/설경', icon: '❄️' },
    ]
  },
  {
    label: '기온/바람/기타',
    items: [
      { id: 'hot', label: '무더위/폭염', icon: '🔥' },
      { id: 'cold', label: '한파/추위', icon: '🥶' },
      { id: 'windy', label: '바람 많이', icon: '🌬️' },
      { id: 'foggy', label: '안개 자욱', icon: '🌫️' },
    ]
  }
];

/**
 * [기능] 날씨 태그 전체 리스트 (Flat)
 * [사용처] 기존 로직 호환성
 */
export const WEATHER_TAGS = WEATHER_TAGS_CATEGORIES.flatMap(cat => cat.items);

/**
 * [기능] 스토리 분위기(Tone) 카테고리별 데이터 정의
 * [사용처] StoryMetaForm 컴포넌트에서 분위기 선택 시 카테고리별로 렌더링
 */
export const STORY_TONES_CATEGORIES = [
  {
    label: '감성/에세이',
    items: [
      { id: 'calm', label: '차분한 에세이 (잔잔)', icon: '☕' },
      { id: 'emotional', label: '새벽 감성 (아련)', icon: '🌙' },
      { id: 'poetic', label: '시적인 표현 (문학)', icon: '✍️' },
      { id: 'fairy', label: '동화 같은 (몽글몽글)', icon: '🧚' },
    ]
  },
  {
    label: '재미/MZ',
    items: [
      { id: 'mz', label: 'MZ 인스타 감성 (힙)', icon: '😎' },
      { id: 'funny', label: '유머/시트콤 (드립)', icon: '🤣' },
      { id: 'energetic', label: '파이팅 넘치는 (열정)', icon: '🔥' },
    ]
  },
  {
    label: '정보/기록',
    items: [
      { id: 'diary', label: '솔직한 일기 (담백)', icon: '📔' },
      { id: 'formal', label: '정보 전달 중심 (꼼꼼)', icon: '🧐' },
      { id: 'history', label: '역사/지식 탐구', icon: '🏛️' },
      { id: 'critic', label: '냉철한 미식회 (비평)', icon: '🤔' },
    ]
  },
  {
    label: '테마',
    items: [
      { id: 'romantic', label: '로맨틱 (사랑)', icon: '💕' },
      { id: 'adventure', label: '모험과 탐험', icon: '🧭' }
    ]
  }
];

/**
 * [기능] 스토리 분위기(Tone) 전체 리스트 (Flat)
 * [사용처] 기존 로직 호환성 (getLabel 등)
 */
export const STORY_TONES = STORY_TONES_CATEGORIES.flatMap(cat => cat.items);

/**
 * [기능] 동행자(Companion) 데이터 정의
 * [사용처] StoryMetaForm 컴포넌트에서 동행자 선택 시 사용
 */
export const COMPANIONS = [
  { id: 'solo', label: '나 혼자', icon: '🚶' },
  { id: 'couple', label: '사랑하는 연인과', icon: '❤️' },
  { id: 'friends', label: '찐친들과', icon: '🔥' },
  { id: 'family_parents', label: '부모님 모시고', icon: '👨‍👩‍👧‍👦' },
  { id: 'family_kids', label: '아이와 함께', icon: '🐥' },
  { id: 'family_big', label: '대가족 여행', icon: '🚌' },
  { id: 'siblings', label: '형제/자매와', icon: '👫' },
  { id: 'pet', label: '반려동물과', icon: '🐾' },
  { id: 'club', label: '동호회/모임', icon: '🚩' },
  { id: 'colleague', label: '직장 동료와', icon: '💼' }
];

/**
 * [기능] 경험/감정 태그(Mood Tags) 카테고리별 데이터 정의
 * [사용처] StorySectionItem 컴포넌트에서 태그 선택 시 카테고리별로 렌더링
 * [목적] AI가 문장을 풍부하게 만들 수 있는 구체적인 재료 제공
 */
export const MOOD_TAGS_CATEGORIES = [
  {
    label: '감정/반응',
    items: [
      { label: '설렘가득', icon: '😍' },
      { label: '힐링타임', icon: '😌' },
      { label: '대유잼', icon: '🤪' },
      { label: '아쉬움', icon: '😭' },
      { label: '감탄연발', icon: '😲' },
      { label: '마음의여유', icon: '🧘' },
      { label: '스트레스해소', icon: '😤' },
      { label: '행복만땅', icon: '🥰' }
    ]
  },
  {
    label: '장소 특징',
    items: [
      { label: '오션뷰', icon: '🌊' },
      { label: '시티뷰', icon: '🏙️' },
      { label: '마운틴뷰', icon: '⛰️' },
      { label: '노을맛집', icon: '🌅' },
      { label: '야경명소', icon: '✨' },
      { label: '피톤치드', icon: '🌳' },
      { label: '이국적', icon: '🏰' },
      { label: '레트로', icon: '🕰️' },
      { label: '고즈넉한', icon: '🤫' },
      { label: '힙한분위기', icon: '🎉' },
      { label: '인생샷성지', icon: '📸' },
      { label: '꽃구경', icon: '🌸' }
    ]
  },
  {
    label: '미식/카페',
    items: [
      { label: '존맛탱', icon: '😋' },
      { label: '커피맛집', icon: '☕' },
      { label: '디저트천국', icon: '🍰' },
      { label: '낮술환영', icon: '🍺' },
      { label: '빵지순례', icon: '🍞' },
      { label: '건강한맛', icon: '🥗' },
      { label: '해산물싱싱', icon: '🦐' },
      { label: '고기진심', icon: '🥩' },
      { label: '웨이팅필수', icon: '🥡' },
      { label: '가성비갑', icon: '💸' },
      { label: '럭셔리다이닝', icon: '💎' }
    ]
  },
  {
    label: '편의/기타',
    items: [
      { label: '주차편리', icon: '🚗' },
      { label: '뚜벅이추천', icon: '🚇' },
      { label: '가족추천', icon: '👨‍👩‍👧‍👦' },
      { label: '애견동반', icon: '🐶' },
      { label: '예약필수', icon: '📱' },
      { label: '산책하기좋음', icon: '🏃‍♂️' },
      { label: '기념품추천', icon: '🎁' },
      { label: '책읽기좋음', icon: '📚' }
    ]
  }
];

/**
 * [기능] 경험/감정 태그(Mood Tags) 전체 리스트 (Flat)
 * [사용처] 기존 로직 호환성
 */
export const MOOD_TAGS = MOOD_TAGS_CATEGORIES.flatMap(cat => cat.items);