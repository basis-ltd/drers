import { useState } from 'react';
import { Menu, Shield, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileSidebarContent } from './AppSidebar';

export function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b border-primary/10 bg-white px-4 lg:hidden"
      aria-label="Mobile top bar"
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
        className={`cursor-pointer`}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0" aria-label="Navigation drawer">
          <MobileSidebarContent />
        </SheetContent>
      </Sheet>

      <figure className="flex items-center gap-2" aria-label="RNEC brand">
        <Shield className="size-6 text-primary" aria-hidden />
        <p className="text-[13px] font-semibold leading-tight tracking-tight text-primary">
          RNEC Rwanda
        </p>
      </figure>

      {/* Spacer to centre the logo */}
      <span className="size-9" aria-hidden />
    </header>
  );
}
