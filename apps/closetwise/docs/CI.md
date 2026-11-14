# ClosetWise — CI/CD integration (pending shared change)

`.gitlab-ci.yml` is a shared root file (see `factory/documentation/parallel-development.md` §3), so this
session did **not** modify it. To wire ClosetWise into CI, a factory-core change should add, following the
existing per-app jobs:

```yaml
closetwise:validate:
  extends: .app-validate          # same template as the other apps
  variables: { APP: closetwise }
  rules:
    - changes: [apps/closetwise/**/*, packages/**/*]

closetwise:build-preview:
  extends: .eas-build
  variables: { APP: closetwise, PROFILE: preview }
  rules:
    - if: '$CI_COMMIT_TAG =~ /^closetwise-v\d+\.\d+\.\d+$/'
      when: manual
```

Protected variables to create: `CLOSETWISE_EAS_PROJECT_ID`, `CLOSETWISE_ADMOB_ANDROID_APP_ID`,
`CLOSETWISE_EXPO_PUBLIC_ADMOB_BANNER_ID`, `CLOSETWISE_EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`,
`CLOSETWISE_EXPO_PUBLIC_PRIVACY_URL`, `CLOSETWISE_EXPO_PUBLIC_TERMS_URL`.
Play submission stays manual (`submit-play-internal` approval).

Local equivalent of the validate job:

```bash
pnpm --filter closetwise typecheck && pnpm --filter closetwise test && pnpm registry:check
```
