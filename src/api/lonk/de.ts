/**
 * LONK data deserialization using fp-ts.
 */

import * as E from "fp-ts/Either";
import { Lonk, LonkUnsubscription } from "./types.ts";
import { Lazy, pipe } from "fp-ts/function";
import * as J from "fp-ts/Json";

type UnsubscriptionOrLonk = E.Either<LonkUnsubscription, Lonk<any>>;

function deserialize(data: any): E.Either<string, UnsubscriptionOrLonk> {
  return pipe(
    data,
    J.parse,
    E.mapLeft(() => "Could not parse message as JSON"),
    E.flatMap(validateRecord),
    E.flatMap(validateUnsubscriptionOrLonk),
  );
}

function validateUnsubscriptionOrLonk(
  obj: J.JsonRecord,
): E.Either<string, UnsubscriptionOrLonk> {
  return pipe(
    validateLonk(obj),
    E.map(E.right),
    E.orElse(curryValidateUnsubscription(obj)),
  );
}

function curryValidateUnsubscription(
  obj: J.JsonRecord,
): Lazy<E.Either<string, UnsubscriptionOrLonk>> {
  return () => pipe(validateUnsubscription(obj), E.map(E.left));
}

function validateLonk(obj: J.JsonRecord): E.Either<string, Lonk<any>> {
  if (typeof obj.pacs_name !== "string") {
    return E.left(`Missing or invalid 'pacs_name' in ${JSON.stringify(obj)}`);
  }
  if (typeof obj.SeriesInstanceUID !== "string") {
    return E.left(
      `Missing or invalid 'SeriesInstanceUID' in ${JSON.stringify(obj)}`,
    );
  }
  if (typeof obj.message !== "object" || jIsArray(obj.message)) {
    return E.left(`Missing or invalid 'message' in ${JSON.stringify(obj)}`);
  }
  // @ts-ignore proper JSON deserialization is too tedious in TypeScript
  return E.right(obj);
}

function validateUnsubscription(
  obj: J.JsonRecord,
): E.Either<string, LonkUnsubscription> {
  if (typeof obj.message !== "object" || jIsArray(obj.message)) {
    return E.left(`Missing or invalid 'message' in ${JSON.stringify(obj)}`);
  }
  if (obj.message?.subscribed === false) {
    // @ts-ignore proper JSON deserialization is too tedious in TypeScript
    return E.right(obj);
  }
  return E.left(`Unrecognized 'message' in ${JSON.stringify(obj)}`);
}

function validateRecord(obj: J.Json): E.Either<string, J.JsonRecord> {
  if (obj === null) {
    return E.left("obj is null");
  }
  if (typeof obj !== "object") {
    return E.left("not an object");
  }
  if (jIsArray(obj)) {
    return E.left("is an array, expected a JsonRecord");
  }
  return E.right(obj);
}

function jIsArray(obj: J.JsonArray | any): obj is J.JsonArray {
  return Array.isArray(obj);
}

export type { UnsubscriptionOrLonk };
export default deserialize;
