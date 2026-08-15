"use client";

// Bar/Line 콤보 차트에서 Line의 값 라벨이 뒤에 있는 Bar와 겹치면 색상 대비가
// 깨져 읽기 어려워진다. 값 뒤에 작은 배경 필(pill)을 깔아 어떤 배경 위에서도
// 읽히게 하는 LabelList content 렌더러.
export function ChartPillLabel(props: {
  x?: string | number;
  y?: string | number;
  value?: unknown;
  valueFormatter?: (value: string | number) => string;
  /** 값 지점 위로 라벨을 띄우는 높이(px). 같은 지점에 두 시리즈의 라벨이
   * 겹칠 수 있는 콤보 차트에서, 시리즈마다 다른 값을 줘 서로 다른 "레인"에
   * 배치되게 한다. */
  liftY?: number;
  /** 데이터 포인트가 많은 차트는 좁은 모바일 화면에서 라벨이 서로
   * 겹치므로, sm 이상에서만 라벨을 표시한다. */
  hideBelowSm?: boolean;
}) {
  const cx = Number(props.x ?? 0);
  const cy = Number(props.y ?? 0);
  const liftY = props.liftY ?? 24;
  const rawValue =
    typeof props.value === "string" || typeof props.value === "number"
      ? props.value
      : "";
  const text = props.valueFormatter
    ? props.valueFormatter(rawValue)
    : String(rawValue);
  const width = Math.max(28, text.length * 6.5 + 10);

  return (
    <g className={props.hideBelowSm ? "hidden sm:block" : undefined}>
      <rect
        x={cx - width / 2}
        y={cy - liftY - 8}
        width={width}
        height={16}
        rx={8}
        className="fill-background stroke-border"
        strokeWidth={1}
      />
      <text
        x={cx}
        y={cy - liftY}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground text-[10px] font-medium"
      >
        {text}
      </text>
    </g>
  );
}
