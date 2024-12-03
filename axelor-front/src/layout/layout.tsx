import { Outlet, useLocation } from "react-router-dom";

import { clsx, Box } from "@axelor/ui";

import { AlertsProvider } from "@/components/alerts";
import { DialogsProvider } from "@/components/dialogs";
import { HttpWatch } from "@/components/http-watch";
import { Loader } from "@/components/loader/loader";
import { useAppHead } from "@/hooks/use-app-head";
import { useMenu } from "@/hooks/use-menu";
import { PopupsProvider } from "@/view-containers/view-popup";

import { NavDrawer } from "./nav-drawer";
import { NavHeader } from "./nav-header";
import { NavTabs } from "./nav-tabs";
import { NavTags } from "./nav-tags";

// import global utils for external apps
import "../utils/globals";

import { useDevice, useResponsive } from "@/hooks/use-responsive";
import { MaterialIcon } from "@axelor/ui/icons/material-icon";
import { useState } from "react";
import styles from "./layout.module.scss";
import { useSidebar } from "./nav-drawer/hook";
import { CustomWidget } from "@/views/form/widgets";

export function Layout() {
  const { loading } = useMenu();
  const { show, sidebar, setSidebar } = useSidebar();
  const { xs } = useResponsive();
  const { isMobile } = useDevice();
  const { pathname } = useLocation();

  const [tabContainer, tabContainerRef] = useState<HTMLDivElement | null>(null);

  useAppHead();

  if (loading) {
    return (
      <Box d="flex" flexDirection="column" vh={100}>
        <Loader />
      </Box>
    );
  }

  const tabbable = pathname === "/" || pathname.startsWith("/ds/");
  const tabsPortal = isMobile || !tabbable ? null : tabContainer;

  return (
    <div className={clsx(styles.container)}>
      <div className={styles.header}>
        {xs && (
          <div className={styles.toggle} onClick={(e) => setSidebar(!sidebar)}>
            <MaterialIcon className={styles.toggleIcon} icon="menu" />
          </div>
        )}
        <div className={styles.tabsList} ref={tabContainerRef}></div>
        <NavHeader />
      </div>
      <div className={styles.sidebar}>
        <NavDrawer />
      </div>
      <div className={styles.content}>
        <div className={styles.tabs}>
          <NavTabs container={tabsPortal} />
          <div className={styles.page}>
            <Outlet />
          </div>
        </div>
      </div>
      <NavTags />
      <PopupsProvider />
      <DialogsProvider />
      <AlertsProvider />
      <HttpWatch />
      <CustomWidget />
    </div>
  );
}
