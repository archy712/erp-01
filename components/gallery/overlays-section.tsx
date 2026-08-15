import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GallerySection } from "@/components/gallery/section";

export function OverlaysSection() {
  return (
    <div className="flex flex-col gap-4">
      <GallerySection title="Dialog" description="모달 대화상자">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">다이얼로그 열기</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>다이얼로그 예시</DialogTitle>
              <DialogDescription>
                shadcn/ui Dialog 컴포넌트 데모입니다.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button>확인</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </GallerySection>

      <GallerySection title="Alert Dialog" description="파괴적인 작업 확인">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">계정 삭제</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>정말 삭제하시겠어요?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction>삭제</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </GallerySection>

      <GallerySection
        title="Sheet"
        description="화면 가장자리에서 밀려나오는 패널"
      >
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">시트 열기</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Sheet 예시</SheetTitle>
              <SheetDescription>
                오른쪽에서 슬라이드되어 나타나는 패널입니다.
              </SheetDescription>
            </SheetHeader>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">닫기</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </GallerySection>

      <GallerySection
        title="Drawer"
        description="모바일 친화적 하단 패널 (vaul)"
      >
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">드로어 열기</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Drawer 예시</DrawerTitle>
              <DrawerDescription>
                하단에서 올라오는 드로어 컴포넌트입니다.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">닫기</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </GallerySection>

      <GallerySection
        title="Popover / Hover Card"
        description="가벼운 부가 정보 표시"
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Popover 열기</Button>
          </PopoverTrigger>
          <PopoverContent className="text-sm text-muted-foreground">
            Popover 컨텐츠입니다.
          </PopoverContent>
        </Popover>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">@archy712</Button>
          </HoverCardTrigger>
          <HoverCardContent className="text-sm text-muted-foreground">
            마우스를 올리면 나타나는 카드입니다.
          </HoverCardContent>
        </HoverCard>
      </GallerySection>

      <GallerySection title="Tooltip" description="마우스 오버 시 안내 문구">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">마우스를 올려보세요</Button>
          </TooltipTrigger>
          <TooltipContent>툴팁 내용입니다</TooltipContent>
        </Tooltip>
      </GallerySection>

      <GallerySection
        title="Dropdown Menu / Context Menu"
        description="클릭·우클릭 메뉴"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">메뉴 열기</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>내 계정</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>프로필</DropdownMenuItem>
            <DropdownMenuItem>설정</DropdownMenuItem>
            <DropdownMenuItem>로그아웃</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div className="flex h-9 w-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              여기를 우클릭
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuLabel>작업</ContextMenuLabel>
            <ContextMenuSeparator />
            <ContextMenuItem>복사</ContextMenuItem>
            <ContextMenuItem>붙여넣기</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </GallerySection>

      <GallerySection title="Menubar" description="데스크톱 앱 스타일 메뉴바">
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>파일</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                새로 만들기 <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                열기 <MenubarShortcut>⌘O</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
              <MenubarItem>저장</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>편집</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>실행 취소</MenubarItem>
              <MenubarItem>다시 실행</MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </GallerySection>

      <GallerySection title="Command" description="⌘K 스타일 커맨드 팔레트">
        <Command className="w-full max-w-sm rounded-lg border">
          <CommandInput placeholder="명령어를 입력하세요..." />
          <CommandList>
            <CommandEmpty>결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="제안">
              <CommandItem>
                새 문서
                <CommandShortcut>⌘N</CommandShortcut>
              </CommandItem>
              <CommandItem>검색</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="설정">
              <CommandItem>프로필</CommandItem>
              <CommandItem>결제</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </GallerySection>
    </div>
  );
}
