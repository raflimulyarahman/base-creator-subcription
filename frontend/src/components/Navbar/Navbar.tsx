import NavbarClient from "./NavbarClient";

export default function Navbar({ onOpenSidebar, activeTab, setActiveTab, currentPath }: {
  onOpenSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentPath: string;
}) {
  return (
    <nav className="w-full h-16 bg-white text-black md:bg-transparent">
      <NavbarClient
        onOpenSidebar={onOpenSidebar}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPath={currentPath}
      />
    </nav>
  );
}
