
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft, Search } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "4rem" // Increased width for better spacing in collapsed mode
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false)

    const [_open, _setOpen] = React.useState(() => {
        if (typeof document !== 'undefined') {
            const cookieValue = document.cookie.split('; ').find(row => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`));
            if (cookieValue) {
                return cookieValue.split('=')[1] === 'true';
            }
        }
        return defaultOpen;
    });

    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
      },
      [setOpenProp, open]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((open) => !open)
        : setOpen((open) => !open)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex h-full min-h-screen w-full",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    collapsible?: boolean
  }
>(
  (
    {
      side = "left",
      collapsible = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
    
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent
            side={side}
            className="w-[--sidebar-width] bg-sidebar-background p-0 text-sidebar-foreground flex flex-col"
            style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
          >
             <SheetHeader className="p-4">
                <SheetTitle className="sr-only">Main Menu</SheetTitle>
             </SheetHeader>
            {children}
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <div
        ref={ref}
        data-state={state}
        data-collapsible={collapsible}
        className={cn(
            "hidden md:flex flex-col h-screen bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border transition-[width] duration-300 ease-in-out group",
            state === 'expanded' ? 'w-[var(--sidebar-width)]' : 'w-[var(--sidebar-width-icon)]',
            className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const { isMobile, toggleSidebar, setOpenMobile } = useSidebar();

  const Comp = asChild ? Slot : Button;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile) {
      setOpenMobile(true);
    } else {
      toggleSidebar();
    }
    props.onClick?.(e);
  };
  
  return (
    <Comp 
        ref={ref} 
        onClick={handleClick} 
        className={className}
        {...props} 
    />
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, children, ...props }, ref) => {
    const { toggleSidebar } = useSidebar();
    return (
        <div
        ref={ref}
        data-sidebar="header"
        className={cn("relative flex h-16 items-center px-4 shrink-0 group/header", className)}
        {...props}
        >
            <div className="flex flex-1 items-center gap-2 overflow-hidden">
                {children}
            </div>
            
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "hidden h-7 w-7",
                    "md:flex",
                    "absolute right-2 top-1/2 -translate-y-1/2",
                    "opacity-0 transition-opacity duration-200",
                    "group-hover/header:opacity-100 group-data-[state=collapsed]/header:opacity-0"
                )}
                onClick={toggleSidebar}
            >
                <PanelLeft />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        </div>
    )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-1 px-2", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate",
  {
    variants: {
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface SidebarMenuButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(
  (
    {
      asChild = false,
      isActive = false,
      size = "default",
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { state: sidebarState, isMobile } = useSidebar();
    const isCollapsed = sidebarState === 'collapsed';

    const Comp = asChild ? Slot : Button;

    const buttonContent = (
      <Comp
        ref={ref}
        className={cn(
            buttonVariants({ variant: 'ghost', size: 'default' }),
            "w-full justify-start",
            sidebarMenuButtonVariants({ size, className }),
            isCollapsed && "justify-center w-10 h-10 p-0"
        )}
        data-active={isActive}
        {...props}
      >
        {children}
      </Comp>
    );

    if (!tooltip || isMobile || !isCollapsed) {
      return buttonContent;
    }
    
    const tooltipContentProps =
      typeof tooltip === "string" ? { children: tooltip } : tooltip;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          {...tooltipContentProps}
        />
      </Tooltip>
    );
  }
);
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean
  }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  const { state } = useSidebar();
  
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1/2 -translate-y-1/2 flex aspect-square w-6 h-6 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2",
        "after:absolute after:-inset-2 after:md:hidden",
        state === 'collapsed' && "hidden",
        showOnHover &&
          "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean
  }
>(({ className, showIcon = true, ...props }, ref) => {
    const { state } = useSidebar();
    
    return (
        <div
        ref={ref}
        data-sidebar="menu-skeleton"
        className={cn("rounded-md h-8 flex gap-2 px-2 items-center", className)}
        {...props}
        >
        {showIcon && (
            <Skeleton
            className="size-4 rounded-md shrink-0"
            data-sidebar="menu-skeleton-icon"
            />
        )}
        {state === 'expanded' && (
            <Skeleton
                className="h-4 flex-1"
                data-sidebar="menu-skeleton-text"
            />
        )}
        </div>
    )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
