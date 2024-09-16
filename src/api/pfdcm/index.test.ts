import { test, expect } from "vitest";
import { PfdcmClient, Configuration } from "./index.ts";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { PfdcmEnvironmentalDetailApi } from "./generated";

test("PfdcmClient", async (context) => {
  const url = process.env.VITE_PFDCM_URL;
  // const url = 'http://localhost:8088'
  const configuration = new Configuration({ basePath: url });
  try {
    const pfdcmDetailClient = new PfdcmEnvironmentalDetailApi(configuration);
    const hello = await pfdcmDetailClient.readHelloApiV1HelloGet();
    expect(hello.name).toBe("pfdcm_hello");
  } catch (e) {
    // pfdcm 'hello' endpoint not working, is pfdcm online?
    context.skip();
  }

  const client = new PfdcmClient(configuration);
  const getServices = pipe(client.getPacsServices(), TE.toUnion);
  expect(await getServices()).toContain("MINICHRISORTHANC");

  const query = { patientID: "1449c1d" };
  const queryAndAssertStudies = pipe(
    client.query("MINICHRISORTHANC", query),
    TE.mapLeft((e) => expect(e).toBeNull()),
    TE.map((list) => {
      const { study, series } = list[0];
      expect(study.PatientName).toBe("anonymized");
      expect(study.PatientBirthDate).toStrictEqual(new Date(2009, 6, 1));
      expect(series.map((s) => s.SeriesDescription.trim())).toContain(
        "SAG MPRAGE 220 FOV",
      );
    }),
  );
  await queryAndAssertStudies();
});
