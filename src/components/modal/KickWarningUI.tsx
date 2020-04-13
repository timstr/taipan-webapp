import * as React from "react";
import { ModalDialogBase } from "./ModalDialogBase";
import { WithMessage } from "../MessageContext";
import { dontKickMeMessage } from "../../interfaces/messages/clientmessages";

interface DontKickMeProps {
    readonly onAccept: () => void;
}

const DontKickMeButton = (props: DontKickMeProps) => (
    <WithMessage>
        {(sendMessage) => (
            <button
                onClick={() => {
                    sendMessage(dontKickMeMessage());
                    props.onAccept();
                }}
            >
                Don't Kick Me
            </button>
        )}
    </WithMessage>
);

export const KickWarningUI = (props: DontKickMeProps) => (
    <ModalDialogBase title="You are about to be kicked">
        <p>
            You have been idle for a long time. You will be disconnected unless
            you wish to stay online.
        </p>
        <DontKickMeButton {...props} />
    </ModalDialogBase>
);
