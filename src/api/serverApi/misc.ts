import api from "../api";
import type { DownloadToken, Link } from "../types";

export const getLinkMap = (endpoint = "/") =>
  api<Link>({
    endpoint,
    isLink: true,
    query: { limit: 1 },
  });

export const createDownloadToken = () =>
  api<DownloadToken>({
    endpoint: "/downloadtokens/",
    method: "post",
    json: {
      template: {
        data: [],
      },
    },
  });
