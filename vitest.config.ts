import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // jest API(describe/it/expect/vi)를 전역으로 노출 — 기존 spec 호환.
    globals: true,
    environment: 'node',
    // 데코레이터 메타데이터 등록을 위해 테스트 시작 전 reflect-metadata 로드.
    setupFiles: ['reflect-metadata'],
    include: ['src/**/*.spec.ts'],
  },
  plugins: [
    // NestJS/MikroORM/class-validator는 emitDecoratorMetadata에 의존한다.
    // vitest 기본 트랜스포머(esbuild)는 이를 지원하지 않으므로 swc로 트랜스폼해
    // 데코레이터 메타데이터를 emit한다(이 레포가 tsup→tsc로 회귀한 것과 같은 이유).
    swc.vite(),
  ],
});
