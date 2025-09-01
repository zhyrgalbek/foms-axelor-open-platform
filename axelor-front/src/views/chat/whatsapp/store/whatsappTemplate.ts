import { create } from "zustand";
import { HttpStatusEnum, StatusMessageEnum, SuccessMessageEnum, TemplateType } from "../types/chatTypes";

interface whatsappTemplateType {
  loadingTemplateMessage: boolean;
  templateLoading: boolean;
  status: { variant: StatusMessageEnum; value: HttpStatusEnum };
  createSuccessTemplate: TemplateType | null;
  errorMessage: string | null;
  successMessage: SuccessMessageEnum | null;
  templates: TemplateType[];
  setStatus: ({ variant, value }: { variant: StatusMessageEnum; value: HttpStatusEnum }) => void;
  setSuccess: (value: SuccessMessageEnum | null) => void;
  setLoadingTemplateMessage: (value: boolean) => void;
  setTemplateLoading: (value: boolean) => void;
  setCreateSuccessTemplate: (value: TemplateType | null) => void;
  setErrorMessage: (value: string | null) => void;
  setTemplates: (value: TemplateType[]) => void;
}

export const useWhatsappTemplate = create<whatsappTemplateType>()((set, get) => ({
  loadingTemplateMessage: false,
  templateLoading: false,
  status: { variant: StatusMessageEnum.noStatus, value: HttpStatusEnum.noStatus },
  createSuccessTemplate: null,
  errorMessage: null,
  successMessage: null,
  templates: [],
  setStatus: ({ variant, value }: { variant: StatusMessageEnum; value: HttpStatusEnum }) => {
    set({ status: { variant, value } });
  },
  setSuccess: (value: SuccessMessageEnum | null) => {
    set({ successMessage: value });
  },
  setLoadingTemplateMessage: (value: boolean) => {
    set({ loadingTemplateMessage: value });
  },
  setTemplateLoading: (value: boolean) => {
    set({ templateLoading: value });
  },
  setCreateSuccessTemplate: (value: TemplateType | null) => {
    set({ createSuccessTemplate: value });
  },
  setErrorMessage: (value: string | null) => {
    set({ errorMessage: value });
  },
  setTemplates: (value: TemplateType[]) => {
    set({ templates: value });
  },
}));
