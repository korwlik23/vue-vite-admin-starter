import {
  transitionPublishingWorkflow,
  type WorkflowRequest,
  type WorkflowResponse,
} from "@/modules/publishing/api/workflow.client";
import { createPublishingContentSubmitter } from "@/modules/publishing/mutations/content.mutations";
import type { APIClient } from "@/shared/api/client";

export interface WorkflowMutationInput {
  contentID: string;
  input: WorkflowRequest;
}

export function transitionPublishingWorkflowMutationOptions(client: APIClient) {
  const submitter = createPublishingContentSubmitter<WorkflowMutationInput, WorkflowResponse>(
    ({ contentID, input }) => transitionPublishingWorkflow(client, contentID, input),
  );
  return {
    retry: false as const,
    mutationFn: (input: WorkflowMutationInput) => submitter.submit(input),
    submitter,
  };
}
