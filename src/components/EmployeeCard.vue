<template>
  <div :class="['w-full h-full rounded-2xl flex flex-col items-center px-2 pt-4 pb-2', color.bgColor]">
    
    <!--Avatar-->
    <div class="absolute w-10 h-10 leading-10 text-white text-lg font-bold bg-sky-300 rounded-full -top-5">
      <slot name="abbreviation"></slot>
    </div>
    
    <!--Name-->
    <div class="text-center font-bold text-black"><slot name="name"></slot></div> 
    
    <!--Job Title-->
    <Typography class="text-gray-400">
      <template #default><slot name="job-title"></slot></template>
    </Typography>

    <!--tags-->
    <div class="flex-1 flex flex-col items-center gap-2">
      <div class="h-full flex flex-wrap justify-center content-around gap-2">
        <div :class="['text-black rounded-2xl px-2', color.departmentColor]"><slot name="department"></slot></div>
        <div :class="['text-black rounded-2xl px-2', color.tagColor]"><slot name="location"></slot></div>
        <div :class="['text-black rounded-2xl px-2', color.tagColor]">Level:&nbsp;<slot name="level"></slot></div>
        <div :class="['text-black rounded-2xl px-2', color.tagColor]">Management Cost:&nbsp;<slot name="mc-cost"></slot></div>
        <div :class="['text-black rounded-2xl px-2', color.tagColor]">IC cost:&nbsp;<slot name="ic-cost"></slot></div>
        <div :class="['text-black rounded-2xl px-2', color.tagColor]">Total Cost:&nbsp;<slot name="total-cost"></slot></div>
        <div :class="['text-black rounded-2xl px-2', color.tagColor]">Management cost ratio:&nbsp;<slot name="ratio"></slot></div>
      </div>

      <button @click="onClick" class="rounded-2xl px-2 inline-flex items-center bg-[#71717a] text-white hover:cursor-pointer">
        <span v-if="expanded" class="inline-flex items-center"><UpOutlined />&nbsp;</span>
        <span v-else class="inline-flex items-center"><DownOutlined />&nbsp;</span>
        <slot name="n-children"></slot>
      </button>
    </div>
  
  </div>
</template>

<script setup>
import { UpOutlined, DownOutlined } from '@ant-design/icons-vue';
import Typography from './Typography.vue';

defineProps({
  onClick: Function,
  color: Object,
  expanded: {
    type: Boolean,
    default: false
  }
});
</script>