import {
  cancelPublishingSchedule,
  createPublishingSchedule,
  type PublishingSchedule,
  type ScheduleRequest,
} from "@/modules/publishing/api/schedules.client";
import { createPublishingContentSubmitter } from "@/modules/publishing/mutations/content.mutations";
import type { APIClient } from "@/shared/api/client";

export function createPublishingScheduleMutationOptions(client: APIClient) {
  const submitter = createPublishingContentSubmitter<ScheduleRequest, PublishingSchedule>(
    (input) => createPublishingSchedule(client, input),
  );
  return {
    retry: false as const,
    mutationFn: (input: ScheduleRequest) => submitter.submit(input),
    submitter,
  };
}

export interface CancelScheduleMutationInput {
  scheduleID: string;
}

export function cancelPublishingScheduleMutationOptions(client: APIClient) {
  const submitter = createPublishingContentSubmitter<CancelScheduleMutationInput, void>(
    ({ scheduleID }) => cancelPublishingSchedule(client, scheduleID),
  );
  return {
    retry: false as const,
    mutationFn: (input: CancelScheduleMutationInput) => submitter.submit(input),
    submitter,
  };
}
