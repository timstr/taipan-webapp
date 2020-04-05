import * as React from "react";
import { ClientMessage, playerActionMessage } from "../messages";
import { Action } from "../interfaces/game/actions";

export type MessageContextType = (message: ClientMessage) => void;

const DefaultMessageContextType = () => {
    throw new Error("Attempted to use uninitialized MessageContext");
};

export const MessageContext = React.createContext<MessageContextType>(
    DefaultMessageContextType
);

type ActionHandler = (action: Action) => void;

interface Props {
    children: (onAction: ActionHandler) => React.ReactNode;
}

export const ActionProvider = (props: Props) => (
    <MessageContext.Consumer>
        {handleMsg =>
            props.children((a: Action) => handleMsg(playerActionMessage(a)))
        }
    </MessageContext.Consumer>
);
