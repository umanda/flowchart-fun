import { useThrottle } from "@react-hook/throttle";
import { compressToEncodedURIComponent as compress } from "lz-string";
import { useContext, useEffect, useState } from "react";

import { AppContext } from "../components/AppContext";
import useGraphOptions from "../components/useGraphOptions";
import { HIDDEN_GRAPH_OPTIONS_DIVIDER } from "./constants";
import { getBackground } from "./getBackground";
import { useGraphTheme } from "./graphThemes";
import { usePublicChart } from "./queries";
import { useUpdateGraphOptionsText } from "./useUpdateGraphOptionsText";

export function usePublicDoc(publicId?: string) {
  const { data } = usePublicChart(publicId);

  // immediate, full state
  const [fullText, setFullText] = useState(data?.chart || "");

  // split the text and hidden graph options
  const parts = fullText.split(HIDDEN_GRAPH_OPTIONS_DIVIDER);
  const text = parts[0];
  const hiddenGraphOptionsText = parts[1] || "{}";
  let hiddenGraphOptions: any = {};
  try {
    hiddenGraphOptions = JSON.parse(hiddenGraphOptionsText.trim());
  } catch (e) {
    console.log(e);
  }

  const isFrozen = "nodePositions" in hiddenGraphOptions;

  const setText = (newText: string) => {
    setFullText(
      newText + HIDDEN_GRAPH_OPTIONS_DIVIDER + hiddenGraphOptionsText
    );
  };

  // TODO: the share link should be moved into a tiny zustand store
  const { setShareLink } = useContext(AppContext);
  useEffect(() => {
    setShareLink(compress(fullText));
  }, [fullText, setShareLink]);

  // have a throttled visible text
  const [toParse, setToParse] = useThrottle(text, 2);
  useEffect(() => {
    setToParse(text);
  }, [text, setToParse]);

  // get graph options
  const options = useGraphOptions(toParse);

  const updateGraphOptionsText = useUpdateGraphOptionsText(
    options.content,
    options.graphOptions,
    setText,
    setToParse
  );

  // theme stuff
  const theme = useGraphTheme(options.graphOptions.theme);
  const bg = getBackground(options.graphOptions, theme);

  return {
    fullText,
    text,
    setText,
    toParse,
    hiddenGraphOptions,
    options,
    updateGraphOptionsText,
    hiddenGraphOptionsText,
    theme,
    bg,
    isFrozen,
  };
}
