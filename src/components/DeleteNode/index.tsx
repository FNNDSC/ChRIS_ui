// -------------------- 1) Imports --------------------

import type { Feed } from "@fnndsc/chrisapi";
import { Button, Modal, ModalVariant, Spinner } from "@patternfly/react-core";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import ChrisAPIClient from "../../api/chrisapiclient";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getNodeOperations } from "../../store/plugin/pluginSlice";
import { getSelectedPlugin } from "../../store/pluginInstance/pluginInstanceSlice";
import { Alert } from "../Antd";

// -------------------- 2) Props & Interfaces --------------------
interface DeleteNodeProps {
  feed?: Feed;
  removeNodeLocally?: (ids: number[]) => void;
}

// -------------------- 3) Component: DeleteNode --------------------
export default function DeleteNode({
  feed,
  removeNodeLocally,
}: DeleteNodeProps) {
  // --- Redux / Query-Client Hooks ---
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // --- Global Redux States ---
  const isModalOpen = useAppSelector(
    (state) => state.plugin.nodeOperations.deleteNode,
  );
  const { selectedPlugin } = useAppSelector((state) => state.instance);

  // -------------------- 4) Local State & Logic --------------------
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // We'll store the parent instance in local state, so we can select it
  // *after* the user closes the modal, preventing the "moving" modal content.
  const [parentToSelect, setParentToSelect] = useState<any | null>(null);

  const handleDelete = async () => {
    if (!selectedPlugin) return;

    setLoading(true);
    setError(null);

    try {
      // 1) Cancel if plugin not in terminal state
      const { previous_id: parentId, status } = selectedPlugin.data;
      if (
        !["finishedSuccessfully", "cancelled", "finishedWithError"].includes(
          status,
        )
      ) {
        await selectedPlugin.put({ status: "cancelled" });
      }

      // 2) Gather descendant IDs
      const resp = await selectedPlugin.getDescendantPluginInstances({
        limit: 10000,
      });
      const allDescendants = resp.getItems() || [];
      const allIdsToRemove = allDescendants.map((pi) => pi.data.id);

      // 3) Remove from local tree
      if (removeNodeLocally) {
        removeNodeLocally(allIdsToRemove);
      }

      // 4) If there's a parent, fetch it but *do not* select it yet.
      if (parentId && parentId > 0) {
        const client = ChrisAPIClient.getClient();
        const parentInst = await client.getPluginInstance(parentId);
        setParentToSelect(parentInst);
      }

      // 5) Delete plugin instance via axios
      const client = ChrisAPIClient.getClient();
      const token = client.auth.token;
      const pluginId = selectedPlugin.data.id;
      const deleteUrl = `${import.meta.env.VITE_CHRIS_UI_URL}plugins/instances/${pluginId}/`;

      await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // 6) Refetch your instance list
      await queryClient.refetchQueries({
        queryKey: ["instanceList", feed?.data.id],
        exact: true,
      });

      // 7) Indicate success
      setSuccess(true);

      // Optionally close after a short delay
      setTimeout(() => {
        handleModalClose();
      }, 200);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Called by the Close/Cancel buttons (or after success)
  const handleModalClose = () => {
    setLoading(false);
    setSuccess(false);
    setError(null);

    // 1) If we have a valid parent, select it *now* that the modal is closed
    if (parentToSelect) {
      dispatch(getSelectedPlugin(parentToSelect));
      setParentToSelect(null); // reset
    }

    // 2) Close the modal
    dispatch(getNodeOperations("deleteNode"));
  };

  // -------------------- 5) Render --------------------
  return (
    <Modal
      variant={ModalVariant.small}
      title="Delete Selected Node"
      description={
        selectedPlugin
          ? `You are about to delete "${selectedPlugin.data.title || selectedPlugin.data.plugin_name}" and its descendants. This action cannot be undone.`
          : "No node selected."
      }
      isOpen={isModalOpen}
      onClose={handleModalClose}
      actions={[
        <Fragment key="button-actions">
          <Button
            key="confirm"
            variant="primary"
            onClick={handleDelete}
            isDisabled={loading || success}
          >
            Confirm
          </Button>
          <Button key="cancel" variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
        </Fragment>,
      ]}
    >
      {loading && (
        <div
          style={{ marginTop: "1rem", display: "flex", alignItems: "center" }}
        >
          <Spinner size="lg" />
          <span style={{ marginLeft: "0.5rem" }}>Deleting...</span>
        </div>
      )}

      {error && (
        <Alert type="error" description={error} style={{ marginTop: "1rem" }} />
      )}

      {success && (
        <Alert
          type="success"
          description="Deleted Successfully"
          style={{ marginTop: "1rem" }}
        />
      )}
    </Modal>
  );
}
