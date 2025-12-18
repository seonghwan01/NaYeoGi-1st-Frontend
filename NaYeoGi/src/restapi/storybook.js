/**
 * Storybook 관련 API 요청 함수들을 모아놓은 파일
 *
 * @todo 백엔드 API 명세에 맞춰 실제 요청 로직 구현 필요
 */
import axios from 'axios';

// Axios 인스턴스 생성 (필요에 따라 설정 추가)
const apiClient = axios.create({
  baseURL: '/api', // 백엔드 API의 기본 URL
  // timeout: 10000,
});

/**
 * AI 스토리 초안 생성을 요청합니다.
 * @param {object} payload - 사용자가 입력한 스토리 데이터
 * @returns {Promise} - Axios 응답 Promise
 */
export const generateDraft = (payload) => {
  // return apiClient.post('/stories/draft', payload);
  console.log('API 요청: AI 초안 생성', payload);
  // 실제 구현 전까지는 성공을 가정하고 Promise를 반환합니다.
  return Promise.resolve({
    data: {
      text: '서버로부터 받은 AI 초안 텍스트입니다.'
    }
  });
};

/**
 * 최종 수정된 스토리를 서버에 저장합니다.
 * @param {object} finalStory - 사용자가 수정한 최종 스토리 데이터
 * @returns {Promise} - Axios 응답 Promise
 */
export const saveStory = (finalStory) => {
  // return apiClient.post('/stories', finalStory);
  console.log('API 요청: 최종 스토리 저장', finalStory);
  // 실제 구현 전까지는 성공을 가정하고 Promise를 반환합니다.
  return Promise.resolve({
    data: {
      storyId: `S-${Date.now()}`
    }
  });
};

/**
 * 저장된 스토리를 ID로 조회합니다.
 * @param {string} storyId - 조회할 스토리의 ID
 * @returns {Promise} - Axios 응답 Promise
 */
export const getStoryById = (storyId) => {
  // return apiClient.get(`/stories/${storyId}`);
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
