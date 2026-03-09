import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import ReceiveSharingIntent from "react-native-receive-sharing-intent";
import { parseShareText } from "./shareParser";

export type SharedFile = {
  filePath?: string;
  text?: string;
  mimeType?: string;
  weblink?: string;
};

interface ShareIntentContextType {
  sharedUrl: string | null;
  isProcessing: boolean;
  setSharedUrl: (url: string | null) => void;
  clearSharedUrl: () => void;
  consumeSharedUrl: () => string | null;
}

interface ShareIntentProviderProps {
  children: ReactNode;

  onUrlReceived?: (url: string) => void;

  onNoUrlFound?: (rawText: string) => void;
}

const ShareIntentContext = createContext<ShareIntentContextType | undefined>(
  undefined,
);

export function ShareIntentProvider({
  children,
  onUrlReceived,
  onNoUrlFound,
}: ShareIntentProviderProps): React.JSX.Element {
  const [sharedUrl, setSharedUrlState] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const setSharedUrl = useCallback((url: string | null) => {
    setSharedUrlState(url);
    if (url) {
      console.log("[ShareIntentProvider] URL set:", url);
    }
  }, []);

  const clearSharedUrl = useCallback(() => {
    setSharedUrlState(null);
    console.log("[ShareIntentProvider] URL cleared");
  }, []);

  const consumeSharedUrl = useCallback((): string | null => {
    const url = sharedUrl;
    clearSharedUrl();
    return url;
  }, [sharedUrl, clearSharedUrl]);

  const processShareIntent = useCallback(
    (sharedData: SharedFile[]) => {
      if (!sharedData || sharedData.length === 0) {
        return;
      }

      setIsProcessing(true);

      try {
        const sharedItem = sharedData[0];
        const rawText =
          sharedItem?.text || sharedItem?.weblink || sharedItem?.filePath || "";

        if (!rawText) {
          onNoUrlFound?.("No content found in shared data");
          setIsProcessing(false);
          return;
        }

        const parsedUrl = parseShareText(rawText);

        if (parsedUrl) {
          setSharedUrl(parsedUrl);

          // Trigger the callback
          onUrlReceived?.(parsedUrl);

          console.log("[ShareIntentProvider] URL extracted:", parsedUrl);
        } else {
          onNoUrlFound?.(rawText);

          console.log(
            "[ShareIntentProvider] No URL found in shared text:",
            rawText,
          );
        }
      } catch (error) {
        console.error(
          "[ShareIntentProvider] Error processing share intent:",
          error,
        );
      } finally {
        setIsProcessing(false);
      }
    },
    [setSharedUrl, onUrlReceived, onNoUrlFound],
  );

  useEffect(() => {
    let isMounted = true;

    const getSharedFiles = () => {
      try {
        ReceiveSharingIntent.getReceivedFiles(
          (files: SharedFile[]) => {
            if (isMounted && files && files.length > 0) {
              processShareIntent(files);

              ReceiveSharingIntent.clearReceivedFiles();
            }
          },
          (error: Error) => {
            if (isMounted) {
              console.error(
                "[ShareIntentProvider] Error getting received files:",
                error,
              );
            }
          },
          "LinkVault", // App group identifier for iOS (used on both platforms)
        );
      } catch (error) {
        console.error(
          "[ShareIntentProvider] Exception in getReceivedFiles:",
          error,
        );
      }
    };

    getSharedFiles();
    return () => {
      isMounted = false;
      // Clear any pending share data on unmount
      try {
        ReceiveSharingIntent.clearReceivedFiles();
      } catch (error) {
        console.error(
          "[ShareIntentProvider] Error clearing files on unmount:",
          error,
        );
      }
    };
  }, [processShareIntent]);

  // Provide the context value
  const contextValue: ShareIntentContextType = {
    sharedUrl,
    isProcessing,
    setSharedUrl,
    clearSharedUrl,
    consumeSharedUrl,
  };

  return (
    <ShareIntentContext.Provider value={contextValue}>
      {children}
    </ShareIntentContext.Provider>
  );
}

export function useSharedLink(): ShareIntentContextType {
  const context = useContext(ShareIntentContext);

  if (context === undefined) {
    throw new Error(
      "useSharedLink must be used within a ShareIntentProvider. " +
        "Make sure your app is wrapped with ShareIntentProvider.",
    );
  }

  return context;
}

export function useShareIntent(options?: {
  onUrlReceived?: (url: string) => void;
  onNoUrlFound?: (rawText: string) => void;
}): void {
  const { sharedUrl, consumeSharedUrl } = useSharedLink();

  useEffect(() => {
    if (sharedUrl) {
      options?.onUrlReceived?.(sharedUrl);
      consumeSharedUrl();
    }
  }, [sharedUrl, options, consumeSharedUrl]);
}

export { ShareIntentContext };

export default ShareIntentProvider;
