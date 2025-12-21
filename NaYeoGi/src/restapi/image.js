import axios from "axios";

// Axios 인스턴스 (기본 설정)
const api = axios.create({
  baseURL: "http://localhost:8080/api/v1/files", // 백엔드 서버 주소
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * [POST] /api/v1/files
 * 이미지를 S3에 업로드하고 URL 리스트를 반환합니다.
 */
export const uploadImagesApi = async (files) => {
  const formData = new FormData();

  // 백엔드 @RequestPart("files")와 이름이 정확히 일치해야 함
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // 필수 헤더
      },
    });
    // 백엔드 응답 구조: ApiResponse(success, data: { imageUrls: [...] }, message)
    return response.data.data.imageUrls;
  } catch (error) {
    console.error("이미지 업로드 API 오류:", error);
    throw error;
  }
};

/**
 * [DELETE] /api/v1/files
 * S3에 저장된 이미지를 URL 기반으로 삭제합니다.
 */
export const deleteImageApi = async (imageUrl) => {
  try {
    // 백엔드 @RequestParam("imageUrl")과 이름 일치
    await api.delete("", {
      params: { imageUrl: imageUrl },
    });
  } catch (error) {
    console.error("이미지 삭제 API 오류:", error);
    throw error;
  }
};
