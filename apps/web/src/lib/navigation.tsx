"use client";

import NextLink from "next/link";
import { useRouter, usePathname, useSearchParams as useNextSearchParams } from "next/navigation";
import React from "react";

export const Link = React.forwardRef<HTMLAnchorElement, any>(
  ({ to, replace, ...props }, ref) => {
    return (
      <NextLink href={to} replace={replace} ref={ref} {...props} />
    );
  }
);
Link.displayName = "Link";

export const NavLink = React.forwardRef<HTMLAnchorElement, any>(
  ({ to, className, activeClassName = "active", ...props }, ref) => {
    const pathname = usePathname();
    const isActive = pathname === to;
    
    let combinedClassName = className;
    if (typeof className === "function") {
      combinedClassName = className({ isActive });
    } else if (isActive && activeClassName) {
      combinedClassName = `${className || ""} ${activeClassName}`.trim();
    }

    return (
      <NextLink href={to} className={combinedClassName} ref={ref} {...props} />
    );
  }
);
NavLink.displayName = "NavLink";

export function useNavigate() {
  const router = useRouter();
  return (to: string | number, options?: { replace?: boolean }) => {
    if (typeof to === "number") {
      if (to === -1) {
         router.back();
      }
      return;
    }
    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useNextSearchParams();
  return {
    pathname,
    search: searchParams ? `?${searchParams.toString()}` : "",
    hash: "", // Not natively provided as easily, but can be shimmed if really needed
    state: null,
  };
}

// Next.js params are usually passed as props to page.tsx, but some client components
// might rely on useParams from react-router. In Next.js App router, useParams exists in next/navigation
import { useParams as useNextParams } from "next/navigation";
export const useParams = useNextParams;

export function useSearchParams() {
  const params = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setParams = (
    newParams: Record<string, string> | URLSearchParams | string | string[][] | Record<string, string[]>,
    options?: { replace?: boolean }
  ) => {
    const search = new URLSearchParams(newParams as any).toString();
    const query = search ? `?${search}` : "";
    if (options?.replace) {
      router.replace(`${pathname}${query}`);
    } else {
      router.push(`${pathname}${query}`);
    }
  };
  return [params, setParams] as const;
}

export const Navigate = ({ to, replace }: { to: string; replace?: boolean }) => {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);
  return null;
};

// Outlet is used in React Router for nested routes. 
// In Next.js, children props handle this, so Outlet is usually a no-op 
// or requires passing children. If heavily used, layout.tsx replaces this.
export const Outlet = () => {
  return null;
};

export type LinkProps = any;
export type NavLinkProps = any;
