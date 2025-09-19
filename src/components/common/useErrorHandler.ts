
/** 
 * Base interface for all slices that want error handling.
 * Any slice that implements this can receive queue errors automatically.
 */
export interface BaseSliceState {
  /** Current user-visible error message */
  errorMessage: string | null;

  /** Setter for the error message */
  setError: (msg: string | null) => void;
}

/**
 * Handles errors from queue processing in a consistent way for any slice.
 * 
 * @param slice - the slice instance implementing BaseSliceState
 * @param error - the caught error from a queue action
 * 
 * This function decides what message should be visible to the user and sets it
 * in the slice. It also logs the full error for debugging.
 */
export function handleQueueError(slice: BaseSliceState, error: unknown) {
  // Always log full error for debugging
  console.error("❌ [Queue] Error caught:", error);

  // Determine user-friendly message
  let message = "Something went wrong. Please try again.";

  // Axios-style error
  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status === 403) {
      message = "You don’t have permission to perform this action.";
    } else if (axiosError.response?.status === 401) {
      message = "Your session has expired. Please log in again.";
    }
  } 
  // Generic Error object
  else if (error instanceof Error) {
    message = error.message || message;
  }

  // Set the message in the slice
  slice.setError(message);
}
