"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ScopeSelectorOption = { id: string; name: string };

export type ScopeSelectorLevel = {
  /** React key + <SelectTrigger id="scope-{key}">에 쓰는 안정적인 식별자(예: "company"). */
  key: string;
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  options: ScopeSelectorOption[];
  placeholder?: string;
  disabled?: boolean;
};

type ScopeSelectorProps = {
  levels: ScopeSelectorLevel[];
  className?: string;
};

// PRD_MASTER.md 7.3절의 "법인 → 브랜드 → 소브랜드 3단 캐스케이드"를 위해
// 만들었지만, Task 039(상품 등록 폼의 6단 캐스케이드)에서도 그대로 재사용할
// 수 있도록 레벨 개수/데이터를 하드코딩하지 않는다. 각 레벨의 옵션 조회·상위
// 변경 시 하위 초기화 같은 "캐스케이드 로직"은 이 컴포넌트가 갖지 않고,
// 화면(호출부)이 URL 쿼리 등 자신의 선택 상태를 소유한 채 levels 배열로
// 조합해 넘긴다 — 이 컴포넌트는 옵션을 넘겨받아 렌더링만 하는 순수 컨트롤드
// 프리젠테이션 컴포넌트다(MasterTreePanel과 동일한 책임 분리 원칙).
export function ScopeSelector({ levels, className }: ScopeSelectorProps) {
  return (
    <div
      className={
        className ?? "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
      }
    >
      {levels.map((level) => {
        const triggerId = `scope-selector-${level.key}`;
        return (
          <div key={level.key} className="flex flex-col gap-1.5 sm:w-52">
            <Label htmlFor={triggerId}>{level.label}</Label>
            <Select
              // value가 처음부터 문자열이든(선택됨) 빈 문자열이든(미선택) 항상
              // 정의된 값으로 넘겨 Radix Select를 처음부터 끝까지 컨트롤드로
              // 유지한다. undefined를 넘기면 마운트 시 "uncontrolled"로
              // 시작했다가 상위 스코프 선택 후 문자열 value로 바뀌는 순간
              // "A component is changing from uncontrolled to controlled"
              // 경고가 뜬다(Radix는 value=""를 "선택 없음"으로 예약해 placeholder를
              // 그대로 보여주므로 동작에는 차이가 없다).
              value={level.value ?? ""}
              onValueChange={level.onChange}
              disabled={level.disabled || level.options.length === 0}
            >
              <SelectTrigger id={triggerId} className="w-full">
                <SelectValue
                  placeholder={level.placeholder ?? `${level.label} 선택`}
                />
              </SelectTrigger>
              <SelectContent>
                {level.options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      })}
    </div>
  );
}
