import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// API 통신을 담당할 파일을 임포트합니다. (다음 단계에서 생성)
import * as storybookApi from '@/restapi/storybook';

export const useStorybookStore = defineStore('storybook', () => {
  const router = useRouter();

  // UI 로딩 상태를 관리합니다. (예: 스피너 표시)
  const isLoading = ref(false);
  // AI가 생성한 초안(수정 전 데이터)을 임시로 저장합니다.
  const storyDraft = ref(null);

  /**
   * [액션 1] AI 스토리 초안 생성
   * - StoryBookCreateView에서 사용자가 입력한 정보를 받아 AI 서버에 전송하고,
   *   결과(초안)를 받아 storyDraft 상태에 저장한 뒤 수정 페이지로 이동합니다.
   * @param {object} storyPayload - 제목, 사진, 메모, 태그 등 사용자가 입력한 모든 정보
   */
  async function generateStoryDraft(storyPayload) {
    isLoading.value = true;
    storyDraft.value = null;
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // --- 가상의 HTML 콘텐츠 생성 ---
      let dummyHtml = `<h1>${storyPayload.storyTitle || '나의 특별한 여행 이야기'}</h1>`;

      storyPayload.storyDays.forEach(day => {
        dummyHtml += `<h2>Day ${day.dayNum}: ${day.date}</h2>`;
        if (day.sections.length === 0) {
          dummyHtml += `<p>이 날은 특별한 활동 없이 휴식을 취했습니다.</p>`;
        } else {
          day.sections.forEach(section => {
            dummyHtml += `<p>${section.placeName}에 방문했습니다. ${section.memo || '특별한 메모와 함께한 즐거운 시간이었습니다.'}</p>`;
            if (section.images && section.images.length > 0) {
              // 실제로는 업로드된 이미지 URL을 사용해야 합니다.
              dummyHtml += `<p><img src="https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80" alt="${section.placeName} 이미지"></p>`;
            }
          });
        }
      });
      // -------------------------------------------

      storyDraft.value = {
        title: storyPayload.storyTitle,
        content: dummyHtml, // 생성된 HTML 문자열을 content로 저장
      };

      router.push('/storybook/edit');

    } catch (error) {
      console.error("AI 스토리 초안 생성 실패:", error);
      alert("스토리 초안을 만드는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * [액션 2] 최종 스토리 저장
   * - StoryBookEditView에서 사용자가 수정을 마친 최종 데이터를 받아 서버에 영구 저장합니다.
   * @param {object} finalStoryData - 사용자가 수정한 최종 제목, HTML 본문 등
   */
  async function saveFinalStory(finalStoryData) {
    isLoading.value = true;
    try {
      // finalStoryData는 이제 { title: '...', content: '...' } 형태입니다.
      console.log("최종 저장될 데이터:", finalStoryData);

      await new Promise(resolve => setTimeout(resolve, 1000));
      const dummyId = Date.now();
      const response = { data: { storyId: dummyId } };

      const finalStoryId = response.data.storyId;

      storyDraft.value = null;
      router.push(`/storybook/view/${finalStoryId}`);

    } catch (error) {
      console.error("최종 스토리 저장 실패:", error);
      alert("스토리를 저장하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    storyDraft,
    generateStoryDraft,
    saveFinalStory,
  };
});
