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
  console.log(requestBody)
  return response.json()
}
