import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getPlanById } from '@/restapi/plan';

export const usePlanStore = defineStore('plan', () => {
  // --- 상태(State) ---

  // 현재 로드된 여행 계획 데이터를 저장
  const currentPlan = ref(null);
  // 데이터를 로딩 중인지 여부
  const isLoading = ref(false);
  // 에러 발생 시 에러 메시지 저장
  const error = ref(null);

  // --- 액션(Actions) ---

  /**
   * ID로 특정 여행 계획을 서버에서 가져와 상태를 업데이트합니다.
   * @param {string | number} planId - 조회할 여행 계획의 ID
   */
  async function fetchPlan(planId) {
    isLoading.value = true;
    currentPlan.value = null;
    error.value = null;

    try {
      const response = await getPlanById(planId);
      currentPlan.value = response.data;
    } catch (err) {
      console.error(`Failed to fetch plan ${planId}:`, err);
      error.value = err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * 현재 저장된 여행 계획 데이터를 초기화합니다.
   */
  function clearCurrentPlan() {
    currentPlan.value = null;
  }

  return {
    currentPlan,
    isLoading,
    error,
    fetchPlan,
    clearCurrentPlan,
  };
});
