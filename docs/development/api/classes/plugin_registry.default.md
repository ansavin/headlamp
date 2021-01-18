---
title: "Class: default"
linkTitle: "default"
slug: "plugin_registry.default"
---

[plugin/registry](../modules/plugin_registry.md).default

## Constructors

### constructor

\+ **new default**(): [*default*](plugin_registry.default.md)

**Returns:** [*default*](plugin_registry.default.md)

## Methods

### registerAppBarAction

▸ **registerAppBarAction**(`actionName`: *string*, `actionFunc`: (...`args`: *any*[]) => *null* \| *Element*): *void*

??

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`actionName` | *string* | ??   |
`actionFunc` | (...`args`: *any*[]) => *null* \| *Element* | ??    |

**Returns:** *void*

Defined in: plugin/registry.tsx:70

___

### registerDetailsViewHeaderAction

▸ **registerDetailsViewHeaderAction**(`actionName`: *string*, `actionFunc`: (...`args`: *any*[]) => *null* \| *Element*): *void*

??

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`actionName` | *string* | ??   |
`actionFunc` | (...`args`: *any*[]) => *null* \| *Element* | ??    |

**Returns:** *void*

Defined in: plugin/registry.tsx:58

___

### registerRoute

▸ **registerRoute**(`routeSpec`: Route): *void*

Add a Route for a component.

**`see`** [Route examples](https://github.com/kinvolk/headlamp/blob/master/frontend/src/lib/router.tsx)

#### Parameters:

Name | Type |
:------ | :------ |
`routeSpec` | Route |

**Returns:** *void*

Defined in: plugin/registry.tsx:49

___

### registerSidebarItem

▸ **registerSidebarItem**(`parentName`: *string*, `itemName`: *string*, `itemLabel`: *string*, `url`: *string*, `opts?`: { `useClusterURL`: *boolean* = true }): *void*

Add a SidebarItem.

**`example`** 

```javascript
registerSidebarItem('cluster', 'traces', 'Traces', '/traces');
```

#### Parameters:

Name | Type | Default value | Description |
:------ | :------ | :------ | :------ |
`parentName` | *string* | - | the name of the parent SidebarItem.   |
`itemName` | *string* | - | name of this SidebarItem.   |
`itemLabel` | *string* | - | label to display.   |
`url` | *string* | - | the URL to go to, when this item is followed.   |
`opts` | *object* | - | ... todo    |
`opts.useClusterURL` | *boolean* | true | - |

**Returns:** *void*

Defined in: plugin/registry.tsx:26
