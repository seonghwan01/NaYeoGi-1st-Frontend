import apiClient from './common'

// 2. API 요청 함수 정의

// 회원가입
async function joinMember(member, success, fail) {
  await apiClient.post(`/members/join`, member).then(success).catch(fail)
}

// 로그인
async function loginMember(member, success, fail) {
  await apiClient.post(`/members/login`, member).then(success).catch(fail)
}

// 내 정보 조회
async function getMemberInfo(success, fail) {
  await apiClient.get(`/members/me`).then(success).catch(fail)
}

// 회원 정보 수정
async function updateMember(member, success, fail) {
  await apiClient.put(`/members/me`, member).then(success).catch(fail)
}

// 로그아웃
async function logoutMember(success, fail) {
  await apiClient.post(`/members/logout`).then(success).catch(fail)
}

// 회원 탈퇴
async function deleteMember(success, fail) {
  await apiClient.delete(`/members/me`).then(success).catch(fail)
}

// 3. 함수 내보내기
export { joinMember, loginMember, getMemberInfo, updateMember, logoutMember, deleteMember }
