import { Route } from '../lib/router';
import {
  setAppBarAction,
  setDetailsViewHeaderAction,
  setRoute,
  setSidebarItem,
} from '../redux/actions/actions';
import store from '../redux/stores/store';

export default class Registry {
  /**
   * Add a SidebarItem.
   *
   * @param parentName - the name of the parent SidebarItem.
   * @param itemName - name of this SidebarItem.
   * @param itemLabel - label to display.
   * @param url - the URL to go to, when this item is followed.
   * @param opts - ... todo
   *
   * @example
   *
   * ```javascript
   * registerSidebarItem('cluster', 'traces', 'Traces', '/traces');
   * ```
   */
  registerSidebarItem(
    parentName: string,
    itemName: string,
    itemLabel: string,
    url: string,
    opts = { useClusterURL: true }
  ) {
    store.dispatch(
      setSidebarItem({
        name: itemName,
        label: itemLabel,
        url,
        useClusterURL: !!opts.useClusterURL,
        parent: parentName,
      })
    );
  }

  /**
   * Add a Route for a component.
   *
   * @see {@link https://github.com/kinvolk/headlamp/blob/master/frontend/src/lib/router.tsx Route examples}
   */
  registerRoute(routeSpec: Route) {
    store.dispatch(setRoute(routeSpec));
  }

  /**
   * ??
   * @param actionName - ??
   * @param actionFunc - ??
   */
  registerDetailsViewHeaderAction(
    actionName: string,
    actionFunc: (...args: any[]) => JSX.Element | null
  ) {
    store.dispatch(setDetailsViewHeaderAction(actionName, actionFunc));
  }

  /**
   * ??
   * @param actionName - ??
   * @param actionFunc - ??
   */
  registerAppBarAction(actionName: string, actionFunc: (...args: any[]) => JSX.Element | null) {
    store.dispatch(setAppBarAction(actionName, actionFunc));
  }
}
