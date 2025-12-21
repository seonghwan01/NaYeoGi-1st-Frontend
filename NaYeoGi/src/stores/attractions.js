import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  requestSurveyOptions,
  requestRecommendationsByContentTypes
} from '@/restapi/attraction'

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

const CATEGORY_LABELS = {
  12: '관광지',
  39: '식당',
  14: '문화시설',
  15: '축제/공연/행사',
  25: '축제/공연/행사',
  28: '레포츠',
  32: '숙박',
  38: '쇼핑'
}

const TABS = [
  { key: 'attraction', label: '관광지', types: [12] },
  { key: 'food', label: '식당', types: [39] },
  { key: 'culture', label: '문화시설', types: [14] },
  { key: 'festival', label: '축제/공연/행사', types: [15, 25] },
  { key: 'leisure', label: '레포츠', types: [28] },
  { key: 'stay', label: '숙박', types: [32] },
  { key: 'shopping', label: '쇼핑', types: [38] }
]

const DEFAULT_TAB_KEY = TABS[0].key

export const useAttractionStore = defineStore('attraction', () => {
  const regions = ref(DEFAULT_REGIONS)
  const topics = ref([])
  const topicError = ref(null)

  const selectedRegion = ref(null)
  const selectedTopics = ref([])
  const recommendations = ref([])
  const recommendationError = ref(null)
  const isRecommending = ref(false)
  const selectedAttractions = ref([])
  const selectedId = ref(null)
  const activeTab = ref(DEFAULT_TAB_KEY)

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

  const resolveCategoryLabel = (typeId) => CATEGORY_LABELS[Number(typeId)] ?? '기타'

  const removeSelection = (id) => {
    selectedAttractions.value = selectedAttractions.value.filter((item) => item.id !== id)
  }

  const isSelected = (id) => selectedAttractions.value.some((item) => item.id === id)

  const toggleSelection = (attraction) => {
    if (isSelected(attraction.id)) {
      removeSelection(attraction.id)
      return
    }
    selectedAttractions.value = [...selectedAttractions.value, attraction]
  }

  const clearSelections = () => {
    selectedAttractions.value = []
  }

  const setSelectedId = (id) => {
    selectedId.value = id
  }

  const getContentTypesByTab = (key) => {
    const tab = TABS.find((item) => item.key === key)
    return tab?.types ?? []
  }

  const setActiveTab = (key) => {
    const hasTab = TABS.some((tab) => tab.key === key)
    activeTab.value = hasTab ? key : DEFAULT_TAB_KEY
    selectedId.value = null
  }

  const ensureSurveyReady = () => {
    if (!selectedRegion.value) {
      throw new Error('지역을 선택해주세요.')
    }
    if (!selectedTopics.value.length) {
      throw new Error('선호 토픽을 선택해주세요.')
    }
  }

  const sortedAttractions = computed(() => {
    return [...recommendations.value].sort((a, b) => (b.cal_score ?? 0) - (a.cal_score ?? 0))
  })

  const displayedAttractions = computed(() => {
    const current = TABS.find((tab) => tab.key === activeTab.value)
    if (!current) return sortedAttractions.value
    return sortedAttractions.value.filter((item) => current.types.includes(Number(item.content_type_id)))
  })

  const fetchRecommendationsForTab = async ({ tabKey, resetSelections = false } = {}) => {
    recommendationError.value = null
    isRecommending.value = true

    const targetTabKey = tabKey ?? activeTab.value ?? DEFAULT_TAB_KEY
    const contentTypeIds = getContentTypesByTab(targetTabKey)
    if (!contentTypeIds.length) {
      recommendationError.value = '선택한 탭에 맞는 콘텐츠 타입이 없습니다.'
      isRecommending.value = false
      return []
    }

    try {
      ensureSurveyReady()

      const merged = await requestRecommendationsByContentTypes({
        area: selectedRegion.value,
        surveyIds: selectedTopics.value,
        contentTypeIds
      })

      const sorted = merged.sort((a, b) => (b.cal_score ?? 0) - (a.cal_score ?? 0))

      recommendations.value = sorted
      setActiveTab(targetTabKey)
      selectedId.value = null

      if (resetSelections) {
        clearSelections()
      }

      return sorted
    } catch (error) {
      console.error(error)
      recommendationError.value = '추천을 불러오지 못했습니다.'
      throw error
    } finally {
      isRecommending.value = false
    }
  }

  // 호환성: 기존 이름 유지
  const recommendAttraction = (options) => fetchRecommendationsForTab(options)

  return {
    loadTopics,
    regions,
    selectedRegion,
    selectRegion,
    selectedTopics,
    fetchRecommendationsForTab,
    recommendAttraction,
    recommendations,
    recommendationError,
    isRecommending,
    toggleTopic,
    topicError,
    topics,
    tabs: TABS,
    activeTab,
    setActiveTab,
    displayedAttractions,
    sortedAttractions,
    selectedAttractions,
    selectedId,
    setSelectedId,
    isSelected,
    toggleSelection,
    removeSelection,
    clearSelections,
    resolveCategoryLabel
  }
})
