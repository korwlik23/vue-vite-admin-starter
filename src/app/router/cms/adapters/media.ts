import {
  deleteMediaAsset,
  listMediaAssets,
  type Asset,
} from "@/modules/media/api/assets.client";
import {
  finalizeMediaUpload,
  startMediaUpload,
} from "@/modules/media/api/uploads.client";
import type { MediaUploadFile } from "@/modules/media/components/MediaUploader.vue";
import type { APIClient } from "@/shared/api/client";
import type { CMSRouteAdapter } from "@/app/router/cms/CMSRouteLoader.vue";

async function sha256(file: MediaUploadFile): Promise<string> {
  const bytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function mediaLibraryAdapter(client: APIClient): CMSRouteAdapter {
  return {
    initial: {
      assets: [],
      upload: async (file: MediaUploadFile): Promise<Asset> => {
        const bytes = await file.arrayBuffer();
        const body = new Blob([bytes], { type: file.type || "application/octet-stream" });
        const upload = await startMediaUpload(client, {
          body,
          fileName: file.name,
          sha256: await sha256(file),
        });
        return finalizeMediaUpload(client, upload.id, { expected_version: upload.version });
      },
      remove: (asset: Asset) => deleteMediaAsset(client, asset.id, { expected_version: asset.version }),
    },
    load: async () => ({ assets: (await listMediaAssets(client, { limit: 100 })).items }),
  };
}
