/**
 * Monitoring 모듈 Zod 입력 스키마
 */

import { z } from "zod";

export const serverIdSchema = z.object({
  serverId: z.string().min(1, "serverId는 필수입니다"),
});

export const serverCompareSchema = z.object({
  serverIds: z.string().optional(), // 쉼표 구분 서버 ID 목록
});
