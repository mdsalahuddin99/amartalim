import type { ReactNode } from "react";

export type CourseTabId = "overview" | "curriculum" | "instructor" | "reviews";

export interface CourseTab {
  id: CourseTabId;
  label: string;
  icon: ReactNode;
}

export interface CourseTabsNavProps {
  tabs: CourseTab[];
  activeTab: CourseTabId;
  onChange: (id: CourseTabId) => void;
}

/** Sticky tab navigation bar under the course hero. */
export const CourseTabsNav = ({ tabs, activeTab, onChange }: CourseTabsNavProps) => (
  <div className="sticky top-14 sm:top-16 z-20 bg-background border-b border-border">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default CourseTabsNav;
