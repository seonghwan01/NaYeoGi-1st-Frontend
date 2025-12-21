import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getPlanDetails, getMyPlans } from '@/restapi/plan';

export const usePlanStore = defineStore('plan', () => {
  // --- 상태(State) ---
  const isLoading = ref(false);
  const error = ref(null);

  // 사용자의 전체 여행 계획 목록
  const myPlans = ref([]);

  // 현재 선택되었거나 상세 정보가 조회된 단일 여행 계획
  const selectedPlan = ref(null);

  // --- 액션(Actions) ---

  /**
   * 사용자의 모든 여행 계획 목록을 가져옵니다.
   */
  async function fetchMyPlans(memberId) {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await getMyPlans(memberId);
      myPlans.value = response.data;
    } catch (err) {
      console.error('나의 여행 계획 목록 조회 실패:', err);
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * ID로 특정 여행 계획의 상세 정보를 가져와 상태를 업데이트합니다.
   * @param {string | number} planId - 조회할 여행 계획의 ID
   */
  async function fetchPlanDetails(planId) {
    isLoading.value = true;
    selectedPlan.value = null;
    error.value = null;

    try {
      const response = await getPlanDetails(planId);
      // 백엔드 응답이 ApiResponseDto로 래핑되어 있으므로, 실제 데이터는 .data.data에 존재
      selectedPlan.value = response.data.data;
    } catch (err) {
      console.error(`Failed to fetch plan ${planId}:`, err);
      error.value = err;
      throw err; // 상위 컴포넌트에서 에러를 처리할 수 있도록 throw
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    error,
    myPlans,
    selectedPlan,
    fetchMyPlans,
    fetchPlanDetails
  };
});
