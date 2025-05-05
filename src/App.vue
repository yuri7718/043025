<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import * as d3 from 'd3';
import EmployeeCard from './components/EmployeeCard.vue';
import { formatFloat, generateAvatarLetters } from './helpers';
import { COLOR_PALETTE } from './constants';

const root = ref(null);
const nodes = ref([]);
const links = ref([]);
const animatedNodes = ref([]);

const visibleNodes = computed(() => nodes.value.filter(node => isVisible(node)));
const visibleLinks = computed(() => links.value.filter(link => isVisible(link.target)));

// color of EmployeeCard is defined by department
const deparments = {};

const divWidth = ref(0);
const divHeight = ref(0);

// EmployeeCard dimension
const cardWidth = 256;
const cardHeight = 320;

// padding between cards
const paddingX = 20;
const paddingY = 60;

const translateX = ref(0);

/**
 * Refines original d3 linkVertical function with better curve
 * @param link - d3 link object
 * @returns path
 */
function linkVertical(link) {
  
  const x = link.source.x + translateX.value + cardWidth / 2;
  const y = link.source.y + 320;
  const ex = link.target.x + translateX.value + cardWidth / 2;
  const ey = link.target.y;

  let xrvs = ex - x < 0 ? -1 : 1;
  let yrvs = ey - y < 0 ? -1 : 1;

  let rdef = 35;
  let r = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;

  r = Math.abs(ey - y) / 2 < r ? Math.abs(ey - y) / 2 : r;

  let h = Math.abs(ey - y) / 2 - r;
  let w = Math.abs(ex - x) - r * 2;

  const path = `
    M ${x} ${y}
    L ${x} ${y+h*yrvs}
    C ${x} ${y+h*yrvs+r*yrvs} ${x} ${y+h*yrvs+r*yrvs} ${x+r*xrvs} ${y+h*yrvs+r*yrvs}
    L ${x+w*xrvs+r*xrvs} ${y+h*yrvs+r*yrvs}
    C ${ex} ${y+h*yrvs+r*yrvs} ${ex} ${y+h*yrvs+r*yrvs} ${ex} ${ey-h*yrvs}
    L ${ex} ${ey}
  `;
  
  return path;
}

/**
 * Check whether a node is visible
 * @param node - d3 node object
 * @returns boolean
 */
function isVisible(node) {
  if (node.parent && node.parent.children === null) {
    return false;
  }
  return true;
}

/**
 * Expand or collapse the tree
 * @param node - d3 node object
 */
function update(node) {
  if (!node.children && !node._children) return;
  if (node.children) {
    node._children = node.children;
    node.children = null;
  } else {
    node.children = node._children;
    node._children = null;
    // only expand next level
    node.children.forEach(child => {
      if (child.children) {
        child._children = child.children;
        child.children = null;
      }
    })
  }
  updateLayout();
}

/**
 * Convert d3 stratified object to hierarchy and traverse the tree to add required values
 * @param data - d3 stratified object
 * @returns d3 hierarchy
 */
function initializeHierarchy(data) {
  const r = d3.hierarchy(data);
  
  let departmentIdx = 0
  r.eachAfter((d, i) => {
    d.id = i;
    if (!Object.keys(deparments).includes(d.data.data.Department)) {
      deparments[d.data.data.Department] = departmentIdx;
      departmentIdx++;
    }

    let nDescendants = 0;
    const salary = parseFloat(d.data.data.Salary);
    let totalCost = salary || 0;
    let ICCost = 0;
    let MCCost = 0;
    
    if (d.children) {
      for (const child of d.children) {
        nDescendants += 1 + (child.nDescendants || 0);
        ICCost += child.ICCost || 0;
        MCCost += child.MCCost || 0;
        totalCost += child.totalCost || 0;
      }
      MCCost += salary;
    } else {
      ICCost += salary;
    }

    d.nChildren = d.children ? d.children.length : 0;
    d.nDescendants = nDescendants;
    d.MCCost = MCCost;
    d.ICCost = ICCost;
    d.totalCost = totalCost;

    // only show the initial 2 layers
    if (d.depth >= 1 && d.children) {
      d._children = d.children;
      d.children = null;
    }
  });

  return r;
}

/**
 * Calcualte graph dimension and offset
 */
function updateLayout() {
  const tree = d3.tree().nodeSize([cardWidth + paddingX, cardHeight + paddingY]);
  tree(root.value);

  nodes.value = root.value.descendants();
  links.value = root.value.links();

  const xExtent = d3.extent(nodes.value, d => d.x);
  const yExtent = d3.extent(nodes.value, d => d.y);
  
  divWidth.value = xExtent[1] - xExtent[0] + cardWidth;
  divHeight.value = yExtent[1] - yExtent[0] + cardHeight;
  translateX.value = -xExtent[0];
}

/**
 * Initialize the data when DOM is mounted
 */
onMounted(async () => {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}Giga_Corp_40k.csv`);
    if (!response.ok) {
      throw new Error('Failed to load CSV file');
    }
    const text = await response.text();
    
    const table = d3.csvParse(text);
    const s = d3.stratify().id(d => d['Employee Id']).parentId(d => d['Manager'])(table);
    
    root.value = initializeHierarchy(s);
    updateLayout();
  } catch (error) {
    console.error(error);
  }
});

/**
 * Animate transition of nodes
 */
watch(visibleNodes, async (newNodes) => {
  animatedNodes.value = newNodes.map(node => {
    const parent = node.parent;
    return {
      original: node,
      animatedX: parent ? parent.x : node.x,
      animatedY: parent ? parent.y : node.y
    };
  });
  await nextTick();
  animatedNodes.value = newNodes.map(node => ({
    original: node,
    animatedX: node.x,
    animatedY: node.y
  }));
});
</script>

<template>
  <div class="w-screen h-screen table overflow-scroll">
    <div class="table-cell align-middle text-center">
      <div :style="`width: ${divWidth}'px'; height: ${divHeight}px`" class="relative inline-block mt-6">
        
        <!--links-->
        <svg :width="divWidth" :height="divHeight">
          <path
            v-for="(link, i) in visibleLinks"
            :key="`${link.source.id}-${link.target.id}`"
            :d="linkVertical(link)"
            stroke="gray"
            fill="none"
            class="transition-all duration-200"
          />
        </svg>
    
        <!--nodes-->
        <TransitionGroup name="card">
          <div
            v-for="(node, i) in animatedNodes"
            :key="node.original.id"
            class="absolute border border-gray-300 rounded-2xl transition-all duration-200"
            :style="`top: ${node.animatedY}px; left: ${node.animatedX+translateX}px; width: ${cardWidth}px; height: ${cardHeight}px`"
          >
            <EmployeeCard
              :onClick="() => update(node.original)"
              :color="COLOR_PALETTE[deparments[node.original.data.data.Department]]"
              :expanded="node.original.children ? true : false"
            >
              <template #abbreviation>{{ generateAvatarLetters(node.original.data.data.Name) }}</template>
              <template #name>{{ node.original.data.data.Name }}</template>
              <template #job-title>{{ node.original.data.data['Job Title'] }}</template>
              <template #department>{{ node.original.data.data['Department'] }}</template>
              <template #location>{{ node.original.data.data['Location'] }}</template>
              <template #level>{{ node.original.data.data['level'] }}</template>
              <template #mc-cost>{{ formatFloat(node.original.MCCost) }}</template>
              <template #ic-cost>{{ formatFloat(node.original.ICCost) }}</template>
              <template #total-cost>{{ formatFloat(node.original.totalCost) }}</template>
              <template #ratio>{{ Math.round(node.original.MCCost / node.original.totalCost * 100) / 100 }}</template>
              <template #n-children>{{ ` ${node.original.nChildren} / ${node.original.nDescendants}` }}</template>
            </EmployeeCard>
          </div>
        </TransitionGroup>
      </div>
    </div><!--end .table-cell-->
  </div><!--end .table-->
</template>
