import { Bold, Italic, Underline } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "@/components/ui/button-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GallerySection } from "@/components/gallery/section";

export function ButtonsSection() {
  return (
    <div className="flex flex-col gap-4">
      <GallerySection title="Button" description="버튼 variant와 상태">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
        <Button disabled>Disabled</Button>
      </GallerySection>

      <GallerySection
        title="Button Group"
        description="버튼을 하나로 묶어 표시"
      >
        <ButtonGroup>
          <Button variant="outline">왼쪽</Button>
          <Button variant="outline">가운데</Button>
          <Button variant="outline">오른쪽</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText>https://</ButtonGroupText>
          <Button variant="outline">example.com</Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button variant="outline" size="icon">
            <Bold className="size-4" />
          </Button>
          <ButtonGroupSeparator />
          <Button variant="outline" size="icon">
            <Italic className="size-4" />
          </Button>
        </ButtonGroup>
      </GallerySection>

      <GallerySection
        title="Toggle / Toggle Group"
        description="눌림 상태를 전환하는 버튼"
      >
        <Toggle aria-label="굵게">
          <Bold className="size-4" />
        </Toggle>
        <ToggleGroup type="multiple" variant="outline">
          <ToggleGroupItem value="bold" aria-label="굵게">
            <Bold className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="기울임">
            <Italic className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="밑줄">
            <Underline className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </GallerySection>

      <GallerySection title="Badge" description="상태 표시용 배지">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
      </GallerySection>

      <GallerySection title="Kbd" description="키보드 단축키 표시">
        <Kbd>Esc</Kbd>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </GallerySection>
    </div>
  );
}
