import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

function NavigationProgress() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (navigation.state === "loading" || navigation.state === "submitting") {
      setIsVisible(true);
      setProgress(0);
      
      // Simulate progress
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      return () => clearInterval(timer);
    } else {
      // Complete the progress bar
      setProgress(100);
      
      // Hide after animation completes
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 300);

      return () => clearTimeout(hideTimer);
    }
  }, [navigation.state]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 z-50">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default NavigationProgress;
