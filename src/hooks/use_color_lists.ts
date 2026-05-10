import { useEffect, useState } from "react";
import { ColorList, loadColorLists } from "../functions/color_lists";

export interface UseColorListsResult {
  lists: ColorList[];
  loading: boolean;
  error: boolean;
}

export const useColorLists = (enabled: boolean): UseColorListsResult => {
  const [lists, setLists] = useState<ColorList[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled || lists.length > 0) return;
    let alive = true;
    loadColorLists().then(
      (data) => {
        if (!alive) return;
        setLists(data);
        setFailed(false);
      },
      () => {
        if (alive) setFailed(true);
      },
    );
    return () => {
      alive = false;
    };
  }, [enabled, lists.length]);

  return {
    lists,
    loading: enabled && lists.length === 0 && !failed,
    error: failed,
  };
};
