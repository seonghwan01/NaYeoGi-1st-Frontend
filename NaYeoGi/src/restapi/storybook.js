/**
 * Storybook 관련 API 요청 함수들을 모아놓은 파일
 *
 * @todo 백엔드 API 명세에 맞춰 실제 요청 로직 구현 필요
 */
import apiClient from "./common";


// /**
//  * AI 스토리 초안 생성을 요청합니다.
//  * @param {object} payload - 사용자가 입력한 스토리 데이터
//  * @returns {Promise} - Axios 응답 Promise
//  */
// export const generateDraft = (payload) => {
//   // return apiClient.post('/api/v1/stories/draft', payload);
//   console.log('API 요청: AI 초안 생성', payload);
//   // 실제 구현 전까지는 성공을 가정하고 Promise를 반환합니다.
//   return Promise.resolve({
//     data: {
//       text: '서버로부터 받은 AI 초안 텍스트입니다.'
//     }
//   });
// };

// /**
//  * 최종 수정된 스토리를 서버에 저장합니다.
//  * @param {object} finalStory - 사용자가 수정한 최종 스토리 데이터
//  * @returns {Promise} - Axios 응답 Promise
//  */
// export const saveStory = (finalStory) => {
//   // return apiClient.post('/stories', finalStory);
//   console.log('API 요청: 최종 스토리 저장', finalStory);
//   // 실제 구현 전까지는 성공을 가정하고 Promise를 반환합니다.
//   return Promise.resolve({
//     data: {
//       storyId: `S-${Date.now()}`
//     }
//   });
// };
// 1. AI 글 생성 요청
export const generateAiStoryApi = async (storyData) => {
  // Pinia store의 reactive 객체를 직접 변경하지 않도록 깊은 복사
  const transformedStoryData = JSON.parse(JSON.stringify(storyData));

  // 이미지 URL 배열을 순수한 문자열 URL 배열로 변환
  transformedStoryData.storyDays.forEach(day => {
    day.sections.forEach(section => {

      if (section.imageUrls && Array.isArray(section.imageUrls)) {
        section.imageUrls = section.imageUrls
          .filter(image => !image.isUploading && !image.error) // 업로드 중이거나 에러난 이미지는 제외
          .map(image => image.url); // URL 문자열만 추출
      } else {
        section.imageUrls = []; // 배열이 아니거나 없으면 빈 배열로 초기화
      }
    });
  });

  // 백엔드: StoryController의 @PostMapping("/stories/ai-generate")
  const response = await apiClient.post("/stories/ai-generate", transformedStoryData);
  return response.data.data; // ApiResponse 구조에 따라 .data.data
};

// 2. 최종 저장 요청
export const saveStoryApi = async (finalData) => {
  // 백엔드: StoryController의 @PostMapping("/stories")
  const response = await apiClient.post("/stories", finalData);
  return response.data.data;
};
/**
 * 저장된 스토리를 ID로 조회합니다.
 * @param {string} storyId - 조회할 스토리의 ID
 * @returns {Promise} - Axios 응답 Promise
 */
export const getStoryById = (storyId) => {
  // return apiClient.get(`/api/v1/stories/${storyId}`);
  console.log('API 요청: 스토리 조회', storyId);
  // 실제 구현 전까지는 성공을 가정하고 더미 데이터를 담은 Promise를 반환합니다.
  return Promise.resolve({
    data: {
      storyId: storyId,
      title: '더미 데이터: 제주도 가족 여행',
      content: '<h1>안녕하세요!</h1><p>이것은 서버에서 불러온 최종 저장본입니다.</p>',
      images: [],
      createdAt: new Date().toISOString(),
    }
  });
};
