import { Home } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Home className="h-6 w-6" />
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
