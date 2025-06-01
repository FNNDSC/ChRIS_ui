// GnomeCentralBreadcrumb.tsx
import type React from "react";
import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
} from "@patternfly/react-core";
import {
  HomeIcon,
  EllipsisVIcon,
  FileUploadIcon,
  FolderIcon,
  TimesIcon,
} from "@patternfly/react-icons";
import {
  useFolderOperations,
  type ModalState,
} from "../NewLibrary/utils/useOperations";
import { AddModal } from "../NewLibrary/components/Operations";
import styles from "./gnome-central-breadcrumb.module.css";
import type { FileBrowserFolderList } from "@fnndsc/chrisapi";
import type { OriginState } from "../NewLibrary/context";

interface GnomeCentralBreadcrumbProps {
  path: string;
  username?: string | null;
  activeSidebarItem: string;
  onPathChange: (p: string) => void;
  origin: OriginState;
  computedPath: string;
  foldersList?: FileBrowserFolderList;
}

const GnomeCentralBreadcrumb: React.FC<GnomeCentralBreadcrumbProps> = ({
  path,
  username,
  activeSidebarItem,
  onPathChange,
  origin,
  computedPath,
  foldersList,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [value, setValue] = useState(path);
  const breadcrumbContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = breadcrumbContainerRef;
  const el = scrollRef.current!;
  const [overflowing, setOverflowing] = useState(false);

  // derive path segments
  const segmentsFull =
    path !== "/" ? path.replace(/^\/+|\/+$/g, "").split("/") : [];
  const anchorIndex = segmentsFull.findIndex(
    (s) => s.toLowerCase() === activeSidebarItem.toLowerCase(),
  );
  const segments =
    anchorIndex >= 0 ? segmentsFull.slice(anchorIndex) : segmentsFull;

  const {
    fileInputRef,
    folderInputRef,
    handleFileChange,
    handleFolderChange,
    modalState,
    handleOperations,
    handleModalSubmitMutation,
    contextHolder,
    setModalState,
  } = useFolderOperations(origin, computedPath || "", foldersList, false);

  // Sync input value when path changes
  useEffect(() => {
    if (!isEditing) setValue(path);
  }, [path, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      const el = inputRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [isEditing]);

  // Detect overflow
  useEffect(() => {
    if (!el) return;
    const checkOverflow = () => setOverflowing(el.scrollWidth > el.clientWidth);
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [el]);

  // Always scroll to the right end when path changes
  useEffect(() => {
    const container = breadcrumbContainerRef.current;
    if (container && !isEditing) {
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    }
  }, [isEditing]);

  const commitPathEdit = () => {
    const cleaned = value.trim().replace(/^\/+|\/+$/g, "");
    onPathChange(cleaned ? `/${cleaned}` : "/");
    setEditing(false);
  };

  const cancelPathEdit = () => {
    setValue(path);
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitPathEdit();
    if (e.key === "Escape") cancelPathEdit();
  };

  const handleUploadFile = () => {
    fileInputRef.current?.click();
    setIsMenuOpen(false);
  };

  const handleUploadFolder = () => {
    folderInputRef.current?.click();
    setIsMenuOpen(false);
  };

  const onToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isHome = activeSidebarItem.toLowerCase() === "home";

  return (
    <>
      {contextHolder}
      <AddModal
        modalState={modalState as ModalState}
        onClose={() => {
          handleModalSubmitMutation.reset();
          setModalState({ isOpen: false, type: "" });
        }}
        onSubmit={(value, extra) =>
          handleModalSubmitMutation.mutate({
            inputValue: value,
            additionalValues: extra,
          })
        }
        indicators={{
          isPending: handleModalSubmitMutation.isPending,
          isError: handleModalSubmitMutation.isError,
          error: handleModalSubmitMutation.error,
          clearErrors: () => handleModalSubmitMutation.reset(),
        }}
      />

      <input
        ref={fileInputRef}
        type="file"
        hidden
        multiple
        onChange={handleFileChange}
      />
      <input
        ref={folderInputRef}
        type="file"
        hidden
        //@ts-ignore
        webkitdirectory=""
        directory=""
        onChange={handleFolderChange}
      />

      <div className={styles.centralBreadcrumbContainer}>
        <div className={styles.breadcrumbBox}>
          {!isEditing && overflowing && (
            <Button
              className={styles.ellipsisButton}
              variant="plain"
              onClick={() => {
                const el = scrollRef.current!;
                el.scrollTo({ left: 0, behavior: "smooth" });
              }}
              aria-label="Scroll to start of path"
            >
              <EllipsisVIcon />
            </Button>
          )}

          {isEditing ? (
            <div className={styles.editContainer}>
              <input
                ref={inputRef}
                className={styles.pathInput}
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={commitPathEdit}
              />
              <Button
                className={styles.cancelEditButton}
                variant="plain"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  cancelPathEdit();
                }}
                aria-label="Cancel editing"
              >
                <TimesIcon />
              </Button>
            </div>
          ) : (
            <>
              <div
                className={styles.breadcrumbScrollContainer}
                ref={breadcrumbContainerRef}
                onClick={() => setEditing(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    setEditing(true);
                  }
                }}
                aria-label="Edit path"
              >
                <Breadcrumb className={styles.breadcrumb}>
                  {isHome && (
                    <BreadcrumbItem
                      className={styles.crumbLink}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPathChange(`/home/${username ?? ""}`);
                      }}
                    >
                      <span className={styles.homeIconWrapper}>
                        <HomeIcon className={styles.icon} />
                        <span className={styles.homeText}>home</span>
                      </span>
                    </BreadcrumbItem>
                  )}

                  {segments.slice(isHome ? 1 : 0).map((seg, idx) => {
                    const origIdx = anchorIndex + idx;
                    const subPath = `/${segmentsFull.slice(0, origIdx + 1).join("/")}`;
                    return (
                      <BreadcrumbItem
                        key={seg + idx}
                        className={styles.crumbLink}
                        onClick={(e) => {
                          e.stopPropagation();
                          onPathChange(subPath);
                        }}
                      >
                        {seg}
                      </BreadcrumbItem>
                    );
                  })}
                </Breadcrumb>
              </div>

              <div className={styles.actionsContainer}>
                <Dropdown
                  isOpen={isMenuOpen}
                  onSelect={() => setIsMenuOpen(false)}
                  popperProps={{
                    appendTo: () => document.body,
                    position: "right",
                  }}
                  toggle={(toggleRef) => (
                    <MenuToggle
                      ref={toggleRef}
                      variant="plain"
                      onClick={onToggleMenu}
                      isExpanded={isMenuOpen}
                    >
                      <EllipsisVIcon />
                    </MenuToggle>
                  )}
                >
                  <DropdownList>
                    <DropdownItem
                      icon={<FolderIcon />}
                      key="new-folder"
                      onClick={() => {
                        handleOperations("newFolder");
                        setIsMenuOpen(false);
                      }}
                    >
                      New Folder
                    </DropdownItem>
                    <DropdownItem
                      icon={<FileUploadIcon />}
                      key="file-upload"
                      onClick={handleUploadFile}
                    >
                      File upload
                    </DropdownItem>
                    <DropdownItem
                      icon={<FolderIcon />}
                      key="folder-upload"
                      onClick={handleUploadFolder}
                    >
                      Folder upload
                    </DropdownItem>
                  </DropdownList>
                </Dropdown>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default GnomeCentralBreadcrumb;
