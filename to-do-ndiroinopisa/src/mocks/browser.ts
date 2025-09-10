import { setupWorker } from "msw/browser";
import { handlers } from "../../backend/handlers";

export const worker = setupWorker(...handlers);
