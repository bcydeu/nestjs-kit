export interface SlackMessage {
  /** 메시지 본문 텍스트. blocks를 함께 쓰더라도 알림 fallback 용도로 권장된다. */
  text: string;
  /** Block Kit 블록(선택). 지정 시 리치 레이아웃으로 렌더된다. */
  blocks?: unknown[];
  /** attachments(선택). 에러 알림의 color 심각도 바 등에 사용된다. */
  attachments?: unknown[];
  /** 전송 채널 override. Incoming Webhook 설정이 허용할 때만 반영된다. */
  channel?: string;
  /** 표시 이름 override. */
  username?: string;
  /** 아이콘 이모지 override (예: ':rocket:'). */
  iconEmoji?: string;
}

/** 에러 알림 심각도. attachment color 바와 헤더 이모지에 매핑된다. */
export type SlackErrorLevel = 'warn' | 'error' | 'fatal';

export interface SlackErrorOptions {
  /** 심각도(기본: 'error'). warn=노랑, error=빨강, fatal=진한 빨강. */
  level?: SlackErrorLevel;
  /** 알림 제목 override (기본: error.name 또는 'Error'). */
  title?: string;
  /** 요청 경로·userId 등 추가 컨텍스트. key-value 목록으로 첨부된다. */
  context?: Record<string, unknown>;
  /** 전송 채널 override. */
  channel?: string;
}
