import { differenceInSeconds } from "date-fns";
import { useEffect, useRef, useState } from "react";

// Custom hook to handle new resource highlighting
const useNewResourceHighlight = (creationDate: string) => {
  const rowRef = useRef<HTMLLIElement>(null);
  const secondsSinceCreation = differenceInSeconds(
    new Date(),
    new Date(creationDate),
  );
  const [isNewResource, setIsNewResource] = useState(
    secondsSinceCreation <= 15,
  );

  useEffect(() => {
    if (isNewResource && rowRef.current) {
      rowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const timeoutId = setTimeout(() => {
        setIsNewResource(false);
      }, 10000);

      return () => clearTimeout(timeoutId);
    }
  }, [isNewResource]);

  return { isNewResource, scrollToNewResource: rowRef };
};

export default useNewResourceHighlight;
