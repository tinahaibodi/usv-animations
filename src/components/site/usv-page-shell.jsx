import UsvHeader from "@/components/site/usv-header";

export default function UsvPageShell({ children }) {
  return (
    <div className="usv-page">
      <UsvHeader />
      <div className="usv-main-wrap">
        <main className="usv-main">{children}</main>
      </div>
    </div>
  );
}
