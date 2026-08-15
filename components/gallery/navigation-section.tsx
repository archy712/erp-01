import { Home, Search, Settings } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GallerySection } from "@/components/gallery/section";

export function NavigationSection() {
  return (
    <div className="flex flex-col gap-4">
      <GallerySection title="Tabs" description="탭으로 콘텐츠 전환">
        <Tabs defaultValue="tab1" className="w-full">
          <TabsList>
            <TabsTrigger value="tab1">첫 번째 탭</TabsTrigger>
            <TabsTrigger value="tab2">두 번째 탭</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" className="text-sm text-muted-foreground">
            첫 번째 탭의 내용입니다.
          </TabsContent>
          <TabsContent value="tab2" className="text-sm text-muted-foreground">
            두 번째 탭의 내용입니다.
          </TabsContent>
        </Tabs>
      </GallerySection>

      <GallerySection
        title="Breadcrumb"
        description="현재 위치를 알려주는 경로"
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/gallery">컴포넌트 갤러리</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Navigation</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </GallerySection>

      <GallerySection
        title="Navigation Menu"
        description="드롭다운형 상단 내비게이션"
      >
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>제품</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-64 gap-1 p-2">
                  <li>
                    <NavigationMenuLink
                      href="#"
                      className="block rounded-md p-2 text-sm hover:bg-accent"
                    >
                      대시보드
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink
                      href="#"
                      className="block rounded-md p-2 text-sm hover:bg-accent"
                    >
                      분석
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                href="#"
                className="px-3 py-2 text-sm font-medium"
              >
                가격
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </GallerySection>

      <GallerySection title="Pagination" description="페이지 이동">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </GallerySection>

      <GallerySection
        title="Sidebar"
        description="접고 펼 수 있는 앱 사이드바 (미리보기 영역으로 높이 제한)"
        contentClassName="h-80 w-full overflow-hidden rounded-lg border p-0"
      >
        <SidebarProvider className="min-h-0">
          <Sidebar collapsible="none" className="h-80">
            <SidebarHeader>
              <span className="px-2 text-sm font-semibold">My App</span>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>메뉴</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Home />
                        <span>홈</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Search />
                        <span>검색</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>
                        <Settings />
                        <span>설정</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            콘텐츠 영역
          </div>
        </SidebarProvider>
      </GallerySection>
    </div>
  );
}
