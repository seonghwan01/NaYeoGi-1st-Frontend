import { defineStore } from 'pinia';
import { ref , reactive} from 'vue';
import { useRouter } from 'vue-router';
// API 통신을 담당할 파일을 임포트합니다. (다음 단계에서 생성)
import { uploadImagesApi, deleteImageApi } from "@/restapi/image";
import { generateAiStoryApi, saveStoryApi, getStoryById } from "@/restapi/storybook";

 export const useStorybookStore = defineStore('storybook', () => {
  const router = useRouter();

  // UI 로딩 상태를 관리합니다. (예: 스피너 표시)
  const isLoading = ref(false);
  const currentStory = reactive({
    storyTitle: "",     // 예: "우정 가득 제주도 3박 4일 여행"
    startDate: "",      // 예: "2024-05-10"
    endDate: "",        // 예: "2024-05-13"
    companions: [],     // 예: ["friends", "family"]
    tones: [],          // 예: ["humorous", "calm"]

    // 일차별 상세 기록
    storyDays: []       // 기존 days 배열과 동일한 구조
  });

  // AI가 생성한 초안(수정 전 데이터)을 임시로 저장합니다.
  const storyDraft = ref(null);

  // =========================================
  // 2. Actions (기능 로직)
  // =========================================

  // store를 초기화하거나 리셋하는 액션
  function resetCurrentStory() {
    Object.assign(currentStory, {
      storyTitle: "",
      startDate: "",
      endDate: "",
      companions: [],
      tones: [],
      storyDays: []
    });
  }
  /**
   * [이미지 추가] 특정 날짜, 특정 장소(Section)에 이미지를 업로드하고 URL 저장 (낙관적 UI 적용)
   */
  async function uploadImagesToSection(dayIndex, sectionIndex, files) {
    const targetSection = currentStory.storyDays[dayIndex]?.sections[sectionIndex];
    if (!targetSection) return;

    if (!targetSection.imageUrls) {
      targetSection.imageUrls = [];
    }

    const tempFiles = files.map(file => ({
      id: `temp_${Date.now()}_${Math.random()}`, // 임시 고유 ID
      url: URL.createObjectURL(file), // 미리보기를 위한 Blob URL
      isUploading: true,
      file: file // 실제 파일 객체
    }));

    // 1. UI에 즉시 반영
    targetSection.imageUrls.push(...tempFiles);

    try {
      // 2. 백그라운드에서 실제 업로드
      const newUrls = await uploadImagesApi(files);

      // 3. 성공 시, 임시 객체를 실제 URL로 교체
      newUrls.forEach((newUrl, i) => {
        const tempId = tempFiles[i].id;
        const imageIndex = targetSection.imageUrls.findIndex(img => img.id === tempId);
        if (imageIndex > -1) {
          // 메모리 누수 방지를 위해 Blob URL 해제
          URL.revokeObjectURL(targetSection.imageUrls[imageIndex].url);
          // 실제 데이터로 교체
          targetSection.imageUrls[imageIndex] = { id: newUrl, url: newUrl, isUploading: false };
        }
      });
    } catch (error) {
      // 4. 실패 시, 임시 객체 제거
      console.error("이미지 업로드 실패:", error);
      alert("일부 이미지 업로드에 실패했습니다.");
      tempFiles.forEach(tempFile => {
        const index = targetSection.imageUrls.findIndex(img => img.id === tempFile.id);
        if (index > -1) {
          URL.revokeObjectURL(targetSection.imageUrls[index].url);
          targetSection.imageUrls.splice(index, 1);
        }
      });
    }
  }

  /**
   * [이미지 삭제] S3에서 삭제하고 상태에서도 제거 (낙관적 UI 적용)
   */
  async function removeImageFromSection(dayIndex, sectionIndex, imageIndex) {
    const targetSection = currentStory.storyDays[dayIndex]?.sections[sectionIndex];
    const image = targetSection?.imageUrls?.[imageIndex];

    if (!image || image.isDeleting) return;

    // 1. UI에 즉시 반영 (삭제 중 상태로 변경)
    image.isDeleting = true;

    try {
      // 2. 백그라운드에서 실제 삭제
      await deleteImageApi(image.url);
      // 3. 성공 시, 배열에서 완전히 제거
      // isDeleting 상태가 true인 동안 다른 작업이 들어오지 않도록 filter 사용
      targetSection.imageUrls = targetSection.imageUrls.filter(img => img.id !== image.id);

    } catch (error) {
      // 4. 실패 시, 삭제 중 상태를 해제하고 알림
      console.error("이미지 삭제 실패:", error);
      alert("이미지 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      image.isDeleting = false;
    }
  }

  function addSection(dayIndex) {
    currentStory.storyDays[dayIndex].sections.push({
      placeName: "",
      weather: "",      // 빈 값으로 초기화
      atmosphere: "",   // 빈 값으로 초기화
      content: "",
      imageUrls: []
    });
  }

  // 날짜 계산 헬퍼 함수
  function calculateDate(startDate, dayOffset) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    // YYYY-MM-DD 형식으로 반환
    return date.toISOString().split('T')[0];
  }

  /**
   * Plan 데이터와 동기화하여 Storybook의 기본 구조를 생성합니다.
   * @param {object} plan - planStore.selectedPlan에서 받아온 계획 객체
   */
  function syncWithPlanData(plan) {
    if (!plan || !plan.startDate || !plan.endDate) {
      console.error("동기화할 Plan 데이터가 올바르지 않습니다. (날짜 정보 누락)");
      resetCurrentStory();
      return;
    }

    // 1. 기본 정보 설정
    currentStory.storyTitle = `${plan.title}의 기록`;
    currentStory.startDate = plan.startDate;
    currentStory.endDate = plan.endDate;
    currentStory.companions = []; // 기본값 초기화
    currentStory.tones = []; // 기본값 초기화

    // 2. 여행 기간 계산 및 모든 일차의 빈 템플릿 생성
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const tripDuration = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    const allDays = [];
    for (let i = 0; i < tripDuration; i++) {
        allDays.push({
            dayNum: i + 1,
            date: calculateDate(plan.startDate, i),
            weather: [],
            sections: []
        });
    }

    // 3. 방문지 데이터를 미리 만들어 둔 일차 템플릿에 주입
    if (plan.details && plan.details.length > 0) {
        plan.details.forEach(detail => {
            // planDate는 1부터 시작하므로, 배열 인덱스를 위해 -1
            const dayIndex = detail.planDate - 1;
            if (dayIndex >= 0 && dayIndex < allDays.length) {
                allDays[dayIndex].sections.push({
                    id: detail.attraction.id, // v-for를 위한 고유 key
                    placeName: detail.attraction.title,
                    visitOrder: detail.sequence,
                    weather: "",
                    atmosphere: "",
                    content: "",
                    imageUrls: [],
                    selectedTags: [],
                });
            }
        });
    }

    // 4. 최종 데이터를 currentStory에 할당
    currentStory.storyDays = allDays;
  }
  
  async function generateStoryDraft() {
    isLoading.value = true;
    storyDraft.value = null;

    try {
      // 1. AI에게 보낼 데이터 정제 (Cleanup)
      // currentStory는 reactive 객체이므로, 직접 수정하지 않고 깊은 복사를 통해 payload를 만듭니다.
      const payload = JSON.parse(JSON.stringify(currentStory));
      
      payload.storyDays.forEach(day => {
        day.sections.forEach(section => {
          // 프론트엔드에서만 사용하는 id 속성 제거
          delete section.id;
          
          // 값이 비어있는 속성 제거
          if (section.atmosphere === "") {
            delete section.atmosphere;
          }
          if (section.weather === "") {
            delete section.weather;
          }
        });
      });

      console.log("AI에게 보낼 정제된 데이터:", payload);

      // 2. 백엔드 API 호출
      const response = await generateAiStoryApi(payload);

      // 3. 백엔드에서 받은 결과 저장
      storyDraft.value = response;

      // 4. 수정 페이지로 이동
      router.push('/storybook/edit');

    } catch (error) {
      console.error("AI 스토리 생성 실패:", error);
      alert("AI가 글을 쓰는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * [액션 2] 최종 스토리 저장 (진짜 저장)
   */
  async function saveFinalStory(finalStoryData) {
    isLoading.value = true;
    try {
      console.log("최종 저장될 데이터:", finalStoryData);

      // 1. 백엔드 저장 API 호출
      const response = await saveStoryApi(finalStoryData);

      // 2. 저장된 스토리 ID 받기
      const savedId = response.storyId; // 백엔드 응답 구조에 따라 수정

      // 3. 디테일 페이지로 이동
      router.push(`/storybook/display/${savedId}`);

    } catch (error) {
      console.error("최종 스토리 저장 실패:", error);
      alert("스토리를 저장하는 데 실패했습니다.");
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * [액션 3] 스토리 ID로 스토리 데이터 불러오기
   */
  async function fetchStory(storyId) {
    isLoading.value = true;
    try {
      const response = await getStoryById(storyId);
      return response;
    } catch (error) {
      console.error("스토리 불러오기 실패:", error);
      alert("스토리를 불러오는 데 실패했습니다.");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    currentStory,
    storyDraft,
    resetCurrentStory,
    uploadImagesToSection,
    removeImageFromSection,
    addSection,
    syncWithPlanData,
    generateStoryDraft,
    saveFinalStory,
    fetchStory,
  };
});
