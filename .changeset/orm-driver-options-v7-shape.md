---
'@yunhak/nestjs-kit': patch
---

fix(orm): `driverOptions`의 v6(knex)식 `connection` 중첩 제거 — v7(kysely) 호환.

MikroORM v7은 `driverOptions`를 pg `Pool` 설정에 그대로 스프레드하는데, v6식으로
`driverOptions.connection`을 중첩하면 pg가 `connection` 키를 주입된 Connection
인스턴스로 오인해 첫 쿼리에서 `TypeError: con.connect is not a function`으로 터진다.
`statement_timeout`을 `driverOptions` 최상위로 이동. 소비처 설정 DTO
(`OrmDriverOptions.connection.statementTimeout`)는 그대로라 사용 측 변경 없음.
