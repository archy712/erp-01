/** @type {import("lint-staged").Configuration} */
const config = {
  // JS/TS(설정 파일용 mjs/cjs 포함): 코드 품질(eslint) 정리 후 포맷(prettier) 적용 — 같은 파일을 다루므로 반드시 순차 실행
  "*.{js,jsx,mjs,cjs,ts,tsx}": ["eslint --fix", "prettier --write"],
  // 스타일/설정/문서 파일: 포맷만 적용
  "*.{json,css,md,mdx}": ["prettier --write"],
  // 타입 체크: tsc는 개별 파일 인자를 넘기면 tsconfig.json을 무시하므로
  // 함수 형태로 넘겨 프로젝트 전체 기준으로 한 번만 실행
  "*.{ts,tsx}": () => "tsc --noEmit",
};

export default config;
