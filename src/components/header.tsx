import { SidebarTrigger } from "./ui/sidebar";
import NextImage from "next/image";
import RentSmartLogo from "../../public/RentSmart.png";

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <SidebarTrigger className="md:hidden" />
          <div className="hidden md:flex items-center gap-3">
            <div className="flex-shrink-0">
              <NextImage src={RentSmartLogo} alt="RentSmart Logo" width={32} height={32} className="object-contain rounded" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              RentSmart Kenya Lite
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
