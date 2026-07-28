export {
  dialogResult,
  neverthrowDialog,
  type NeverthrowDialogDenied,
  type NeverthrowDialogDismissed,
  type NeverthrowDialogError,
} from "./lib/dynamic-dialog-neverthrow";

// Side-effect: monkey-patches dialog() so every result gets .result()
import "./lib/dynamic-dialog-neverthrow";
