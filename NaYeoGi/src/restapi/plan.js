// src/restapi/plan.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1', // Vite 프록시를 통해 백엔드 API로 연결됩니다.
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
});

/**
 * 사용자의 모든 여행 계획 목록을 조회합니다.
 * @param {string | number} memberId - 조회할 사용자의 ID
 * @returns {Promise} - Axios 응답 Promise
 */
export const getMyPlans = (memberId) => apiClient.get(`/plans?memberId=${memberId}`);

/**
 * ID로 특정 여행 계획의 상세 정보를 조회합니다.
 * 백엔드에서 Plan의 기본 정보와 상세 방문지 목록(details)을 모두 반환한다고 가정합니다.
 * @param {string | number} planId - 조회할 여행 계획의 ID
 * @returns {Promise} - Axios 응답 Promise
 */
export const getPlanDetails = (planId) => apiClient.get(`/stories/plan-info/${planId}`);

/**
 * 새로운 여행 계획을 생성합니다.
 * @param {object} requestBody - 여행 계획 생성을 위한 데이터
 * @returns {Promise} - Axios 응답 Promise
 */
export const requestCreatePlan = (requestBody) => apiClient.post('/plans', requestBody);