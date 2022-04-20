import React from "react";
import { useDispatch } from "react-redux";
import Wrapper from "../Layout/PageWrapper";
import { PageSection, Title } from "@patternfly/react-core";
import { Typography } from "antd";
import PluginCatalog from "../../components/catalog/PluginCatalog";
import PipelineCatalog from "../../components/catalog/PipelineCatalog";
import ComputeCatalog from "../../components/catalog/ComputeCatalog";
import "./CatalogPage.scss";
import { setSidebarActive } from "../../store/ui/actions";

const { Title: AntTitle, Paragraph } = Typography;

const CatalogPage = () => {
  const dispatch = useDispatch();
  React.useEffect(() => {
    document.title = "Analysis Catalog";
    dispatch(
      setSidebarActive({
        activeItem: "catalog",
      })
    );
  });

  const style = { fontSize: "1.15em" };
  return (
    <Wrapper>
      <PageSection variant="light">
        <AntTitle>Plugins and Workflows</AntTitle>
      </PageSection>
      <PageSection>
        <Paragraph style={style}>
          This page consistes of three main sections, listing availalbe{" "}
          <b>Plugins</b>, <b>Pipelines</b>, and <b>Compute</b>.
        </Paragraph>
        <Paragraph style={style}>
          Within ChRIS, <b>Plugins</b> are progams you can run and schedule -
          these are the core building blocks of ChRIS. Plugins are independent
          dockerized executables and ChRIS allows you to organize a set of
          plugins into a tree structure. In this tree, nodes correspond to
          plugins and data can be thought of as flowing along the branches from
          one plugin to its children. <b>Plugins</b> are usually
          installed/registered to ChRIS from a separate ChRIS store.
        </Paragraph>
        <Paragraph style={style}>
          A <b>Pipeline</b> (or <b>Workflow</b>) is a named grouping of{" "}
          <b>Plugins</b> that exists as a single entity. <b>Pipelines</b> allow
          for easily running a set or group of <b>Plugins</b> together as if
          they were one entity (such as anonymizing data <i>and then</i> then
          analyzing the results <i>and then</i> generating a report). All the{" "}
          <b>Plugins</b> and <b>Pipelines</b> available in this ChRIS are
          catalogued here. Currently, you can add new <b>Pipelines</b> to this
          ChRIS by uploading a JSON pipeline description (see{" "}
          <a href="https://github.com/FNNDSC/CHRIS_docs/tree/master/pipelines/source">
            here
          </a>{" "}
          for some examples). <b>Pipelines</b> are also available in the
          separate ChRIS store.
        </Paragraph>
        <Paragraph style={style}>
          The final section on this page presents the available <b>Compute</b>{" "}
          environments that are known to ChRIS. These denote computers and
          clusters/clouds that can be selected to run various <b>plugins</b> and{" "}
          <b>pipelines</b>. The special <b>host</b> environment is always
          available and is the actual server that is running ChRIS. It is
          generally not recommended to run intensive computation on the{" "}
          <b>host</b> environment. Adding new <b>Compute</b> to ChRIS is
          typically enabled by using the separate ChRIS admin interface.
        </Paragraph>
        <PluginCatalog />
      </PageSection>
      <PageSection>
        <PipelineCatalog />
      </PageSection>
      <PageSection>
        <ComputeCatalog />
      </PageSection>
    </Wrapper>
  );
};

export default CatalogPage;
