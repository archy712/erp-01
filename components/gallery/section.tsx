import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GallerySection({
  id,
  title,
  description,
  children,
  contentClassName,
}: {
  id?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <Card id={id} className={id ? "scroll-mt-20" : undefined}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent
        className={contentClassName ?? "flex flex-wrap items-center gap-4"}
      >
        {children}
      </CardContent>
    </Card>
  );
}
