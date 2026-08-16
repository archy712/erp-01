"use client";

import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** 앞의 `#`을 제거하고 대문자로 정규화한다. 저장 값(`rgb_hex`)은 항상 `#` 없는 6자리 HEX다(Task 023 ⑤ 결정). */
export function normalizeHex(raw: string): string {
  return raw.replace(/^#/, "").toUpperCase();
}

/** 6자리 16진수(0-9, A-F)인지 검사한다. 서버(DB 체크 제약)와 동일한 규칙의 클라이언트 1차 검증. */
export function isValidHex(hex: string): boolean {
  return /^[0-9A-F]{6}$/.test(hex);
}

type ColorSwatchInputProps = {
  id?: string;
  label?: string;
  /** `#` 없는 원본 입력값(미완성 입력 포함) — 저장 형식과 동일하다. */
  value: string;
  onChange: (hex: string) => void;
  error?: string | null;
  disabled?: boolean;
};

// 컬러 관리(Task 036)에서 사용할 HEX 입력 + 실시간 미리보기. `#` 접두사 입력을
// 허용하되 onChange 시점에 즉시 제거해 부모가 항상 정규화된 값만 다루게 한다.
export function ColorSwatchInput({
  id,
  label = "RGB 색상값",
  value,
  onChange,
  error,
  disabled,
}: ColorSwatchInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const valid = isValidHex(value);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex items-center gap-2">
        {/*
         * 스와치 미리보기는 사용자 데이터(등록 중인 컬러) 그 자체를 보여줘야 하므로
         * 인라인 style을 쓴다 — Tailwind 임의값 클래스(`bg-[#...]`)는 동적 값에서
         * 동작하지 않고, CSS 변수 토큰(`--primary` 등)으로는 애초에 표현할 수 없는
         * 값이다. "하드코딩 색상 금지" 규칙의 유일한 예외 지점이다.
         */}
        <span
          className="size-9 shrink-0 rounded-md border"
          style={{ backgroundColor: valid ? `#${value}` : "transparent" }}
          aria-hidden="true"
        />
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            #
          </span>
          <Input
            id={inputId}
            value={value}
            onChange={(event) => onChange(normalizeHex(event.target.value))}
            placeholder="FF5733"
            maxLength={6}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            className="pl-6 uppercase"
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
