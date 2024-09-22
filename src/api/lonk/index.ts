/**
 * "Light Oxidicom NotifiKations" over WebSockets (LONK-WS) client.
 *
 * https://chrisproject.org/docs/oxidicom/lonk-ws
 */

import LonkSubscriber from "./LonkSubscriber.ts";
import { LonkHandlers } from "./types.ts";

export default LonkSubscriber;
export type { LonkHandlers };
