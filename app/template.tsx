import { ViewTransition } from "react";

// Every page is remounted on navigation, so this wrapper gives each one an exit and an entrance.
// The animations are in globals.css under "Page transitions"; browsers without view
// transitions simply swap pages.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
