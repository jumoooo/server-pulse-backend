/**
 * 공통 API 응답 래퍼 타입
 * 모든 엔드포인트는 이 형식으로 응답
 */

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiError = {
  ok: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** 응답 생성 헬퍼 */
export const respond = {
  ok: <T>(data: T): ApiSuccess<T> => ({ ok: true, data }),
  err: (error: string): ApiError => ({ ok: false, error }),
};
