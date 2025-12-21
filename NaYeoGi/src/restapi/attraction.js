const KAKAO_APP_KEY = 'f86da0bef8df692b59dbec85eb51b4f4'
const MAP_SCRIPT_ID = 'kakao-map-sdk'

export async function requestSurveyOptions() {
  const response = await fetch(`/api/v1/surveys`)

  if (!response.ok) {
    throw new Error('설문 옵션을 불러오는데 실패했습니다')
  }

  return response.json()
}

export async function requestAttractionRecommendation(requestBody) {
  const response = await fetch(`/api/v1/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error('추천 요청에 실패했습니다')
  }
  return response.json()
}

export async function requestRecommendationsByContentTypes({ area, surveyIds, contentTypeIds }) {
  if (!Array.isArray(contentTypeIds) || contentTypeIds.length === 0) {
    throw new Error('요청할 콘텐츠 타입이 없습니다.')
  }

  const results = await Promise.all(
    contentTypeIds.map((contentTypeId) =>
      requestAttractionRecommendation({
        area,
        surveyIds,
        contentTypeId
      })
    )
  )

  return results.flatMap((item) => (Array.isArray(item) ? item : []))
}

export async function requestAttractions({ title, contentTypeIds } = {}) {
  const params = new URLSearchParams()

  if (title) {
    params.append('title', title)
  }

  if (Array.isArray(contentTypeIds)) {
    contentTypeIds.forEach((id) => params.append('contentTypeId', id))
  }

  const query = params.toString()
  const response = await fetch(`/api/v1/attractions${query ? `?${query}` : ''}`)

  if (!response.ok) {
    throw new Error('여행지를 불러오지 못했습니다.')
  }

  return response.json()
}

export async function requestCurrentMember() {
  const response = await fetch('/api/v1/members/me', {
    credentials: 'include',
  })

  if (!response.ok) {
    const error = new Error('현재 사용자 정보를 불러오지 못했습니다.')
    error.status = response.status
    throw error
  }

  return response.json()
}

export const loadKakaoMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve(window.kakao)
      return
    }

    const existing = document.getElementById(MAP_SCRIPT_ID)
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(() => resolve(window.kakao)), { once: true })
      existing.addEventListener('error', (err) => reject(err), { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = MAP_SCRIPT_ID
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&libraries=clusterer&appkey=${KAKAO_APP_KEY}`
    script.async = true
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}
