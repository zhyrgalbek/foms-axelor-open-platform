

export interface chatTypes {
    count: number;
}

interface MessageAuthorType {
    fullName: string;
    id: number;
    $version: number;
}

interface LatestTransferType {
    fromTr: {
        code: string;
        fullName: string;
        id: number;
        version: number;
    };
    id: number;
    toTr: [];
    version: number;
}
interface AppealType {
    id: number;
    $version: number;
    status: number;
    firstName: string;
    name: string;
    importOrigin: string;
    processInstanceId: string;
    phoneNumber: string;
    latestTransfer?: LatestTransferType;
    transfer?: LatestTransferType[];
    client: {
        id: number | null;
        firstName: string;
        lastName: string;
        email: string;
        dateOfBirth: string;
        fullName: string | null;
        mobilePhone: string | null;
    };
}
export interface LastMessageType {
    id: number;
    body: string;
    timestamp: number;
    messageAuthor: MessageAuthorType | null;
    type: any;
    status: MessageStatusTypeEnum;
    fileName: string;
    appealType: AppelTypeEnum;
}

export interface ColleaguesType {
    id: number;
    code: string;
    fullName: string;
    lastMessage: LastMessageType | null;
    unreadMessageCount: number;
    status: string;
    isTyping: MemberType[];
    fromNumber?: string;
    typeChats?: string;
    members?: MemberType[];
    chatSeans?: true;
    version?: 0;
    phoneNumberId?: string;
    phoneNumber?: string;
    name?: string;
    $wkfStatus?: any;
    // commentary?: string | null;
    completedUsers?: CompletedUserType[];
    "appeal.name": string;
    // appeal?: AppealType | null;
    "appeal.saleOrder"?: {
        fullName: string;
        id: number;
        soStatus: string;
        version: number;
    } | null;
    "appeal.id": number;
    "appeal.firstName": string;
    "appeal.phoneNumber": number;
    "appeal.commentary": string | null;
    "appeal.importOrigin": string;
    "appeal.processInstanceId": string;
    "appeal.client.firstName": string;
    "appeal.client.lastName": string;
    "appeal.client.mobilePhone": number;
    "appeal.client.email": string;
    "appeal.client.dateOfBirth": string;
    "appeal.client.id": number;
    "appeal.client.fullName": string;
}

export interface ClientType {
    id: number;
    appealId: number;
    fullName: string;
    phoneNumber: string;
    lastMessage: LastMessageType | null;
    unreadMessageCount: number;
    commentary: string;
    isTyping: MemberType[];
    members: {
        code: string;
        fullName: string;
        id: number;
        version: number;
    }[];
    completedUsers: CompletedUserType[];
    code: string;
    status: string;
    fromNumber?: string;
    typeChats?: string;
    chatSeans?: true;
    version?: 0;
    phoneNumberId?: string;
    name?: string;
    $wkfStatus?: any;
    // commentary?: string | null;
    "appeal.name": string;
    appeal?: AppealType | null;
    "appeal.saleOrder"?: {
        fullName: string;
        id: number;
        soStatus: string;
        version: number;
    } | null;
    "appeal.id": number;
    "appeal.firstName": string;
    "appeal.phoneNumber": number;
    "appeal.commentary": string | null;
    "appeal.importOrigin": string;
    "appeal.processInstanceId": string;
    "appeal.client.firstName": string;
    "appeal.client.lastName": string;
    "appeal.client.mobilePhone": number;
    "appeal.client.email": string;
    "appeal.client.dateOfBirth": string;
    "appeal.client.id": number;
    "appeal.client.fullName": string;
    "appeal.uuid": string,
    "appeal.fingerprint": string,
    "appeal.appelType": string
}

export enum ChatMessageTypeEnum {
    CURRENT_USER,
    CLIENT,
    USER,
}

export enum MessageTypeEnum {
    TEXT = "TEXT",
    TODAY = "TODAY",
    DATE = "DATE",
    IMAGE = "IMAGE",
    DOCUMENT = "DOCUMENT",
    AUDIO = "AUDIO",
    VIDEO = "VIDEO",
    TEMPLATE = "TEMPLATE",
    TRANSFER = "TRANSFER",
    CALL = "CALL",
    COMMENTARY = "COMMENTARY",
}

export enum MessageStatusTypeEnum {
    sent = "sent",
    delivered = "delivered",
}

export enum AppelTypeEnum {
    whatsapp = "whatsapp",
    instagram = "instagram",
    telegram = "telegram",
    call = "call",
    onlineChat = "onlineChat"
}
export interface TransferType {
    id: number;
    fromTr: {
        id: number;
        fullName: string;
        code: string;
    };
    toTr: [
        {
            id: number;
            fullName: string;
            code: string;
        },
    ];
}
export interface TransferToTrType {
    name: string;
    fullName: string;
    id: number;
}
export interface MessageType {
    author: ChatMessageTypeEnum;
    fileName: string;
    appeal: AppealType | null;
    appealType: AppelTypeEnum | null;
    type: MessageTypeEnum;
    body: string;
    version?: number;
    $wkfStatus?: string | null;
    fromNumber: string;
    fileSize: string;
    chat: {
        id: number;
        $version: number;
    };
    messageAuthor?: {
        fullName: string;
        id: number;
        $version: number;
    };
    id: number;
    messageSecretKey: string;
    fileType: string;
    fileId: string;
    timestamp: number;
    flags: {
        id: number;
        isRead: boolean;
        userId: number;
        version: 0;
    }[];
    ["transfer.fromTr"]?: {
        fullName: string;
        id: number;
    };
    ["toTr"]?: TransferToTrType[];
    status: MessageStatusTypeEnum;
    prevMessageSecretKey: string | null;
    prevMessageId: number | null;
    caption: string | null;
    ["messageCall.id"]: number | null;
    ["messageCall.type"]: string | null;
    ["messageCall.status"]: string | null;
    ["messageCall.recordId"]: string | null;
    ["messageCall.duration"]: number | null;
    ["messageCall.user"]: {
        fullName: string;
        id: number;
        $version: number;
    } | null;
    callResponsible?: {
        name: string;
        fullName: string;
        id: number;
    }[];
    prevAnswerMessage?: MessageType;
}

export type TemplateButtonType = {
    id: number;
    type: string;
    text: string;
    textLngError: boolean;
    textEmpty: boolean;
    phone_number?: string;
    phone_number_error?: boolean;
    url?: string;
    urlError?: boolean;
};

export type SocketStoreEventType = {
    event: string;
    data: {};
};

export type MemberType = {
    code: string;
    fullName: string;
    id: number;
    // $version: number;
};

export interface CompletedUserType {
    code: string;
    fullName: string;
    id: number;
    version: number;
}

export type ChatType = {
    fromNumber?: string;
    id: number | null;
    typeChats?: string;
    members?: MemberType[];
    chatSeans?: true;
    version?: 0;
    phoneNumberId?: string;
    phoneNumber?: string;
    name?: string;
    $wkfStatus?: any;
    // commentary?: string | null;
    completedUsers?: CompletedUserType[];
    "appeal.name": string;
    appeal?: AppealType | null;
    "appeal.saleOrder"?: {
        fullName: string;
        id: number;
        soStatus: string;
        version: number;
    } | null;
    isTyping: MemberType[];
    lastMessage: LastMessageType | null;
    "appeal.id": number;
    "appeal.firstName": string;
    "appeal.phoneNumber": number;
    "appeal.commentary": string | null;
    "appeal.importOrigin": string;
    "appeal.processInstanceId": string;
    "appeal.client.firstName": string;
    "appeal.client.lastName": string;
    "appeal.client.mobilePhone": number;
    "appeal.client.email": string;
    "appeal.client.dateOfBirth": string;
    "appeal.client.id": number;
    "appeal.client.fullName": string;
    "appeal.uuid": string,
    "appeal.fingerprint": string,
    "appeal.appealType": string,
    code: string;
    fullName: string;
    unreadMessageCount: number;
    status: string;
} | null;

export type ContactType = {
    linkedUser?: {
        fullName: string;
        id: number;
        $verison: number;
    };
    companyDepartment: {
        name: string;
        id: number;
        $version: number;
    };
    status: string;
    checked: false;
    id: number;
    version: number;
    uuid: string;
};

export type addChatContactsType = {
    [key: string]: ContactType[];
};

export type ClientContactType = {
    id: number;
    name: string;
    phoneNumber: string;
    "client.id": number;
    "client.name": string;
    "client.fullName": string;
    "client.mobilePhone": string;
};

export type TemplateType = {
    id: number;
    name: string;
    header: string | null;
    body: string;
    footer: string | null;
    language: string;
    status: any;
    category: string;
    buttons: TemplateButtonType[] | null;
};

export type DepartMentType = {
    code: string;
    name: string;
    id: number;
    checked: boolean;
    version: number;
};

export enum HttpStatusEnum {
    loading = "loading",
    success = "success",
    error = "error",
    noStatus = "noStatus",
}

export enum StatusMessageEnum {
    createTemplate = "createTemplate",
    updateTemplate = "updateTemplate",
    deleteTemplate = "deleteTemplate",
    noStatus = "",
}

export enum SuccessMessageEnum {
    createTemplate = "Успешно создано",
    updateTemplate = "Успешно сохранено",
    deleteTemplate = "Успешно удалено",
}

export enum errorMessageEnum { }

export enum ChatBoxVariant {
    tqc = "tqc",
    hd = "hd",
}
