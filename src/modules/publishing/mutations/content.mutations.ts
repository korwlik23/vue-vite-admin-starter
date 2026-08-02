import {
  createPublishingPage,
  createPublishingPost,
  deletePublishingPage,
  deletePublishingPost,
  updatePublishingPage,
  updatePublishingPost,
  type ContentDeleteRequest,
  type ContentUpdateRequest,
  type CreatePublishingPageRequest,
  type CreatePublishingPostRequest,
  type PublishingContent,
} from "@/modules/publishing/api/content.client";
import type { APIClient } from "@/shared/api/client";

export interface PublishingContentSubmitter<Input, Output> {
  readonly isPending: boolean;
  submit(input: Input): Promise<Output>;
}

export function createPublishingContentSubmitter<Input, Output>(
  submitter: (input: Input) => Promise<Output>,
): PublishingContentSubmitter<Input, Output> {
  let pending: Promise<Output> | undefined;
  return {
    get isPending(): boolean {
      return pending !== undefined;
    },
    submit(input: Input): Promise<Output> {
      if (pending !== undefined) return pending;
      let request: Promise<Output>;
      try {
        request = Promise.resolve(submitter(input));
      } catch (error) {
        request = Promise.reject(error);
      }
      const tracked = request.then(
        (value) => {
          if (pending === tracked) pending = undefined;
          return value;
        },
        (error: unknown) => {
          if (pending === tracked) pending = undefined;
          throw error;
        },
      );
      pending = tracked;
      return tracked;
    },
  };
}

export function publishingContentMutationOptions<Input, Output>(
  submitter: (input: Input) => Promise<Output>,
) {
  const guarded = createPublishingContentSubmitter(submitter);
  return {
    retry: false as const,
    mutationFn: (input: Input) => guarded.submit(input),
    submitter: guarded,
  };
}

export function createPublishingPageMutationOptions(client: APIClient) {
  return publishingContentMutationOptions<CreatePublishingPageRequest, PublishingContent>(
    (input) => createPublishingPage(client, input),
  );
}

export function createPublishingPostMutationOptions(client: APIClient) {
  return publishingContentMutationOptions<CreatePublishingPostRequest, PublishingContent>(
    (input) => createPublishingPost(client, input),
  );
}

export interface ContentUpdateMutationInput {
  contentID: string;
  input: ContentUpdateRequest;
}

export function updatePublishingPageMutationOptions(client: APIClient) {
  return publishingContentMutationOptions<ContentUpdateMutationInput, PublishingContent>(
    ({ contentID, input }) => updatePublishingPage(client, contentID, input),
  );
}

export function updatePublishingPostMutationOptions(client: APIClient) {
  return publishingContentMutationOptions<ContentUpdateMutationInput, PublishingContent>(
    ({ contentID, input }) => updatePublishingPost(client, contentID, input),
  );
}

export interface ContentDeleteMutationInput {
  contentID: string;
  input: ContentDeleteRequest;
}

export function deletePublishingPageMutationOptions(client: APIClient) {
  return publishingContentMutationOptions<ContentDeleteMutationInput, void>(
    ({ contentID, input }) => deletePublishingPage(client, contentID, input),
  );
}

export function deletePublishingPostMutationOptions(client: APIClient) {
  return publishingContentMutationOptions<ContentDeleteMutationInput, void>(
    ({ contentID, input }) => deletePublishingPost(client, contentID, input),
  );
}
