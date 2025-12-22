/**
 * Storybook 관련 API 요청 함수들을 모아놓은 파일
 */
import apiClient from "./common";

// 1. AI 글 생성 요청
export const generateAiStoryApi = async (storyData) => {
  const transformedStoryData = JSON.parse(JSON.stringify(storyData));

  transformedStoryData.storyDays.forEach(day => {
    day.sections.forEach(section => {
      if (section.imageUrls && Array.isArray(section.imageUrls)) {
        section.imageUrls = section.imageUrls
          .filter(image => !image.isUploading && !image.error)
          .map(image => image.url);
      } else {
        section.imageUrls = [];
      }
    });
  });

  const response = await apiClient.post("/stories/ai-generate", transformedStoryData);
  return response.data.data;
};

// 2. 최종 저장 요청
export const saveStoryApi = async (finalData) => {
  const response = await apiClient.post("/stories", finalData);
  return response.data.data;
};

/**
 * 저장된 스토리를 ID로 조회합니다.
 * @param {string} storyId - 조회할 스토리의 ID
 * @returns {Promise<object>} - 스토리 데이터
 */
export const getStoryById = async (storyId) => {
  const response = await apiClient.get(`/stories/${storyId}`);
  return response.data.data;
};

/**
 * 현재 사용자의 모든 스토리 목록을 조회합니다.
 * @returns {Promise<Array<object>>} - 스토리 목록 데이터
 */
export const getMyStories = async () => {
  const response = await apiClient.get('/stories');
  return response.data.data;
};
