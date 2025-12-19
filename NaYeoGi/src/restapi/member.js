import axios from 'axios'

// 1. Axios 인스턴스 생성
const local = axios.create({
  baseURL: 'http://localhost:8080/api/v1/members',
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
  withCredentials: true, // 세션 쿠키 전송 허용
})

// 2. API 요청 함수 정의

// 회원가입
async function joinMember(member, success, fail) {
  await local.post(`/join`, member).then(success).catch(fail)
}

// 로그인
async function loginMember(member, success, fail) {
  await local.post(`/login`, member).then(success).catch(fail)
}

// 내 정보 조회
async function getMemberInfo(success, fail) {
  await local.get(`/me`).then(success).catch(fail)
}

// 회원 정보 수정
async function updateMember(member, success, fail) {
  await local.put(`/me`, member).then(success).catch(fail)
}

// 로그아웃
async function logoutMember(success, fail) {
  await local.post(`/logout`).then(success).catch(fail)
}

// 회원 탈퇴
async function deleteMember(success, fail) {
  await local.delete(`/me`).then(success).catch(fail)
}

// 3. 함수 내보내기
export { joinMember, loginMember, getMemberInfo, updateMember, logoutMember, deleteMember }
