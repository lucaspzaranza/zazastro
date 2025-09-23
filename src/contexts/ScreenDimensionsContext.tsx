import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

interface ScreenDimensions {
  width: number;
  height: number;
}

interface ScreenDimensionsContextType {
  screenDimensions: ScreenDimensions;
  isMobileBreakPoint: () => boolean;
}

const ScreenDimensionsContext = createContext<
  ScreenDimensionsContextType | undefined
>(undefined);

const MOBILE_BREAKPOINT = 600;

export const ScreenDimensionsContextProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setScreenDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    // dispara logo na montagem
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobileBreakPoint = () => screenDimensions.width < MOBILE_BREAKPOINT;

  return (
    <ScreenDimensionsContext.Provider
      value={{
        screenDimensions,
        isMobileBreakPoint,
      }}
    >
      {children}
    </ScreenDimensionsContext.Provider>
  );
};

export const useScreenDimensions = () => {
  const context = useContext(ScreenDimensionsContext);
  if (!context) {
    throw new Error(
      "useScreenDimensionsData must be used within a ScreenDimensionsContextProvider"
    );
  }
  return context;
};
