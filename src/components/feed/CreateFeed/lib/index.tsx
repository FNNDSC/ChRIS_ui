import React from "react";

function ErrorMessage({ error }: any) {
  return (
    <div
      role="alert"
      style={{
        color: "red",
      }}
    >
      <span>There was an error:</span>
      <pre
        style={{
          whiteSpace: "break-spaces",
          margin: "0",
          marginBottom: -5,
        }}
      >
        {error.message && error.message}
      </pre>
    </div>
  );
}

export { ErrorMessage };
