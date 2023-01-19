import React from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useParams } from "react-router";
import {
  Plugin,
  PluginMeta,
  PluginParameter,
  PluginComputeResourceList,
  PluginInstance,
} from "@fnndsc/chrisapi";
import Wrapper from "../Layout/PageWrapper";
import { Spinner } from "@patternfly/react-core";
import { marked } from "marked";
import { sanitize } from "dompurify";
import "./SinglePlugin.scss";
import { fetchResource } from "../../api/common";
import { unpackParametersIntoString } from "../../components/feed/AddNode/lib/utils";
import {
  HeaderCardPlugin,
  HeaderSinglePlugin,
  ParameterPayload,
} from "../../components/catalog/PluginCatalogComponents";

const SinglePlugin = () => {
  const { id } = useParams() as { id: string };

  const [readme, setReadme] = React.useState<string>("");
  const [plugins, setPlugins] = React.useState<Plugin[]>();
  const [parameterPayload, setParameterPayload] =
    React.useState<ParameterPayload>();
  const setReadmeHTML = ($: any) => setReadme(sanitize($));
  const [currentPluginMeta, setCurrentPluginMeta] =
    React.useState<PluginMeta>();

  React.useEffect(() => {
    async function fetchPlugins(id: number) {
      const client = ChrisAPIClient.getClient();
      const pluginMeta = await client.getPluginMeta(id);
      document.title = pluginMeta.data.name;
      setCurrentPluginMeta(pluginMeta);
      const fn = pluginMeta.getPlugins;
      const boundFn = fn.bind(pluginMeta);
      const params = {
        limit: 1000,
        offset: 0,
      };

      const results = await fetchResource<Plugin>(params, boundFn);
      setPlugins(results["resource"]);
    }
    fetchPlugins(+id);
  }, [id]);

  // Function to fetch the Readme from the Repo.
  const fetchReadme = React.useCallback(async (repo: string) => {
    const ghreadme = await fetch(`https://api.github.com/repos/${repo}/readme`);
    if (!ghreadme.ok) {
      throw new Error("Failed to fetch repo.");
    }
    const { download_url, content }: { download_url: string; content: string } =
      await ghreadme.json();
    const file = atob(content);
    const type: string = download_url.split(".").reverse()[0];
    return { file, type };
  }, []);

  const setPluginParameters = async (plugin: Plugin) => {
    let generatedCommand = "";
    const params = { limit: 10, offset: 0 };
    const fn = plugin.getPluginParameters;
    const computeFn = plugin.getPluginComputeResources;

    const boundFn = fn.bind(plugin);
    const boundComputeFn = computeFn.bind(plugin);
    const { resource: parameters } = await fetchResource<PluginParameter>(
      params,
      boundFn
    );

    const { resource: computes } = await fetchResource(params, boundComputeFn);
    const pluginInstancesList = await plugin.getPluginInstances({
      limit: 20,
    });

    const pluginInstances: PluginInstance[] =
      pluginInstancesList.getItems() as PluginInstance[];

    if (parameters.length > 0) {
      parameters.forEach((param) => {
        const generateInput = {
          [param.data.id]: {
            flag: param.data.flag,
            id: param.data.id,
            paramName: param.data.name,
            type: param.data.type,
            value: param.data.default ? param.data.default : "",
          },
        };
        generatedCommand += unpackParametersIntoString(generateInput);
      });

      setParameterPayload({
        generatedCommand,
        version: plugin.data.version,
        url: plugin.url,
        computes: computes,
        pluginInstances: pluginInstances,
      });
    }
  };

  React.useEffect(() => {
    async function fetchRepo(currentPluginMeta: PluginMeta) {
      const repoName =
        currentPluginMeta.data.public_repo.split("github.com/")[1];

      const { file, type } = await fetchReadme(repoName);
      if (type === "md" || type === "rst") {
        setReadmeHTML(marked.parse(file));
      } else {
        setReadmeHTML(file);
      }
    }

    if (currentPluginMeta) fetchRepo(currentPluginMeta);
  }, [fetchReadme, currentPluginMeta]);

  React.useEffect(() => {
    async function setPluginPayload() {
      if (plugins && plugins.length > 0) {
        await setPluginParameters(plugins[0]);
      }
    }

    setPluginPayload();
  }, [plugins]);

  const removeEmail = (authors: string[]) => {
    const emailRegex = /(<|\().+?@.{2,}?\..{2,}?(>|\))/g;
    // Match '<' or '(' at the beginning and end
    // Match <string>@<host>.<tld> inside brackets
    if (!Array.isArray(authors))
      // eslint-disable-next-line no-param-reassign
      authors = [authors];
    return authors.map((author) => author.replace(emailRegex, "").trim());
  };

  return (
    <Wrapper>
      {!currentPluginMeta ? (
        <div style={{ margin: "auto" }}>
          <Spinner isSVG diameter="80px" />
        </div>
      ) : (
        <article>
          <div className="plugin">
            <section className="plugin-head">
              <HeaderSinglePlugin currentPluginMeta={currentPluginMeta} />
            </section>
            <section>
              <HeaderCardPlugin
                setPluginParameters={setPluginParameters}
                plugins={plugins}
                currentPluginMeta={currentPluginMeta}
                readme={readme}
                parameterPayload={parameterPayload}
                removeEmail={removeEmail}
              />
            </section>
          </div>
        </article>
      )}
    </Wrapper>
  );
};

export default SinglePlugin;
