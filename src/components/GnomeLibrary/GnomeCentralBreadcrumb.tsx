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

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const [value, setValue] = useState(normalizedPath);

  const breadcrumbContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = breadcrumbContainerRef;
  const [overflowing, setOverflowing] = useState(false);

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

  useEffect(() => {
    if (!isEditing) {
      const withSlash = path.startsWith("/") ? path : `/${path}`;
      setValue(withSlash);
    }
  }, [path, isEditing]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const el = inputRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [isEditing]);

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

  const buildSubPath = (idx: number) => {
    return "/" + segmentsFull.slice(0, idx + 1).join("/");
  };

  const truncateMiddle = (text: string, maxLength = 35) => {
    if (text.length <= maxLength) return text;

    // Check for common file extensions and preserve them
    const match = text.match(/^(.+?)(\.[^.]+)$/);
    if (match) {
      const [, name, extension] = match;

      // If the name without extension is still too long, truncate the middle of the name
      if (name.length + extension.length > maxLength) {
        const ellipsis = "...";
        const availableChars = maxLength - extension.length - ellipsis.length;

        if (availableChars <= 0) {
          // If extension is very long, just truncate the whole thing
          return truncateMiddle(text, maxLength);
        }

        // Show more of the front part (75% front, 25% back)
        const frontChars = Math.ceil(availableChars * 0.75);
        const backChars = Math.floor(availableChars * 0.25);

        if (backChars <= 0) {
          return `${name.substring(0, frontChars)}${ellipsis}${extension}`;
        }

        return `${name.substring(0, frontChars)}${ellipsis}${name.substring(name.length - backChars)}${extension}`;
      }
      return text;
    }

    // No extension found, do simple middle truncation
    const ellipsis = "...";
    const charsToShow = maxLength - ellipsis.length;

    // Show more characters from the beginning (70%) than the end (30%)
    const frontChars = Math.ceil(charsToShow * 0.7);
    const backChars = Math.floor(charsToShow * 0.3);

    return `${text.substring(0, frontChars)}${ellipsis}${text.substring(text.length - backChars)}`;
  };

  const renderSegment = (seg: string, idx: number) => (
    <BreadcrumbItem
      key={`${seg}-${idx}`}
      className={styles.crumbLink}
      onClick={(e) => {
        e.stopPropagation();
        onPathChange(buildSubPath(idx));
      }}
      title={seg} // Show full name on hover
    >
      {truncateMiddle(seg)}
    </BreadcrumbItem>
  );

  const renderHomeSegment = (seg: string, idx: number) => (
    <BreadcrumbItem
      key={`${seg}-${idx}`}
      className={styles.crumbLink}
      onClick={(e) => {
        e.stopPropagation();
        onPathChange(buildSubPath(idx));
      }}
    >
      <span className={styles.homeIconWrapper}>
        <HomeIcon className={styles.icon} /> <span>home</span>
      </span>
    </BreadcrumbItem>
  );

  const renderBreadcrumbItems = () => {
    const total = segmentsFull.length;

    if (total === 0) {
      return null;
    }

    if (total <= 4) {
      return segmentsFull.map((seg, idx) => {
        if (seg.toLowerCase() === "home" && idx === 0) {
          return renderHomeSegment(seg, idx);
        }
        return renderSegment(seg, idx);
      });
    }

    const items: React.ReactNode[] = [];

    const firstSeg = segmentsFull[0];
    if (firstSeg.toLowerCase() === "home") {
      items.push(renderHomeSegment(firstSeg, 0));
    } else {
      items.push(renderSegment(firstSeg, 0));
    }

    items.push(renderSegment(segmentsFull[1], 1));

    items.push(
      <BreadcrumbItem key="ellipsis" isActive={false}>
        <span className={styles.ellipsisText}>&hellip;</span>
      </BreadcrumbItem>,
    );

    items.push(renderSegment(segmentsFull[total - 2], total - 2));
    items.push(renderSegment(segmentsFull[total - 1], total - 1));

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
