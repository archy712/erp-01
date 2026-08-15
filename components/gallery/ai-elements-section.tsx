import { FileTextIcon, ImageIcon } from "lucide-react";

import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent, BubbleGroup } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageGroup,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { GallerySection } from "@/components/gallery/section";

export function AiElementsSection() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Message, Bubble, Marker, Attachment, MessageScroller는 shadcn/ui 공식
        레지스트리에 포함된 AI 채팅 프리미티브입니다. 챗봇 UI를 만들 때 조합해서
        사용합니다.
      </p>

      <GallerySection title="Message / Bubble" description="채팅 말풍선">
        <MessageGroup className="w-full max-w-md">
          <Message align="start">
            <MessageAvatar>
              <Avatar>
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <BubbleGroup>
                <Bubble variant="muted">
                  <BubbleContent>
                    안녕하세요! 무엇을 도와드릴까요?
                  </BubbleContent>
                </Bubble>
              </BubbleGroup>
            </MessageContent>
          </Message>
          <Message align="end">
            <MessageContent>
              <BubbleGroup>
                <Bubble variant="default">
                  <BubbleContent>갤러리 페이지를 만들어줘.</BubbleContent>
                </Bubble>
              </BubbleGroup>
            </MessageContent>
          </Message>
        </MessageGroup>
      </GallerySection>

      <GallerySection title="Marker" description="채팅 내 메타 정보 구분선">
        <div className="flex w-full max-w-md flex-col gap-2">
          <Marker variant="separator">
            <MarkerContent>오늘</MarkerContent>
          </Marker>
          <Marker>
            <MarkerContent>오후 3:24 · 읽음</MarkerContent>
          </Marker>
        </div>
      </GallerySection>

      <GallerySection title="Attachment" description="파일 첨부 카드">
        <Attachment orientation="horizontal">
          <AttachmentMedia variant="icon">
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>starter-kit-소개.pdf</AttachmentTitle>
            <AttachmentDescription>1.2MB</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
        <Attachment orientation="horizontal" state="error">
          <AttachmentMedia variant="icon">
            <ImageIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>업로드 실패</AttachmentTitle>
            <AttachmentDescription>다시 시도해주세요</AttachmentDescription>
          </AttachmentContent>
        </Attachment>
      </GallerySection>

      <GallerySection
        title="Message Scroller"
        description="자동 스크롤/하단 이동 버튼이 있는 채팅 스크롤 영역"
        contentClassName="h-64 w-full p-0"
      >
        <MessageScrollerProvider>
          <MessageScroller className="h-64 rounded-lg border">
            <MessageScrollerViewport>
              <MessageScrollerContent className="p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <MessageScrollerItem key={i}>
                    <Message align={i % 2 === 0 ? "start" : "end"}>
                      <MessageContent>
                        <BubbleGroup>
                          <Bubble variant={i % 2 === 0 ? "muted" : "default"}>
                            <BubbleContent>메시지 {i + 1}</BubbleContent>
                          </Bubble>
                        </BubbleGroup>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </GallerySection>
    </div>
  );
}
