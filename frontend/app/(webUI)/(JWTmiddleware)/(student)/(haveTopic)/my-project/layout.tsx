  

import { ReactNode } from "react";

export default function TopicLayout({ children }: { children: ReactNode }) {
  return (
    <>
        <main>{children}</main>
    </>
  );
}
