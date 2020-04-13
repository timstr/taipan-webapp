import * as React from "react";
import { Action } from "../interfaces/game/actions/actions";
import {
    ClientMessage,
    playerDidActionMessage,
} from "../interfaces/messages/clientmessages";

export type MessageContextType = (message: ClientMessage) => void;

const DefaultMessageContextType = () => {
    throw new Error("Attempted to use uninitialized MessageContext");
};

export const MessageContext = React.createContext<MessageContextType>(
    DefaultMessageContextType
);

type MessageHandler = (message: ClientMessage) => void;

interface MessageProviderProps {
    readonly children: (sendMessage: MessageHandler) => React.ReactNode;
}

export const WithMessage = (props: MessageProviderProps) => (
    <MessageContext.Consumer>
        {(handleMessage) => props.children(handleMessage)}
    </MessageContext.Consumer>
);

type ActionHandler = (action: Action) => void;

interface ActionProviderProps {
    children: (doAction: ActionHandler) => React.ReactNode;
}

export const WithAction = (props: ActionProviderProps) => (
    <MessageContext.Consumer>
        {(handleMsg) =>
            props.children((a: Action) => handleMsg(playerDidActionMessage(a)))
        }
    </MessageContext.Consumer>
);
