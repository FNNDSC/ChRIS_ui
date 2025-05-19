import {
  Breadcrumb,
  BreadcrumbItem,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from "@patternfly/react-core";
import type React from "react";
import {
  type KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { HomeIcon } from "../Icons";
import styles from "./gnome.module.css";

interface Props {
  path: string;
  username?: string | null;
  activeSidebarItem: string; // "home", "PUBLIC", "SHARED", "SERVICES"
  onPathChange: (p: string) => void;
}

const GnomeBreadcrumb: React.FC<Props> = ({
  path,
  username,
  activeSidebarItem,
  onPathChange,
}) => {
  const [isEditing, setEditing] = useState(false);
  const [value, setValue] = useState(path);
  const [rowHeight, setRowHeight] = useState<number>();

  const crumbRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* sync value when path changes */
  useEffect(() => {
    if (!isEditing) setValue(path);
  }, [path, isEditing]);

  /* measure row height once */
  useLayoutEffect(() => {
    if (!rowHeight && crumbRef.current)
      setRowHeight(crumbRef.current.offsetHeight);
  }, [rowHeight]);

  /* focus caret on edit */
  useLayoutEffect(() => {
    if (isEditing && inputRef.current) {
      const el = inputRef.current;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  }, [isEditing]);

  /* handlers */
  const commit = () => {
    const cleaned = value.trim().replace(/^\/+|\/+$/g, "");
    onPathChange(cleaned ? `/${cleaned}` : "/");
    setEditing(false);
  };
  const cancel = () => {
    setValue(path);
    setEditing(false);
  };
  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") cancel();
  };

  /* derive segments starting at active sidebar section */
  const segmentsFull =
    path !== "/" ? path.replace(/^\/+|\/+$/g, "").split("/") : [];
  const anchorIndex = segmentsFull.findIndex(
    (s) => s.toLowerCase() === activeSidebarItem.toLowerCase(),
  );
  const segments =
    anchorIndex >= 0 ? segmentsFull.slice(anchorIndex) : segmentsFull;

  const isHome = activeSidebarItem.toLowerCase() === "home";

  /* build breadcrumb */
  const breadcrumb = (
    <div ref={crumbRef} style={{ height: rowHeight }}>
      <Breadcrumb className={styles.breadcrumb}>
        {isHome && (
          <BreadcrumbItem
            className={styles.crumbLink}
            onClick={() => onPathChange(`/home/${username ?? ""}`)}
          >
            <span className={styles.homeIconWrapper}>
              <HomeIcon className={styles.icon} />
              <span className={styles.homeText}>home</span>
            </span>
          </BreadcrumbItem>
        )}

        {segments.slice(isHome ? 1 : 0).map((seg, idx) => {
          const last = idx === segments.slice(isHome ? 1 : 0).length - 1;
          const origIdx = anchorIndex + idx; // position in full path
          const subPath = `/${segmentsFull.slice(0, origIdx + 1).join("/")}`;
          return (
            <BreadcrumbItem
              key={seg + idx}
              className={styles.crumbLink}
              onClick={() => (last ? setEditing(true) : onPathChange(subPath))}
            >
              {seg}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </div>
  );

  return (
    <Toolbar
      inset={{ default: "insetNone" }}
      className={styles.toolbar}
      style={{ height: rowHeight }}
    >
      <ToolbarContent
        className={styles.toolbarContent}
        style={{ height: rowHeight }}
      >
        <ToolbarItem className={styles.toolbarItem}>
          {isEditing ? (
            <input
              ref={inputRef}
              className={`${styles.input} ${styles.fade}`}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKey}
              onBlur={cancel}
              style={{
                height: rowHeight,
                lineHeight: rowHeight ? `${rowHeight}px` : undefined,
              }}
            />
          ) : (
            breadcrumb
          )}
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};

export default GnomeBreadcrumb;
