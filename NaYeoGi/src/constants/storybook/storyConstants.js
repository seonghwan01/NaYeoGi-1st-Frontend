// src/constants/storybook/storyConstants.js

/**
 * [기능] 날씨 태그 카테고리별 데이터 정의
 * [사용처] StoryDayCard 컴포넌트에서 날씨 선택 버튼 렌더링 시 카테고리별로 렌더링
 */
export const WEATHER_TAGS_CATEGORIES = [
  {
    label: '맑음/시간',
    items: [
      { id: 'sunny', label: '햇살 좋은', icon: '☀️' },
      { id: 'partly_cloudy', label: '구름 조금', icon: '⛅' },
      { id: 'sunset', label: '노을 지는', icon: '🌅' },
      { id: 'night', label: '별이 보이는', icon: '✨' },
    ]
  },
  {
    label: '흐림/비/눈',
    items: [
      { id: 'cloudy', label: '잔뜩 흐린', icon: '☁️' },
      { id: 'rain', label: '비 내리는', icon: '☔' },
      { id: 'heavy_rain', label: '폭우가 쏟아지는', icon: '🌧️' },
      { id: 'snow', label: '눈 내리는', icon: '❄️' },
    ]
  },
  {
    label: '기온/바람',
    items: [
      { id: 'hot', label: '햇빛 쨍쨍 무더운', icon: '🔥' },
      { id: 'cold', label: '손발 시린 추위', icon: '🥶' },
      { id: 'cool', label: '선선한/시원한', icon: '🍃' },
      { id: 'windy', label: '바람이 거센', icon: '🌬️' },
      { id: 'foggy', label: '안개 자욱한', icon: '🌫️' },
    ]
  }
];

/**
 * [기능] 날씨 태그 전체 리스트 (Flat)
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
      { id: 'calm', label: '차분한 (잔잔한 독백)', icon: '☕' },
      { id: 'emotional', label: '감성적인 (새벽 감성)', icon: '🌙' },
      { id: 'poetic', label: '낭만적인 (시적인 표현)', icon: '✍️' },
      { id: 'warm', label: '따뜻한 (몽글몽글)', icon: '🧸' },
    ]
  },
  {
    label: '활기/트렌드',
    items: [
      { id: 'trendy', label: '트렌디한 (힙한 감성)', icon: '😎' },
      { id: 'witty', label: '유쾌한 (재치있는 드립)', icon: '🤣' },
      { id: 'energetic', label: '활기찬 (에너지 뿜뿜)', icon: '🔥' },
    ]
  },
  {
    label: '정보/리뷰',
    items: [
      { id: 'diary', label: '담백한 (솔직한 일기)', icon: '📔' },
      { id: 'informative', label: '정보 중심 (꼼꼼한 팁)', icon: '🧐' },
      { id: 'review', label: '상세한 리뷰 (평가)', icon: '⭐' },
      { id: 'history', label: '지적인 (역사/유래)', icon: '🏛️' },
    ]
  },
  {
    label: '테마',
    items: [
      { id: 'romantic', label: '로맨틱 (사랑 가득)', icon: '💕' },
      { id: 'adventure', label: '역동적인 (모험/탐험)', icon: '🧭' }
    ]
  }
];

/**
 * [기능] 스토리 분위기(Tone) 전체 리스트 (Flat)
 */
export const STORY_TONES = STORY_TONES_CATEGORIES.flatMap(cat => cat.items);

/**
 * [기능] 동행자(Companion) 데이터 정의
 */
export const COMPANIONS = [
  { id: 'solo', label: '나 혼자', icon: '🚶' },
  { id: 'couple', label: '연인과', icon: '❤️' },
  { id: 'friends', label: '친구들과', icon: '🔥' },
  { id: 'family_parents', label: '부모님과', icon: '👨‍👩‍👧‍👦' },
  { id: 'family_kids', label: '아이와', icon: '🐥' },
  { id: 'family_big', label: '온 가족이', icon: '🚌' },
  { id: 'siblings', label: '형제/자매와', icon: '👫' },
  { id: 'pet', label: '반려동물과', icon: '🐾' },
  { id: 'club', label: '모임/동호회', icon: '🚩' },
  { id: 'colleague', label: '직장 동료와', icon: '💼' }
];

/**
 * [기능] 경험/감정 태그(Mood Tags) 카테고리별 데이터 정의
 */
export const MOOD_TAGS_CATEGORIES = [
  {
    label: '감정/반응',
    items: [
      { label: '설렘 가득', icon: '😍' },
      { label: '제대로 힐링', icon: '😌' },
      { label: '완전 꿀잼', icon: '🤪' },
      { label: '아쉬운 마음', icon: '😭' },
      { label: '입이 떡 벌어짐', icon: '😲' },
      { label: '여유로움', icon: '🧘' },
      { label: '스트레스 타파', icon: '😤' },
      { label: '행복 그 자체', icon: '🥰' }
    ]
  },
  {
    label: '풍경/분위기',
    items: [
      { label: '탁 트인 오션뷰', icon: '🌊' },
      { label: '화려한 시티뷰', icon: '🏙️' },
      { label: '웅장한 마운틴뷰', icon: '⛰️' },
      { label: '환상적인 노을', icon: '🌅' },
      { label: '반짝이는 야경', icon: '✨' },
      { label: '상쾌한 숲내음', icon: '🌳' },
      { label: '이국적인 느낌', icon: '🏰' },
      { label: '레트로 감성', icon: '🕰️' },
      { label: '고즈넉한', icon: '🤫' },
      { label: '힙한 분위기', icon: '🎉' },
      { label: '인생샷 명소', icon: '📸' },
      { label: '꽃놀이', icon: '🌸' }
    ]
  },
  {
    label: '맛집/카페',
    items: [
      { label: '입안 가득 행복', icon: '😋' },
      { label: '커피가 맛있는', icon: '☕' },
      { label: '달콤한 디저트', icon: '🍰' },
      { label: '낮술 한잔', icon: '🍺' },
      { label: '빵지순례', icon: '🍞' },
      { label: '건강해지는 맛', icon: '🥗' },
      { label: '신선한 해산물', icon: '🦐' },
      { label: '육즙 가득 고기', icon: '🥩' },
      { label: '웨이팅 맛집', icon: '🥡' },
      { label: '가성비 최고', icon: '💸' },
      { label: '고급스러운', icon: '💎' }
    ]
  },
  {
    label: '편의/기타',
    items: [
      { label: '주차 편리', icon: '🚗' },
      { label: '뚜벅이 여행', icon: '🚇' },
      { label: '아이와 가기 좋음', icon: '👨‍👩‍👧‍👦' },
      { label: '반려동물 동반', icon: '🐶' },
      { label: '예약 필수', icon: '📱' },
      { label: '걷기 좋은 길', icon: '🏃‍♂️' },
      { label: '기념품 쇼핑', icon: '🎁' },
      { label: '조용한 휴식', icon: '📚' }
    ]
  }
];

/**
 * [기능] 경험/감정 태그(Mood Tags) 전체 리스트 (Flat)
 */
export const MOOD_TAGS = MOOD_TAGS_CATEGORIES.flatMap(cat => cat.items);