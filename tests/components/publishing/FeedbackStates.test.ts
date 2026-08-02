import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";

import ContentList from "@/modules/publishing/views/ContentList.vue";
import ReviewQueue from "@/modules/publishing/views/ReviewQueue.vue";
import ScheduleView from "@/modules/publishing/views/ScheduleView.vue";

describe("D3 publishing feedback states", () => {
  it("does not leave a blank content list while loading or on failure", () => {
    const loading = mount(ContentList, { props: { loading: true, retry: vi.fn() } });
    expect(loading.get('[role="status"]').text()).toContain("Loading content");

    const failed = mount(ContentList, { props: { error: "Unable to load content.", retry: vi.fn() } });
    expect(failed.get('[role="alert"]').text()).toContain("Unable to load content.");
  });

  it("explains forbidden review access and empty schedules", () => {
    const forbidden = mount(ReviewQueue, { props: { forbidden: true, transition: vi.fn() } });
    expect(forbidden.text()).toContain("Permission required");

    const empty = mount(ScheduleView, { props: { schedules: [], createSchedule: vi.fn(), cancelSchedule: vi.fn() } });
    expect(empty.text()).toContain("No schedules");
  });
});
