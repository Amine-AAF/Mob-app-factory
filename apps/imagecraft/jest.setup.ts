/*
 * Jest setup. The native image module resolves to `null` under Jest
 * (requireOptionalNativeModule), which exercises the graceful-degradation paths;
 * pipeline tests inject a fake renderer instead.
 */
export {};
