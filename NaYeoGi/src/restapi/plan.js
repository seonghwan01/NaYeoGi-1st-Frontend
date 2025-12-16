export async function requestCreatePlan(requestBody) {
  const response = await fetch('/api/v1/plans', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error('여행 계획 저장에 실패했습니다.')
  }

  return response.json()
}
