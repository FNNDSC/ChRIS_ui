import {
  Plugin,
  PluginInstance,
  PluginMeta,
  PluginParameter,
} from "@fnndsc/chrisapi";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "antd";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import React from "react";
import { useParams } from "react-router";
import ChrisAPIClient from "../../api/chrisapiclient";
import { fetchResource } from "../../api/common";
import { useTypedSelector } from "../../store/hooks";
import { unpackParametersIntoString } from "../AddNode/utils";
import { EmptyStateComponent, SpinContainer } from "../Common";
import WrapperConnect from "../Wrapper";
import {
  HeaderCardPlugin,
  HeaderSinglePlugin,
  ParameterPayload,
} from "./PluginCatalogComponents";
import "./singlePlugin.css";

const SinglePlugin = () => {
  const isLoggedIn = useTypedSelector(({ user }) => user.isLoggedIn);
  const { id } = useParams() as { id: string };
  const [parameterPayload, setParameterPayload] =
    React.useState<ParameterPayload>();

  // Function to fetch the Readme from the Repo.
  const fetchReadme = async (currentPluginMeta?: PluginMeta) => {
    if (!currentPluginMeta) return;
    const repo = currentPluginMeta.data.public_repo.split("github.com/")[1];
    const ghreadme = await fetch(`https://api.github.com/repos/${repo}/readme`);
    if (!ghreadme.ok) {
      return;
    }
    const { download_url, content }: { download_url: string; content: string } =
      await ghreadme.json();
    const file = atob(content);
    let fileToSanitize = "";
    const type: string = download_url.split(".").reverse()[0];

    if (type === "md" || type === "rst") {
      fileToSanitize = micromark(file, {
        extensions: [gfm()],
        htmlExtensions: [gfmHtml()],
      });
    } else {
      fileToSanitize = file;
    }

    return fileToSanitize;
  };

  const fetchPlugins = async (id: number) => {
    const client = ChrisAPIClient.getClient();

    try {
      const pluginMeta = await client.getPluginMeta(id);
      document.title = pluginMeta.data.name;

      const fn = pluginMeta.getPlugins;
      const boundFn = fn.bind(pluginMeta);
      const params = {
        limit: 1000,
        offset: 0,
      };

      const results = await fetchResource<Plugin>(params, boundFn);
      const readme = await fetchReadme(pluginMeta);
      return {
        currentPluginMeta: pluginMeta,
        plugins: results.resource,
        readme,
      };
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const setPluginParameters = React.useCallback(
    async (plugin: Plugin) => {
      let generatedCommand = "";
      const params = { limit: 10, offset: 0 };
      const fn = plugin.getPluginParameters;
      const computeFn = plugin.getPluginComputeResources;

      const boundFn = fn.bind(plugin);
      const boundComputeFn = computeFn.bind(plugin);
      const { resource: parameters } = await fetchResource<PluginParameter>(
        params,
        boundFn,
      );

      const { resource: computes } = isLoggedIn
        ? await fetchResource(params, boundComputeFn)
        : { resource: [] };

      const pluginInstances = isLoggedIn
        ? ((
            await plugin.getPluginInstances({
              limit: 1000,
            })
          ).getItems() as PluginInstance[])
        : [];

      if (parameters.length > 0) {
        for (const param of parameters) {
          const generateInput = {
            [param.data.id]: {
              flag: param.data.flag,
              id: param.data.id,
              paramName: param.data.name,
              type: param.data.type,
              value: param.data.default
                ? param.data.default
                : param.data.type !== "boolean"
                  ? "' '"
                  : "",
            },
          };
          generatedCommand += unpackParametersIntoString(generateInput);
        }

        setParameterPayload({
          generatedCommand,
          version: plugin.data.version,
          url: plugin.url,
          computes: computes,
          pluginInstances: pluginInstances,
        });
      }
    },
    [isLoggedIn],
  );

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ["pluginData", id],
    queryFn: () => fetchPlugins(+id),
    enabled: !!id,
  });

  const removeEmail = (authors: string | string[]) => {
    let authorArray: string[] = [];
    const emailRegex = /(<|\().+?@.{2,}?\..{2,}?(>|\))/g;
    // Match '<' or '(' at the beginning and end
    // Match <string>@<host>.<tld> inside brackets
    if (!Array.isArray(authors)) {
      authorArray = [authors];
    } else authorArray = authors;
    // eslint-disable-next-line no-param-reassign

    return authorArray.map((author) => author.replace(emailRegex, "").trim());
  };

  React.useEffect(() => {
    if (data?.plugins && data.plugins.length > 0) {
      setPluginParameters(data.plugins[0]);
    }
  }, [data?.plugins[0], setPluginParameters]);

  return (
    <WrapperConnect>
      {isLoading || isFetching ? (
        <SpinContainer title="Please wait as resources for this plugin are being fetched..." />
      ) : data ? (
        <>
          <HeaderSinglePlugin currentPluginMeta={data.currentPluginMeta} />
          <HeaderCardPlugin
            setPluginParameters={setPluginParameters}
            plugins={data.plugins}
            currentPluginMeta={data.currentPluginMeta}
            readme={data.readme}
            parameterPayload={parameterPayload}
            removeEmail={removeEmail}
          />
        </>
      ) : (
        <EmptyStateComponent />
      )}
      {isError && <Alert type="error" description={error.message} />}
    </WrapperConnect>
  );
};

export default SinglePlugin;
