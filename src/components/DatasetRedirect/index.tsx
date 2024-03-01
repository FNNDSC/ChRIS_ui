import { useNavigate, useParams } from "react-router";
import React from "react";
import { DatasetSearchResult, getDatasets } from "./getDatasets.ts";
import NotFound from "../NotFound";
import { Link } from "react-router-dom";
import { useTypedSelector } from "../../store/hooks.ts";

/**
 * A page which redirects to a dataset viewer.
 *
 * `DatasetRedirect` _must_ be used within the context of the react-router.
 * It depends on a dynamic segment called `feedName`.
 *
 * Assuming everything is working, this is supposed to be a simple component
 * without much visual elements. It redirects to another page immediately.
 * When edge cases happen, e.g. warnings show up due to pagination being
 * unimplemented, or there are multiple datasets found for the same name,
 * the page will render a few simple messages explaining the situation,
 * and no automatic redirection will occur.
 */
const DatasetRedirect = () => {
  const params = useParams();
  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);
  const [result, setResult] = React.useState<DatasetSearchResult | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: catch error is untyped
  const [error, setError] = React.useState<any>();

  // This component is responsible for searching for the dataset.
  // DatasetRedirector does the actual redirection if the
  // search is successful.
  React.useEffect(() => {
    getDatasets(params.feedName, isLoggedIn)
      .then(setResult)
      .catch((e) => {
        setError(e);
        throw e;
      });
  }, [params.feedName, isLoggedIn]);

  if (result !== null) {
    return <DatasetRedirector {...result} />;
  }
  if (error) {
    return (
      <>
        <p>An error has occured.</p>
        <pre>
          {typeof error.toString === "function" ? error.toString() : "unknown"}
        </pre>
      </>
    );
  }
  return <>Redirecting to dataset viewer</>;
};

/**
 * A very barebones redirector element.
 *
 * - If there is one plugin instance found and no warnings, it redirects right away.
 * - If there are no plugin instances and no warnings, it shows `<NotFound />`
 * - Otherwise, it shows messages for all warnings and links for all plugin instances.
 *
 */
const DatasetRedirector: React.FC<DatasetSearchResult> = ({
  warnings,
  plinsts,
}) => {
  const navigate = useNavigate();
  const onlyLink =
    warnings.length === 0 && plinsts.length === 1
      ? `/niivue/${plinsts[0].data.id}`
      : null;

  React.useEffect(() => {
    if (onlyLink !== null) {
      navigate(onlyLink);
    }
  }, [onlyLink, navigate]);

  if (warnings.length === 0 && plinsts.length === 0) {
    return <NotFound />;
  }

  return (
    <>
      {warnings.length === 0 || (
        <>
          <p>warnings:</p>
          <p>
            <ul>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </p>
          <p>
            Please report these issues to{" "}
            <a
              href={`mailto:dev@babymri.org?subject=ChRIS_ui dataset redirection warnings&body=Please see the warnings below:\n${JSON.stringify(
                warnings,
              )}`}
            >
              dev@babyMRI.org
            </a>
            .
          </p>
        </>
      )}
      {onlyLink ? (
        <>
          Redirecting to <Link to={onlyLink}>{onlyLink}</Link>
        </>
      ) : (
        <>
          <p>More than one dataset with the same name found. Please select:</p>
          <p>
            <ul>
              {plinsts
                .map((plinst) => `/niivue/${plinst.data.id}`)
                .map((url) => (
                  <li>
                    <Link to={url}>{url}</Link>
                  </li>
                ))}
            </ul>
          </p>
        </>
      )}
    </>
  );
};

export default DatasetRedirect;
