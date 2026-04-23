import { createUseClassProvider } from '../..';

describe('ProviderUtil Unit Test', () => {
  describe('createUseClassProvider()', () => {
    it('useClass로 구성된 nestjs provider 생성 확인', () => {
      // gvien
      class TestProviderService {}
      const providerToken = Symbol(TestProviderService.name);

      // when
      const provider = createUseClassProvider(
        providerToken,
        TestProviderService,
      );

      // then
      expect(provider).toStrictEqual({
        provide: providerToken,
        useClass: TestProviderService,
      });
    });
  });
});
