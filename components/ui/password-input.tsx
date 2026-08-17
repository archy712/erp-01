"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

// 로그인/회원가입 등 인증 폼의 비밀번호 입력란에서 공통으로 쓰는, 평문 표시
// 토글 버튼이 달린 입력 컴포넌트. shadcn 레지스트리에 없어 InputGroup 프리미티브
// 조합으로 직접 구현했다(다른 components/ui/ 확장 컴포넌트와 동일한 배치).
function PasswordInput({
  className,
  showLabel,
  hideLabel,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "type"> & {
  showLabel: string;
  hideLabel: string;
}) {
  const [visible, setVisible] = React.useState(false);

  return (
    <InputGroup className={className}>
      <InputGroupInput type={visible ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          variant="ghost"
          tabIndex={-1}
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { PasswordInput };
