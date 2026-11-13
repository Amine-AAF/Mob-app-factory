/*
 * Jest setup. FilePilot's engine is tested against real encoders (pure-JS JPEG/PNG,
 * pdf-lib) and an in-memory filesystem; native modules resolve to `null` under Jest
 * (requireOptionalNativeModule), which exercises the graceful-degradation paths.
 */
export {};
