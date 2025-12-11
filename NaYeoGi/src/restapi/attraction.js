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
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${KAKAO_APP_KEY}`
    script.async = true
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao))
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}
