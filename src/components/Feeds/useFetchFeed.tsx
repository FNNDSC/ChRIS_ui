import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Feed } from "@fnndsc/chrisapi";
import { fetchAuthenticatedFeed, fetchPublicFeed } from "./utilties";
import { notification } from "../Antd";

export const useFetchFeed = (
  id: string | undefined,
  type: string | null,
  isLoggedIn?: boolean,
) => {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const { data: publicFeed, isError: isPublicFeedError } = useQuery({
    queryKey: ["publicFeed", id],
    queryFn: () => fetchPublicFeed(id),
    enabled: type === "public",
  });

  const {
    data: privateFeed,
    isError: isPrivateFeedError,
    error: privateFeedError,
  } = useQuery({
    queryKey: ["authenticatedFeed", id],
    queryFn: () => fetchAuthenticatedFeed(id),
    enabled: type === "private" && isLoggedIn,
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

  const feed: Feed | undefined = privateFeed || publicFeed;

  return {
    feed,
    isError: isPrivateFeedError || isPublicFeedError,
    contextHolder,
  };
};
