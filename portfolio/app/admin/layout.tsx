import AdminSplash from "@/components/admin/AdminSplash";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminSplash />
      {children}
    </>
  );
}
