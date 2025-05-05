# 043025-coding-test

This project presents the hierarchy of people based on management relationship.

## Calculation of Values

The values—namely, the number of descendants, management cost, individual contributor cost, and total cost—are computed using post-order traversal to optimize calculations along each path.

## UI

This project implements an interactive hierarchical interface using Vue.js and Tailwind CSS, as specified. 

- When the graph fits within the window dimensions, it is centered automatically; otherwise, scroll bars are provided to navigate the overflow area.

- To improve performance, expanding a node reveals its immediate children rather than the entire subtree.

- In the dataset, job titles can be long. An adaptive interactive design `Typography.vue` is used to handle this. If the job title exceeds a single line, it is truncated with an ellipsis. Hovering over the truncated text displays the full title in a tooltip.

- The visual animation effect has been refined to provide smoother transitions when node positions change due to tree expansion or collapse.

<!-- ## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/). -->

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Compile and Minify for Production

```sh
yarn build
```
