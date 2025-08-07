"use client";
import { create } from "zustand";
import { fileTypeFromBuffer } from "file-type";
const CONTEXT = import.meta.env.VITE_PROXY_CONTEXT;
interface FileType {
  fileName: string;
  id: number;
  $version: number;
}

export interface TemplateType {
  isDefault: boolean;
  isSystem: boolean;
  name: string;
  content: string;
  templateFile1: FileType;
  templateFile2: FileType;
  templateFile3: FileType;
  id: number;
  error: string | null;
}

export enum TemplateVariantEnum {
  isSystem = "isSystem",
  isDefault = "isDefault",
}

type messageTemplateType = {
  template: TemplateType[];
  files: { id: number; fileType: string; fileName: string }[];
  templateLoading: boolean;
  getTemplateFile: ({
    fileId,
    fileVersion,
    templateId,
    fileName,
  }: {
    fileId: number;
    fileVersion: number;
    templateId: number;
    fileName: string;
  }) => Promise<any>;
  postTemplate: ({ TemplateVariant }: { TemplateVariant?: TemplateVariantEnum }) => Promise<void>;
  postTemplateSearch: ({ name }: { name: string }) => Promise<void>;
  postTemplateFiles: ({ templateId }: { templateId: number }) => Promise<void>;
  getdownloadFile: ({
    fileId,
    fileName,
    fileType,
  }: {
    fileId: number;
    fileName: string;
    fileType: string;
  }) => Promise<any>;
};

async function detectMimeType(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const fileType = await fileTypeFromBuffer(buffer);
  if (fileType) {
    return fileType.mime;
  }
  return "application/octet-stream";
}

export const useMessageTemplateStore = create<messageTemplateType>()((set, get) => ({
  template: [],
  files: [],
  templateLoading: false,
  error: null,
  getTemplateFile: async ({ fileId, fileVersion, templateId, fileName }) => {
    try {
      set({ templateLoading: true });
      let response = await fetch(
        `${CONTEXT}/ws/rest/com.axelor.meta.db.MetaFile/${fileId}/content/download?v=${fileVersion}&parentId=${templateId}&parentModel=com.axelor.message.db.Template&fileName=${fileName}`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
        }
      );
      if (response.ok) {
        let blob = await response.blob();
        let mimeType = await detectMimeType(blob);
        let file = new File([blob], fileName, { type: mimeType });
        set({ templateLoading: false });
        return file;
      }
    } catch (error) {
      console.log(error);
    }
  },
  postTemplate: async ({ TemplateVariant }) => {
    try {
      set({ templateLoading: true });

      let body: {
        offset: number;
        limit: number;
        fields: string[];
        sortBy: string[];
        data?: {
          _domain: string;
          _domainContext: any;
        };
      } = {
        offset: 0,
        limit: 10,
        fields: ["isDefault", "isSystem", "name", "content", "templateFile1", "templateFile2", "templateFile3"],
        sortBy: ["-createdOn"],
      };

      if (TemplateVariant) {
        body.data = {
          _domain: `self.${TemplateVariant} = :${TemplateVariant}`,
          _domainContext: {
            [TemplateVariant]: true,
          },
        };
      }

      let response = await fetch(`${CONTEXT}/ws/rest/com.axelor.message.db.Template/search`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (response.ok) {
        let data = await response.json();
        if (data.data) {
          set({ template: data.data, templateLoading: false });
        } else {
          set({ template: [], templateLoading: false });
        }
      }
    } catch (e: any) {
      console.log(e);
    }
  },
  postTemplateSearch: async ({ name }) => {
    try {
      set({ templateLoading: true });
      let response = await fetch(`${CONTEXT}/ws/rest/com.axelor.message.db.Template/search`, {
        method: "POST",
        body: JSON.stringify({
          offset: 0,
          limit: 10,
          fields: ["isDefault", "isSystem", "name", "content", "templateFile1", "templateFile2", "templateFile3"],
          sortBy: ["-createdOn"],
          data: {
            _domain: `self.name like :name`,
            _domainContext: {
              name: "%" + name + "%",
            },
          },
        }),
      });
      if (response.ok) {
        let data = await response.json();
        if (data.data) {
          set({ template: data.data, templateLoading: false });
        } else {
          set({ template: [], templateLoading: false });
        }
      }
    } catch (e: any) {
      console.log(e);
    }
  },
  postTemplateFiles: async ({ templateId }) => {
    try {
      set({ templateLoading: true });
      let response = await fetch(`${CONTEXT}/ws/rest/com.axelor.dms.db.DMSFile/search`, {
        method: "POST",
        body: JSON.stringify({
          offset: 0,
          fields: ["name", "content", "templateFile", "isSystem", "fileName"],
          data: {
            _domain: `self.relatedModel = 'com.axelor.message.db.Template' and self.isDirectory = false and self.relatedId =: templateId`,
            _domainContext: {
              templateId: templateId,
            },
          },
        }),
      });
      if (response.ok) {
        let data = await response.json();
        if (data.data) {
          set({ files: data.data, templateLoading: false });
        } else {
          set({ template: [] });
        }
      }
    } catch (e: any) {
      console.log(e);
    }
  },
  getdownloadFile: async ({ fileId, fileName, fileType }) => {
    try {
      set({ templateLoading: true });
      let response = await fetch(`${CONTEXT}/ws/dms/download/${fileId}`, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.ok) {
        let blob = await response.blob();
        // let mimeType = await detectMimeType(blob);
        let file = new File([blob], fileName, { type: fileType });
        set({ templateLoading: false });
        return file;
      }
    } catch (error) {
      console.log(error);
    }
  },
}));
