---
'@yunhak/nestjs-kit': patch
---

`AppException`의 `uiMessage` 파라미터를 `UiMessages | (string & {})`로 완화. 표준 `UiMessages` 9개의 자동완성 힌트는 유지하면서, 도메인 정의 문구도 `as UiMessages` 캐스트 없이 받을 수 있다. 입력 지점(`AppException`)만 넓히고 전역 필터·Swagger 데코레이터는 표준 9개에 의존하므로 그대로 둠.
