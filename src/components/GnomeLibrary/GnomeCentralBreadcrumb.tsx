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

  onPathChange: (p: string) => void;
  origin: OriginState;
  foldersList?: FileBrowserFolderList;
}

const GnomeCentralBreadcrumb: React.FC<GnomeCentralBreadcrumbProps> = ({
  path,

  onPathChange,
  origin,
  foldersList,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setEditing] = useState(false);

  // Ensure `value` always starts with a single leading slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const [value, setValue] = useState(normalizedPath);

  const breadcrumbContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = breadcrumbContainerRef;
  const [overflowing, setOverflowing] = useState(false);

  // Trim leading/trailing slashes, then split into segments
  const trimmed = normalizedPath.replace(/^\/+|\/+$/g, "");
  const segmentsFull = trimmed ? trimmed.split("/") : [];

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
  } = useFolderOperations(origin, path || "", foldersList, false);

  // Sync input when `path` prop changes (unless editing)
  useEffect(() => {
    if (!isEditing) {
      const withSlash = path.startsWith("/") ? path : `/${path}`;
      setValue(withSlash);
    }
  }, [path, isEditing]);

  // Auto-focus the input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      const el = inputRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [isEditing]);

  // Detect overflow on the breadcrumb container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const checkOverflow = () => {
      setOverflowing(el.scrollWidth > el.clientWidth);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [scrollRef]);

  // Scroll to the far right when `path` changes (unless editing)
  useEffect(() => {
    const container = breadcrumbContainerRef.current;
    if (container && !isEditing) {
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    }
  }, [isEditing]);

  const commitPathEdit = () => {
    // Strip leading/trailing slashes and re-add exactly one leading slash
    const cleaned = value.trim().replace(/^\/+|\/+$/g, "");
    onPathChange(cleaned ? `/${cleaned}` : "/");
    setEditing(false);
  };

  const cancelPathEdit = () => {
    // Revert `value` to the normalized `path` prop
    const withSlash = path.startsWith("/") ? path : `/${path}`;
    setValue(withSlash);
    setEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      commitPathEdit();
    }
    if (e.key === "Escape") {
      cancelPathEdit();
    }
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
    setIsMenuOpen((open) => !open);
  };

  // Helper: build subpath up to a given index
  const buildSubPath = (idx: number) => {
    return "/" + segmentsFull.slice(0, idx + 1).join("/");
  };

  // Breadcrumb clipping logic: if > 4 segments, show first 2, ellipsis, last 2
  const renderBreadcrumbItems = () => {
    const total = segmentsFull.length;

    // If 4 or fewer segments, show all
    if (total <= 4) {
      return segmentsFull.map((seg, idx) => (
        <BreadcrumbItem
          key={`${seg}-${idx}`}
          className={styles.crumbLink}
          onClick={(e) => {
            e.stopPropagation();
            onPathChange(buildSubPath(idx));
          }}
        >
          {seg.toLowerCase() === "home" ? (
            <span className={styles.homeIconWrapper}>
              <HomeIcon className={styles.icon} /> <span>home</span>
            </span>
          ) : (
            seg
          )}
        </BreadcrumbItem>
      ));
    }

    // More than 4 segments: show first two, ellipsis, last two
    const items: React.ReactNode[] = [];

    // First segment
    items.push(
      <BreadcrumbItem
        key={`${segmentsFull[0]}-0`}
        className={styles.crumbLink}
        onClick={(e) => {
          e.stopPropagation();
          onPathChange(buildSubPath(0));
        }}
      >
        {segmentsFull[0].toLowerCase() === "home" ? (
          <span className={styles.homeIconWrapper}>
            <HomeIcon className={styles.icon} /> <span>home</span>
          </span>
        ) : (
          segmentsFull[0]
        )}
      </BreadcrumbItem>,
    );

    // Second segment
    items.push(
      <BreadcrumbItem
        key={`${segmentsFull[1]}-1`}
        className={styles.crumbLink}
        onClick={(e) => {
          e.stopPropagation();
          onPathChange(buildSubPath(1));
        }}
      >
        {segmentsFull[1]}
      </BreadcrumbItem>,
    );

    // Ellipsis indicator (non-clickable)
    items.push(
      <BreadcrumbItem key="ellipsis" isActive={false}>
        <span className={styles.ellipsisText}>&hellip;</span>
      </BreadcrumbItem>,
    );

    // Second-to-last segment
    items.push(
      <BreadcrumbItem
        key={`${segmentsFull[total - 2]}-${total - 2}`}
        className={styles.crumbLink}
        onClick={(e) => {
          e.stopPropagation();
          onPathChange(buildSubPath(total - 2));
        }}
      >
        {segmentsFull[total - 2]}
      </BreadcrumbItem>,
    );

    // Last segment
    items.push(
      <BreadcrumbItem
        key={`${segmentsFull[total - 1]}-${total - 1}`}
        className={styles.crumbLink}
        onClick={(e) => {
          e.stopPropagation();
          onPathChange(buildSubPath(total - 1));
        }}
      >
        {segmentsFull[total - 1]}
      </BreadcrumbItem>,
    );

    return items;
  };

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
        // @ts-ignore
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
                  {renderBreadcrumbItems()}
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
