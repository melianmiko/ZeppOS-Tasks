import {BottomSheet} from "../../lib/mmk/setting/BottomSheet";
import {Spinner} from "../../lib/mmk/setting/Spinner";

export function LoadingBottomSheet(onCancel) {
  return BottomSheet(true, onCancel, [
    View({
      style: {
        textAlign: "center",
      }
    }, [
      Spinner()
    ])
  ]);
}