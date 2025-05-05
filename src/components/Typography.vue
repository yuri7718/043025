<template>
  <div
    class="relative w-full inline-block"
    @mouseenter="checkOverflow"
    @mouseleave="showTooltip = false"
  >
    <p ref="textRef" class="overflow-hidden text-ellipsis whitespace-nowrap" :class="customClass">
      <slot>{{ text }}</slot>
    </p>
  
    <div
      v-if="showTooltip"
      class="absolute top-0 border rounded-lg border-gray-300 bg-white px-2 z-10"
      :class="customClass"
    >
      <slot>{{ text }}</slot>
    </div>
  </div>
</template>
  
<script setup>
  import { ref, watch } from 'vue';
  
  const props = defineProps({
    text: String,
    class: {
      type: String,
      default: ''
    }
  });

  const customClass = props.class;

  const textRef = ref(null);
  const showTooltip = ref(false);

  watch(() => props.text, () => {
    showTooltip.value = false;
  });
  
  function checkOverflow() {
    if (!textRef.value) return;
    showTooltip.value = textRef.value.scrollWidth > textRef.value.offsetWidth;
  }
</script>
  