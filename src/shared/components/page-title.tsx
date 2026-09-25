export const PageTitle = ({ rawTitle, title }: { rawTitle?: string; title?: string }) => (
  <h1 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-foreground">
    {rawTitle ?? title ?? ""}
  </h1>
);
