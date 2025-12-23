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
 * @param {string | number} [planId] - 필터링할 여행 계획 ID (선택)
 * @returns {Promise<Array<object>>} - 스토리 목록 데이터
 */
export const getMyStories = async (planId) => {
  const params = {};
  if (planId) {
    params.planId = planId;
  }
  const response = await apiClient.get('/stories', { params });
  return response.data.data;
};

/**
 * ID로 스토리를 삭제합니다.
 * @param {string | number} storyId - 삭제할 스토리의 ID
 * @returns {Promise} - Axios 응답 Promise
 */
export const deleteStoryApi = async (storyId) => {
  return await apiClient.delete(`/stories/${storyId}`);
};

/**
 * ID로 스토리의 공개 상태를 변경합니다.
 * @param {string | number} storyId - 상태를 변경할 스토리의 ID
 * @param {boolean} isPublic - 새로운 공개 여부 상태
 * @returns {Promise} - Axios 응답 Promise
 */
export const updateStoryVisibilityApi = async (storyId, isPublic) => {
  console.log(`[API 요청 진단] 공개 상태 변경 요청: storyId=${storyId}, isPublic=${isPublic}`);
  return await apiClient.patch(`/stories/${storyId}/visibility`, { isPublic });
};

/**
 * ID로 스토리를 수정합니다.
 * @param {string | number} storyId - 수정할 스토리의 ID
 * @param {object} storyData - 수정할 스토리 데이터 (StoryUpdateRequest DTO)
 * @returns {Promise} - Axios 응답 Promise
 */
export const updateStoryApi = async (storyId, storyData) => {
  return await apiClient.put(`/stories/${storyId}`, storyData);
};
