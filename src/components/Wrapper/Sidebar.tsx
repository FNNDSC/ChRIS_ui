import {
  Brand,
  Nav,
  NavExpandable,
  NavGroup,
  NavItem,
  NavList,
  PageSidebar,
  PageSidebarBody,
} from "@patternfly/react-core";
import { type DefaultError, useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import brandImg from "../../assets/logo_chris_dashboard.png";
import { useAppSelector } from "../../store/hooks";
import type { IUiState } from "../../store/ui/uiSlice";
import { type IUserState, Role } from "../../store/user/userSlice";
import { AddModal } from "../NewLibrary/components/Operations";
import UploadData from "../NewLibrary/components/operations/UploadData";
import { OperationContext } from "../NewLibrary/context";
import { useFolderOperations } from "../NewLibrary/utils/useOperations";
import styles from "./Sidebar.module.css";

type Props = IUiState & IUserState;

type TagInfo = {
  title?: string;
};

export default (props: Props) => {
  const queryClient = useQueryClient();
  const {
    sidebarActiveItem,
    isNavOpen,
    isTagExpanded,
    isPackageTagExpanded,
    onTagToggle,
    onPackageTagToggle,
  } = props;

  const role = useAppSelector((state) => state.user.role);

  const onSelect = (
    _event: React.FormEvent<HTMLInputElement>,
    selectedItem: any,
  ) => {
    const { itemId } = selectedItem;
    // Invalidate feeds if "analyses" is selected
    if (itemId === "analyses") {
      queryClient.refetchQueries({
        queryKey: ["feeds"], // This assumes your query key for feeds is ["feeds"]
      });
    }
  };

  const renderLink = (to: string, label: string, itemId: string) =>
    sidebarActiveItem === itemId ? (
      <span style={{ color: "#ffffff" }}>{label}</span>
    ) : (
      <Link to={to}>
        <span style={{ color: "#aaaaaa" }}>{label}</span>
      </Link>
    );

  const renderTag = (
    tag: TagInfo,
    idx: number,
    onClick: (e: FormEvent) => void,
    prefix: string,
  ) => {
    if (typeof tag.title === "undefined") {
      return (
        <NavItem key={prefix + "tag-more"} itemId="tag-more" onClick={onClick}>
          <span style={{ color: "#aaaaaa" }}>(more)</span>
        </NavItem>
      );
    }

    const tagIdx = `tag${idx}`;

    const tagLink = tag.title === "(none)" ? "" : `/${tag.title}`;

    return (
      <NavItem
        key={prefix + tagIdx}
        itemId={tagIdx}
        isActive={sidebarActiveItem === tagIdx}
      >
        {renderLink(`/${prefix}${tagLink}`, tag.title, tagIdx)}
      </NavItem>
    );
  };

  const renderTags = () => {
    const tagList: TagInfo[] = [
      { title: "(none)" },
      { title: "uploaded" },
      { title: "public" },
      { title: "pacs" },
    ];
    if (!isTagExpanded) {
      tagList.push({});
    }

    console.info(
      "renderTags: isTagExpanded:",
      isTagExpanded,
      "tagList",
      tagList,
    );

    return (
      <>
        {tagList.map((each, idx) => renderTag(each, idx, onTagToggle, "tag"))}
      </>
    );
  };

  const renderPackageTags = () => {
    const tagList: TagInfo[] = [{ title: "imported" }, { title: "composite" }];
    if (!isPackageTagExpanded) {
      tagList.push({});
    }

    return (
      <>
        {tagList.map((each, idx) =>
          renderTag(each, idx, onPackageTagToggle, "packagetag"),
        )}
      </>
    );
  };

  const origin = {
    type: OperationContext.FEEDS,
    additionalKeys: [],
  };

  const {
    modalState,
    folderInputRef,
    fileInputRef,
    createFeedWithFile,
    handleModalSubmitMutation,
    handleOperations,
    setModalState,
  } = useFolderOperations(origin, undefined, undefined, true);

  const uploadDataColor =
    sidebarActiveItem === "uploadData" ? "#ffffff" : "#aaaaaa";

  // only the admin can import package.
  const classNameImportPackage = role === Role.Admin ? undefined : styles.hide;
  // only the clinician cannot compose package.
  const classNameComposePackage =
    role === Role.Clinician ? styles.hide : undefined;

  return (
    <PageSidebar isSidebarOpen={isNavOpen}>
      <PageSidebarBody>
        <div className={styles["page-sidebar"]}>
          <div className={styles.nav}>
            {" "}
            <Nav onSelect={onSelect} aria-label="ChRIS Demo site navigation">
              <NavList>
                <NavItem
                  key="overview"
                  itemId="overview"
                  isActive={sidebarActiveItem === "overview"}
                >
                  {renderLink("/", "Overview", "overview")}
                </NavItem>
                <NavGroup key="theData" title="Data">
                  <NavItem
                    key="data"
                    itemId="data"
                    isActive={sidebarActiveItem === "data"}
                  >
                    {renderLink("/data", "My Data", "data")}
                  </NavItem>
                  <NavItem
                    key="shared"
                    itemId="shared"
                    isActive={sidebarActiveItem === "shared"}
                  >
                    {renderLink("/shared", "Shared Data", "shared")}
                  </NavItem>

                  <NavItem
                    key="lib"
                    itemId="lib"
                    isActive={sidebarActiveItem === "lib"}
                  >
                    {renderLink("/library", "Library", "lib")}
                  </NavItem>

                  <NavExpandable
                    key="tags"
                    title="Tags"
                    buttonProps={{ className: styles["tags-expand"] }}
                    isExpanded={true}
                  >
                    {renderTags()}
                  </NavExpandable>

                  <NavItem
                    key="uploadData"
                    itemId="uploadData"
                    isActive={sidebarActiveItem === "uploadData"}
                  >
                    <UploadData
                      handleOperations={handleOperations}
                      isSidebar={true}
                      buttonColor={uploadDataColor}
                    />
                  </NavItem>

                  <NavItem
                    key="pacs"
                    itemId="pacs"
                    isActive={sidebarActiveItem === "pacs"}
                  >
                    {renderLink("/pacs", "Query and Retrieve PACS", "pacs")}
                  </NavItem>
                </NavGroup>
                <NavGroup key="packages" title="Packages">
                  <NavItem
                    key="package"
                    itemId="package"
                    isActive={sidebarActiveItem === "package"}
                  >
                    {renderLink("/package", "Browse Packages", "catalog")}
                  </NavItem>

                  <NavExpandable
                    key="packageTags"
                    title="Tags"
                    buttonProps={{ className: styles["tags-expand"] }}
                    isExpanded={true}
                  >
                    {renderPackageTags()}
                  </NavExpandable>

                  {!isEmpty(import.meta.env.VITE_CHRIS_STORE_URL) && (
                    <NavItem
                      key="store"
                      itemId="store"
                      isActive={sidebarActiveItem === "store"}
                      className={classNameImportPackage}
                    >
                      {renderLink("/import", "Import Package", "store")}
                    </NavItem>
                  )}
                  <NavItem
                    key="compose"
                    itemId="compose"
                    isActive={sidebarActiveItem === "compose"}
                    className={classNameComposePackage}
                  >
                    {renderLink("/compose", "Compose Package", "compose")}
                  </NavItem>
                </NavGroup>
              </NavList>
            </Nav>
            <AddModal
              modalState={modalState}
              onClose={() => {
                handleModalSubmitMutation.reset();
                setModalState({ isOpen: false, type: "" });
              }}
              onSubmit={(inputValue, additionalValues) =>
                handleModalSubmitMutation.mutate({
                  inputValue,
                  additionalValues,
                })
              }
              indicators={{
                isPending: handleModalSubmitMutation.isPending,
                isError: handleModalSubmitMutation.isError,
                error: handleModalSubmitMutation.error as DefaultError,
                clearErrors: () => handleModalSubmitMutation.reset(),
              }}
            />
            <input
              ref={fileInputRef}
              multiple
              type="file"
              hidden
              onChange={(e) => {
                createFeedWithFile(e, "file");
              }}
            />
            <input
              ref={folderInputRef}
              type="file"
              hidden
              //@ts-ignore
              webkitdirectory=""
              directory=""
              onChange={(e) => {
                createFeedWithFile(e, "folder");
              }}
            />
          </div>

          <div className={styles.brand}>
            <Brand src={brandImg} alt="ChRIS Logo" />
          </div>
        </div>
      </PageSidebarBody>
    </PageSidebar>
  );
};
