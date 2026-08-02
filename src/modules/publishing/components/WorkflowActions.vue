<script setup lang="ts">
import type { WorkflowRequest } from "@/modules/publishing/api/workflow.client";

const props = withDefaults(defineProps<{
  actions?: readonly WorkflowRequest["action"][];
  disabled?: boolean;
  labelPrefix?: string;
}>(), {
  actions: () => ["submit_review", "approve", "publish", "schedule", "archive"],
  disabled: false,
  labelPrefix: "Workflow",
});

const emit = defineEmits<{
  action: [value: WorkflowRequest["action"]];
}>();

const labels: Record<WorkflowRequest["action"], string> = {
  submit_review: "Submit for review",
  approve: "Approve",
  publish: "Publish",
  schedule: "Schedule",
  archive: "Archive",
};
</script>

<template>
  <div
    class="workflow-actions"
    aria-label="Publishing workflow actions"
  >
    <button
      v-for="action in props.actions"
      :key="action"
      type="button"
      :aria-label="`${labels[action]} ${labelPrefix}`"
      :disabled="disabled"
      @click="emit('action', action)"
    >
      {{ labels[action] }}
    </button>
  </div>
</template>

<style scoped>
.workflow-actions { display: flex; flex-wrap: wrap; gap: .5rem; }
button { min-height: 2.75rem; padding: .55rem .8rem; border: 1px solid #aeb9c9; border-radius: .55rem; color: #172033; background: white; cursor: pointer; font: inherit; font-weight: 750; }
button:disabled { cursor: wait; opacity: .55; }
button:focus-visible { outline: 3px solid #60a5fa; outline-offset: 2px; }
</style>
