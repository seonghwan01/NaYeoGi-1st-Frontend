import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // 세션 쿠키 전송을 위해 필수
});

// 요청 인터셉터: Content-Type 설정 (필요 시)
apiClient.interceptors.request.use(
  (config) => {
    // 모든 POST, PUT 요청에 Content-Type을 설정할 수 있습니다.
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      config.headers['Content-Type'] = 'application/json;charset=utf-8';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
