import axios from 'axios';

export async function requestCreatePlan(requestBody) {
  const response = await fetch('/api/v1/plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error('여행 계획 저장에 실패했습니다.')
  }

  return response.json()
}

/**
 * Plan(여행 계획) 관련 API 요청 함수들을 모아놓은 파일
 */

// Axios 인스턴스 생성 (필요에 따라 설정 추가)
const apiClient = axios.create({
  baseURL: '/api', // 실제 백엔드 API의 기본 URL로 가정
});

/**
 * ID로 특정 여행 계획 상세 정보를 조회합니다.
 * @param {string | number} planId - 조회할 여행 계획의 ID
 * @returns {Promise} - Axios 응답 Promise
 */
export const getPlanById = (planId) => {
  // return apiClient.get(`/plans/${planId}`);

  console.log(`[API 요청] /api/plans/${planId}`);

  // --- 실제 백엔드 연동 전까지 사용할 더미 데이터 ---
  const dummyPlan = {
    id: planId,
    memberId: "ssafy",
    title: "나의 신나는 제주 여행",
    startDate: "2023-10-20",
    endDate: "2023-10-22",
    description: "가족과 함께하는 3일간의 제주 여행",
    details: [
      {
        planDate: 1,
        sequence: 1,
        attraction: {
          id: 125266,
          title: "제주국제공항",
          firstImage1: "http://tong.visitkorea.or.kr/cms/resource/83/2597883_image2_1.jpg",
          addr1: "제주특별자치도 제주시 공항로 2",
        }
      },
      {
        planDate: 1,
        sequence: 2,
        attraction: {
          id: 125405,
          title: "용두암",
          firstImage1: "http://tong.visitkorea.or.kr/cms/resource/78/2597878_image2_1.jpg",
          addr1: "제주특별자치도 제주시 용담이동",
        }
      },
      {
        planDate: 2,
        sequence: 1,
        attraction: {
          id: 126498,
          title: "성산일출봉",
          firstImage1: "http://tong.visitkorea.or.kr/cms/resource/31/2676031_image2_1.jpg",
          addr1: "제주특별자치도 서귀포시 성산읍 성산리 1",
        }
      },
      {
        planDate: 3,
        sequence: 1,
        attraction: {
          id: 126485,
          title: "천지연폭포",
          firstImage1: "http://tong.visitkorea.or.kr/cms/resource/42/2676042_image2_1.jpg",
          addr1: "제주특별자치도 서귀포시 천지동",
        }
      }
    ]
  };

  // 성공 응답을 시뮬레이션하여 Promise를 반환
  return Promise.resolve({ data: dummyPlan });
};
