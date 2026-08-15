"use client";

import * as React from "react";
import { CreditCardIcon, SearchIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { GallerySection } from "@/components/gallery/section";

const FRAMEWORKS = ["Next.js", "Remix", "Astro", "SvelteKit", "Nuxt.js"];

export function FormsSection() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [framework, setFramework] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <GallerySection
        title="기본 입력"
        description="Input, Textarea, Label, Input Group"
        contentClassName="grid w-full gap-6 sm:grid-cols-2"
      >
        <div className="grid gap-2">
          <Label htmlFor="gallery-input">Input</Label>
          <Input id="gallery-input" placeholder="m@example.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gallery-textarea">Textarea</Label>
          <Textarea id="gallery-textarea" placeholder="메시지를 입력하세요" />
        </div>
        <div className="grid gap-2">
          <Label>Input Group</Label>
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput placeholder="검색어를 입력하세요" />
          </InputGroup>
        </div>
        <div className="grid gap-2">
          <Label>Input Group (텍스트 addon)</Label>
          <InputGroup>
            <InputGroupInput placeholder="0.00" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>KRW</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </GallerySection>

      <GallerySection
        title="선택 입력"
        description="Checkbox, RadioGroup, Select, NativeSelect, Switch, Slider"
        contentClassName="grid w-full gap-6 sm:grid-cols-2"
      >
        <div className="flex items-center gap-2">
          <Checkbox id="gallery-checkbox" />
          <Label htmlFor="gallery-checkbox" className="font-normal">
            Checkbox
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="gallery-switch" />
          <Label htmlFor="gallery-switch" className="font-normal">
            Switch
          </Label>
        </div>
        <div className="grid gap-2">
          <Label>Radio Group</Label>
          <RadioGroup defaultValue="light" className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="light" id="r-light" />
              <Label htmlFor="r-light" className="font-normal">
                Light
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="dark" id="r-dark" />
              <Label htmlFor="r-dark" className="font-normal">
                Dark
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid gap-2">
          <Label>Select</Label>
          <Select defaultValue="next">
            <SelectTrigger>
              <SelectValue placeholder="프레임워크 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next">Next.js</SelectItem>
              <SelectItem value="remix">Remix</SelectItem>
              <SelectItem value="astro">Astro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Native Select</Label>
          <NativeSelect defaultValue="next">
            <NativeSelectOption value="next">Next.js</NativeSelectOption>
            <NativeSelectOption value="remix">Remix</NativeSelectOption>
            <NativeSelectOption value="astro">Astro</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="grid gap-2 sm:col-span-2">
          <Label>Slider</Label>
          <Slider defaultValue={[50]} max={100} step={1} />
        </div>
      </GallerySection>

      <GallerySection
        title="Combobox"
        description="base-ui 기반 자동완성 콤보박스"
      >
        <div className="w-64">
          <Combobox
            items={FRAMEWORKS}
            value={framework}
            onValueChange={setFramework}
          >
            <ComboboxInput placeholder="프레임워크 검색..." />
            <ComboboxContent>
              <ComboboxEmpty>결과가 없습니다.</ComboboxEmpty>
              <ComboboxList>
                {(item: string) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </GallerySection>

      <GallerySection title="Input OTP" description="일회용 인증번호 입력">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </GallerySection>

      <GallerySection title="Calendar" description="날짜 선택">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </GallerySection>

      <GallerySection
        title="Field"
        description="폼 레이아웃을 위한 Field / FieldSet 컴포지션"
      >
        <FieldSet className="w-full max-w-md">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="field-card">카드 번호</FieldLabel>
              <FieldContent>
                <InputGroup>
                  <InputGroupAddon>
                    <CreditCardIcon className="size-4" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="field-card"
                    placeholder="0000 0000 0000 0000"
                  />
                </InputGroup>
                <FieldDescription>
                  카드 앞면에 표시된 번호를 입력하세요.
                </FieldDescription>
              </FieldContent>
            </Field>
            <FieldSeparator />
            <Field orientation="horizontal">
              <FieldLabel htmlFor="field-marketing" className="font-normal">
                마케팅 정보 수신에 동의합니다
              </FieldLabel>
              <Checkbox id="field-marketing" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </GallerySection>
    </div>
  );
}
