/** @type {import("@commitlint/types").UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  // .claude/commands/git/commit.md의 "<이모지> <타입>: <설명>" 포맷 허용
  // (컨벤셔널 타입 앞에 이모지가 와도 통과하도록 헤더 패턴을 재정의)
  parserPreset: {
    parserOpts: {
      headerPattern: new RegExp(
        "^(?:[\\p{Extended_Pictographic}\\u200d\\ufe0f]+\\s+)?(\\w*)(?:\\((.*)\\))?!?: (.*)$",
        "u",
      ),
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "ci",
        "build",
        "revert",
      ],
    ],
    "subject-case": [0],
  },
};

export default config;
