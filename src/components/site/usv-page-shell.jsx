import UsvHeader from "@/components/site/usv-header";

export default function UsvPageShell({ children }) {
  return (
    <div className="usv-page">
      <UsvHeader />
      <div className="usv-main-wrap">
        <main className="usv-main">{children}</main>
        <div className="guides" aria-hidden="true">
          <div className="cols">
            {Array.from({ length: 12 }, (_, index) => (
              <div key={index} className="col">
                <span>{index + 1}</span>
              </div>
            ))}
          </div>
          <div className="rows" />
          <div className="mline l" />
          <div className="mline r" />
        </div>
      </div>
    </div>
  );
}
