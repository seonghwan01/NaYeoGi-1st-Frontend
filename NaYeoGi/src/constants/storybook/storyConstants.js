// src/constants/storyConstants.js

/**
 * [기능] 날씨 태그 데이터 정의
 * [사용처] StoryDayCard 컴포넌트에서 날씨 선택 버튼 렌더링 시 사용
 */
export const WEATHER_TAGS = [
  { id: 'sunny', label: '화창한 맑음 ☀️', icon: '☀️' },
  { id: 'partly_cloudy', label: '구름 조금 ⛅', icon: '⛅' },
  { id: 'cloudy', label: '잔뜩 흐림 ☁️', icon: '☁️' },
  { id: 'rain', label: '비/소나기 ☔', icon: '☔' },
  { id: 'heavy_rain', label: '장대비 🌧️', icon: '🌧️' },
  { id: 'snow', label: '눈/설경 ❄️', icon: '❄️' },
  { id: 'windy', label: '바람 많이 🌬️', icon: '🌬️' },
  { id: 'foggy', label: '안개 자욱 🌫️', icon: '🌫️' },
  { id: 'sunset', label: '노을/석양 🌅', icon: '🌅' }, 
  { id: 'hot', label: '무더위/폭염 🔥', icon: '🔥' },
  { id: 'cold', label: '한파/추위 🥶', icon: '🥶' }
];

/**
 * [기능] 스토리 분위기(Tone) 데이터 정의
 * [사용처] StoryMetaForm 컴포넌트에서 분위기 선택 시 사용
 */
export const STORY_TONES = [
  // 감성/에세이 계열
  { id: 'calm', label: '차분한 에세이 (잔잔)', icon: '☕' },
  { id: 'emotional', label: '새벽 감성 (아련)', icon: '🌙' },
  { id: 'poetic', label: '시적인 표현 (문학)', icon: '✍️' },
  { id: 'fairy', label: '동화 같은 (몽글몽글)', icon: '🧚' },
  
  // 재미/MZ 계열
  { id: 'mz', label: 'MZ 인스타 감성 (힙)', icon: '😎' },
  { id: 'funny', label: '유머/시트콤 (드립)', icon: '🤣' },
  { id: 'energetic', label: '파이팅 넘치는 (열정)', icon: '🔥' },
  
  // 정보/기록 계열
  { id: 'diary', label: '솔직한 일기 (담백)', icon: '📔' },
  { id: 'formal', label: '정보 전달 중심 (꼼꼼)', icon: '🧐' },
  { id: 'history', label: '역사/지식 탐구', icon: '🏛️' },
  { id: 'critic', label: '냉철한 미식회 (비평)', icon: '🤔' },
  
  // 테마 계열
  { id: 'romantic', label: '로맨틱 (사랑)', icon: '💕' },
  { id: 'adventure', label: '모험과 탐험', icon: '🧭' }
];

/**
 * [기능] 동행자(Companion) 데이터 정의
 * [사용처] StoryMetaForm 컴포넌트에서 동행자 선택 시 사용
 */
export const COMPANIONS = [
  { id: 'solo', label: '나 혼자 🚶' },
  { id: 'couple', label: '사랑하는 연인과 ❤️' },
  { id: 'friends', label: '찐친들과 🔥' },
  { id: 'family_parents', label: '부모님 모시고 👨‍👩‍👧‍👦' },
  { id: 'family_kids', label: '아이와 함께 🐥' },
  { id: 'family_big', label: '대가족 여행 🚌' },
  { id: 'siblings', label: '형제/자매와 👫' },
  { id: 'pet', label: '반려동물과 🐾' },
  { id: 'club', label: '동호회/모임 🚩' },
  { id: 'colleague', label: '직장 동료와 💼' }
];

/**
 * [기능] 경험/감정 태그(Mood Tags) 데이터 정의
 * [사용처] StorySectionItem 컴포넌트에서 태그 선택 시 사용
 * [목적] AI가 문장을 풍부하게 만들 수 있는 구체적인 재료 제공
 */
export const MOOD_TAGS = [
  // 감정/반응
  '😍 설렘가득', '😌 힐링타임', '🤪 대유잼', '😭 아쉬움', 
  '😲 감탄연발', '🧘 마음의여유', '😤 스트레스해소', '🥰 행복만땅',
  
  // 장소 특징 (뷰/분위기)
  '🌊 오션뷰', '🏙️ 시티뷰', '⛰️ 마운틴뷰', '🌅 노을맛집', 
  '✨ 야경명소', '🌳 피톤치드', '🏰 이국적', '🕰️ 레트로', 
  '🤫 고즈넉한', '🎉 힙한분위기', '📸 인생샷성지', '🌸 꽃구경',
  
  // 미식/카페
  '😋 존맛탱', '☕ 커피맛집', '🍰 디저트천국', '🍺 낮술환영', 
  '🍞 빵지순례', '🥗 건강한맛', '🦐 해산물싱싱', '🥩 고기진심', 
  '🥡 웨이팅필수', '💸 가성비갑', '💎 럭셔리다이닝',
  
  // 편의/기타
  '🚗 주차편리', '🚇 뚜벅이추천', '👨‍👩‍👧‍👦 가족추천', '🐶 애견동반', 
  '📱 예약필수', '🏃‍♂️ 산책하기좋음', '🎁 기념품추천', '📚 책읽기좋음'
];