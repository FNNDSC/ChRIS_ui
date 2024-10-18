import { useAppSelector } from "../../store/hooks";

const usePluginInstanceResource = () => {
  const selectedPlugin = useAppSelector(
    (state) => state.instance.selectedPlugin,
  );
  const pluginInstancePayload = useAppSelector(
    (state) => state.resource.pluginInstanceResource,
  );

  const id = selectedPlugin?.data.id;
  const pluginInstanceResource =
    pluginInstancePayload && id && pluginInstancePayload[id];
  return pluginInstanceResource;
};

export default usePluginInstanceResource;
