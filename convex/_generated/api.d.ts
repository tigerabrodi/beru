/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as childProfiles_queries from "../childProfiles/queries.js";
import type * as http from "../http.js";
import type * as lib_utils from "../lib/utils.js";
import type * as stories_actions from "../stories/actions.js";
import type * as stories_mutations from "../stories/mutations.js";
import type * as stories_queries from "../stories/queries.js";
import type * as users_actions from "../users/actions.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";
import type * as voicePresets_actions from "../voicePresets/actions.js";
import type * as voicePresets_mutations from "../voicePresets/mutations.js";
import type * as voicePresets_queries from "../voicePresets/queries.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "childProfiles/queries": typeof childProfiles_queries;
  http: typeof http;
  "lib/utils": typeof lib_utils;
  "stories/actions": typeof stories_actions;
  "stories/mutations": typeof stories_mutations;
  "stories/queries": typeof stories_queries;
  "users/actions": typeof users_actions;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
  "voicePresets/actions": typeof voicePresets_actions;
  "voicePresets/mutations": typeof voicePresets_mutations;
  "voicePresets/queries": typeof voicePresets_queries;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
