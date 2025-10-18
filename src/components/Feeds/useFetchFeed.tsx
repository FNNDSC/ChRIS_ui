import type { Feed } from "@fnndsc/chrisapi";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { notification } from "../Antd";
import { fetchAuthenticatedFeed, fetchPublicFeed } from "./utilties";

export const useFetchFeed = (
  id: string | undefined,
  type: string | null,
  isLoggedIn?: boolean,
) => {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  // Convert id to number or undefined if it's not a valid number
  const numericId = id ? Number.parseInt(id, 10) : undefined;
  const isValidId = numericId !== undefined && !Number.isNaN(numericId);

  const { data: publicFeed, isError: isPublicFeedError } = useQuery({
    queryKey: ["publicFeed", id],
    queryFn: () => (isValidId ? fetchPublicFeed(numericId) : undefined),
    enabled: type === "public" && isValidId,
  });

  const {
    data: privateFeed,
    isError: isPrivateFeedError,
    error: privateFeedError,
  } = useQuery({
    queryKey: ["authenticatedFeed", id],
    queryFn: () => (isValidId ? fetchAuthenticatedFeed(numericId) : undefined),
    enabled: type === "private" && isLoggedIn && isValidId,
  });

  useEffect(() => {
    if (!type || (type === "private" && !isLoggedIn)) {
      const redirectTo = encodeURIComponent(window.location.href);
      navigate(`/login?redirectTo=${redirectTo}`);
    }
  }, [type, isLoggedIn, navigate]);

  useEffect(() => {
    if (isPrivateFeedError) {
      api.error({
        message:
          privateFeedError?.message || "Failed to load the private feed.",
        duration: 1.5,
      });
      const timer = setTimeout(() => {
        navigate("/feeds?type=private");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isPrivateFeedError, privateFeedError, api, navigate]);

  // Handle invalid IDs
  useEffect(() => {
    if (id && !isValidId) {
      api.error({
        message: "Invalid feed ID. Redirecting to feeds list.",
        duration: 1.5,
      });
      const timer = setTimeout(() => {
        navigate(type ? `/feeds?type=${type}` : "/feeds?type=private");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [id, isValidId, api, navigate, type]);

  const feed: Feed | undefined = privateFeed || publicFeed;

  return {
    feed,
    isError: isPrivateFeedError || isPublicFeedError,
    contextHolder,
  };
};
