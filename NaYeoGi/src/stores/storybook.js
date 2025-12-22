import { defineStore } from 'pinia';
import { ref , reactive} from 'vue';
import { useRouter } from 'vue-router';
// API 통신을 담당할 파일을 임포트합니다.
import { uploadImagesApi, deleteImageApi } from "@/restapi/image";
import { generateAiStoryApi, saveStoryApi, getStoryById, getMyStories } from "@/restapi/storybook";

 export const useStorybookStore = defineStore('storybook', () => {
  const router = useRouter();

  // --- 상태(State) ---
  const isLoading = ref(false);
  const myStories = ref([]); // 내 스토리 목록을 저장할 상태
  const currentStory = reactive({
    planId: null,
    storyTitle: "",
    startDate: "",
    endDate: "",
    companions: [],
    tones: [],
    storyDays: []
  });
  const storyDraft = ref(null);

  // --- 액션(Actions) ---

  function resetCurrentStory() {
    Object.assign(currentStory, {
      planId: "",
      storyTitle: "",
      startDate: "",
      endDate: "",
      companions: [],
      tones: [],
      storyDays: []
    });
  }

  async function uploadImagesToSection(dayIndex, sectionIndex, files) {
    const targetSection = currentStory.storyDays[dayIndex]?.sections[sectionIndex];
    if (!targetSection) return;

    if (!targetSection.imageUrls) {
      targetSection.imageUrls = [];
    }

    const tempFiles = files.map(file => ({
      id: `temp_${Date.now()}_${Math.random()}`,
      url: URL.createObjectURL(file),
      isUploading: true,
      file: file
    }));

    targetSection.imageUrls.push(...tempFiles);

    try {
      const newUrls = await uploadImagesApi(files);
      newUrls.forEach((newUrl, i) => {
        const tempId = tempFiles[i].id;
        const imageIndex = targetSection.imageUrls.findIndex(img => img.id === tempId);
        if (imageIndex > -1) {
          URL.revokeObjectURL(targetSection.imageUrls[imageIndex].url);
          targetSection.imageUrls[imageIndex] = { id: newUrl, url: newUrl, isUploading: false };
        }
      });
    } catch (error) {
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

  async function removeImageFromSection(dayIndex, sectionIndex, imageIndex) {
    const targetSection = currentStory.storyDays[dayIndex]?.sections[sectionIndex];
    const image = targetSection?.imageUrls?.[imageIndex];

    if (!image || image.isDeleting) return;
    image.isDeleting = true;

    try {
      await deleteImageApi(image.url);
      targetSection.imageUrls = targetSection.imageUrls.filter(img => img.id !== image.id);
    } catch (error) {
      console.error("이미지 삭제 실패:", error);
      alert("이미지 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
      image.isDeleting = false;
    }
  }

  function addSection(dayIndex) {
    currentStory.storyDays[dayIndex].sections.push({
      placeName: "",
      weather: "",
      atmosphere: "",
      content: "",
      imageUrls: []
    });
  }

  function calculateDate(startDate, dayOffset) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    return date.toISOString().split('T')[0];
  }

  function syncWithPlanData(plan) {
    if (!plan || !plan.startDate || !plan.endDate || !plan.id) {
      console.error("동기화할 Plan 데이터가 올바르지 않습니다. (id, 날짜 정보 누락)");
      resetCurrentStory();
      return;
    }

    currentStory.planId = plan.id;
    currentStory.storyTitle = `${plan.title}`;
    currentStory.startDate = plan.startDate;
    currentStory.endDate = plan.endDate;
    currentStory.companions = [];
    currentStory.tones = [];

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

    if (plan.details && plan.details.length > 0) {
        plan.details.forEach(detail => {
            const dayIndex = detail.planDate - 1;
            if (dayIndex >= 0 && dayIndex < allDays.length) {
                allDays[dayIndex].sections.push({
                    id: detail.attraction.id,
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
    currentStory.storyDays = allDays;
  }

  async function generateStoryDraft() {
    isLoading.value = true;
    storyDraft.value = null;
    try {
      const payload = JSON.parse(JSON.stringify(currentStory));
      payload.storyDays.forEach(day => {
        day.sections.forEach(section => {
          delete section.id;
          if (section.atmosphere === "") delete section.atmosphere;
          if (section.weather === "") delete section.weather;
        });
      });
      const response = await generateAiStoryApi(payload);
      storyDraft.value = response;
      router.push('/storybook/edit');
    } catch (error) {
      console.error("AI 스토리 생성 실패:", error);
      alert("AI가 글을 쓰는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      isLoading.value = false;
    }
  }

  async function saveFinalStory(finalStoryData) {
    isLoading.value = true;
    try {
      const response = await saveStoryApi(finalStoryData);
      const savedId = response.storyId;
      router.push(`/storybook/display/${savedId}`);
    } catch (error) {
      console.error("최종 스토리 저장 실패:", error);
      alert("스토리를 저장하는 데 실패했습니다.");
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchStory(storyId) {
    isLoading.value = true;
    try {
      const storyData = await getStoryById(storyId);
      return storyData;
    } catch (error) {
      console.error("스토리 불러오기 실패:", error);
      alert("스토리를 불러오는 데 실패했습니다.");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMyStories() {
    isLoading.value = true;
    try {
      const stories = await getMyStories();
      myStories.value = stories;
    } catch (error) {
      console.error("내 스토리 목록 조회 실패:", error);
      alert("스토리 목록을 불러오는 데 실패했습니다.");
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    myStories,
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
    fetchMyStories,
  };
});
