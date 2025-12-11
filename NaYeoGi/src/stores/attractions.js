import { ref } from 'vue'
import { defineStore } from 'pinia'
import { requestSurveyOptions, requestAttractionRecommendation } from '@/restapi/attraction'

const DEFAULT_REGIONS = [
  '서울',
  '인천',
  '대전',
  '대구',
  '광주',
  '부산',
  '울산',
  '세종특별자치시',
  '경기도',
  '강원특별자치도',
  '충청북도',
  '충청남도',
  '경상북도',
  '경상남도',
  '전북특별자치도',
  '전라남도',
  '제주도'
]

export const useAttractionStore = defineStore('attraction', () => {
  const regions = ref(DEFAULT_REGIONS)
  const topics = ref([])
  const topicError = ref(null)

  const selectedRegion = ref(null)
  const selectedTopics = ref([])

  const selectRegion = (region) => {
    selectedRegion.value = region
  }

  const toggleTopic = (topicId) => {
    if (selectedTopics.value.includes(topicId)) {
      selectedTopics.value = selectedTopics.value.filter((item) => item !== topicId)
      return
    }

    selectedTopics.value = [...selectedTopics.value, topicId]
  }

  const loadTopics = async () => {
    topicError.value = null

    try {
      const data = await requestSurveyOptions()
      topics.value = data.map((item) => ({
        id: item.id,
        question: item.question
      }))
    } catch (error) {
      console.error(error)
      topicError.value = '설문 옵션을 불러오지 못했습니다.'
      topics.value = []
    }
  }

  const recommendAttraction = async () => {
    const requestBody = {
      area: selectedRegion.value,
      topics: selectedTopics.value
    }

    return requestAttractionRecommendation(requestBody)
  }

  return {
    loadTopics,
    regions,
    selectedRegion,
    selectRegion,
    selectedTopics,
    recommendAttraction,
    toggleTopic,
    topicError,
    topics
  }
})
