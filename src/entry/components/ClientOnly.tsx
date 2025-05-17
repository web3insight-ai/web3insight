import { type PropsWithChildren, useState, useEffect } from "react";

let hydrating = true;

function ClientOnly({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(!hydrating);

  useEffect(() => {
    hydrating = false;
    setHydrated(true);
  }, []);

  return hydrated ? children : null;
}

export default ClientOnly;
