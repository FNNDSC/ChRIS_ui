import React from "react";

const UploadsBrowser = () => {
  React.useEffect(() => {
    async function fetchUploads() {
      console.log("Fetch Uploads");
    }

    fetchUploads();
  }, []);

  return <div>Uploads Browser</div>;
};

export default UploadsBrowser;
