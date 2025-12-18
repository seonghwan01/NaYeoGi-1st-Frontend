// src/constants/storyConstants.js

/**
 * [기능] 날씨 태그 데이터 정의
 * [사용처] StoryDayCard 컴포넌트에서 날씨 선택 버튼 렌더링 시 사용
 */
export const WEATHER_TAGS = [
  { id: 'sunny', label: '맑음', icon: '☀️' },
  { id: 'cloudy', label: '흐림', icon: '⛅' },
  { id: 'rain', label: '비', icon: '☔' },
  { id: 'windy', label: '바람', icon: '🌬️' },
  { id: 'snow', label: '눈', icon: '❄️' },
  { id: 'hot', label: '폭염', icon: '🔥' },
  { id: 'cold', label: '한파', icon: '🥶' }
];

/**
 * [기능] 스토리 분위기(Tone) 데이터 정의
 * [사용처] StoryMetaForm 컴포넌트에서 분위기 선택 시 사용
 */
export const STORY_TONES = [
  { id: 'calm', label: '잔잔한 에세이', icon: '☕' },
  { id: 'mz', label: 'MZ 인스타', icon: '😎' },
  { id: 'funny', label: '유머/시트콤', icon: '🤣' },
  { id: 'diary', label: '솔직한 일기', icon: '📔' },
  { id: 'emotional', label: '새벽 감성', icon: '🌙' },
  {id:'formal',label:'정보 전달',icon:'🧐'},{id:'energetic',label:'활기찬 에너지',icon:'🔥'},{id:'romantic',label:'로맨틱',icon:'💕'},
  {id:'fairy',label:'동화 같은',icon:'🧚'},{id:'poetic',label:'시적인',icon:'✍️'},
  {id:'cynical',label:'냉철한 비평',icon:'🤔'},{id:'history',label:'역사 기행',icon:'🏛️'}
];


export const COMPANIONS = [
  {id:'solo',label:'혼자 🚶'},
  {id:'couple',label:'연인 ❤️'},
  {id:'friends',label:'친구들 🔥'},
  {id:'family',label:'가족(부모님) 👨‍👩‍👧‍👦'},{id:'children',label:'아이와 🐥'},
  {id:'pet',label:'반려동물 🐾'},
  {id:'club',label:'모임/동호회 🚩'},
  {id:'siblings',label:'형제/자매 👫'}
];

export const MOOD_TAGS = [
  '😍 설렘', '😋 맛집성공', '😎 힙함', '😌 힐링',
  '🤪 대유잼', '😭 아쉬움', '😡 비쌈', '⛈️ 흐림',
  '☀️ 햇살맛집', '🌊 오션뷰', '🌳 피톤치드', '🏙️ 도시뷰',
  '📸 인생샷', '🧘 여유로움', '🏃‍♂️ 걷기좋음', '🕯️ 로맨틱',
  '👨‍👩‍👧‍👦 가족단위', '🐶 애견동반', '☕ 커피맛집', '🍺 술한잔',
  '🤫 조용함', '🎉 시끌벅적', '🕰️ 레트로', '🆕 신상핫플'
];
