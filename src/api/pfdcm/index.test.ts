import { test, expect } from "vitest";
import { PfdcmClient, Configuration } from "./index.ts";
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
  expect(await client.getPacsServices()).toContain("MINICHRISORTHANC");

  const list = await client.query("MINICHRISORTHANC", { patientID: "1449c1d" });
  const { study, series } = list[0];
  expect(study.PatientName).toBe("anonymized");
  expect(study.PatientBirthDate).toStrictEqual(new Date(2009, 6, 1));
  expect(series.map((s) => s.SeriesDescription.trim())).toContain(
    "SAG MPRAGE 220 FOV",
  );
});
