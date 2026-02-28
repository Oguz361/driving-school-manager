import { CookieBanner } from "@/components/legal/CookieBanner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <CookieBanner />
    </>
  );
}
