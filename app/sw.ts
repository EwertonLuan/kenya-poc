import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// Offline
// const serwist = new Serwist({
//   precacheEntries: [
//     ...self.__SW_MANIFEST!,
//     { url: "/protected", revision: "1" }, // Explicitly precache `/protected`
//   ],
//   skipWaiting: true,
//   clientsClaim: true,
//   navigationPreload: true,
//   runtimeCaching: [
//     ...defaultCache,
//     {
//       urlPattern: /^\/protected$/,
//       handler: "CacheFirst", // Serve from cache first, fallback to network
//       options: {
//         cacheName: "protected-cache",
//         expiration: { maxEntries: 10, maxAgeSeconds: 7 * 24 * 60 * 60 }, // Cache for 7 days
//       },
//     },
//   ],
// });

serwist.addEventListeners();