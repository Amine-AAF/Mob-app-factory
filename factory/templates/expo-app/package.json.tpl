{
  "name": "__APP_ID__",
  "version": "0.1.0",
  "private": true,
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start --dev-client",
    "android": "expo run:android",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:ci": "jest --ci --coverage"
  },
  "dependencies": __DEPENDENCIES__,
  "devDependencies": __DEV_DEPENDENCIES__
}
