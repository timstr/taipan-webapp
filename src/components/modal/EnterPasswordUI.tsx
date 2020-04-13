import * as React from "react";
import { ModalDialogBase } from "./ModalDialogBase";
import { WithMessage } from "../MessageContext";
import { TextField } from "../TextField";
import { clientWantsToPlayMessage } from "../../interfaces/messages/clientmessages";
import { hash } from "../../hash/browser";

interface EnterPasswordProps {
    readonly onCancel: () => void;
}

export const EnterPasswordUI = (props: EnterPasswordProps) => (
    <ModalDialogBase title="Please enter the password">
        <WithMessage>
            {(sendMessage) => (
                <>
                    <TextField
                        onSubmit={async (s: string) => {
                            sendMessage(
                                clientWantsToPlayMessage(await hash(s))
                            );
                        }}
                        submitButton
                        isPassword
                        grabFocus
                    />
                    <br />
                    <button onClick={props.onCancel}>Cancel</button>
                </>
            )}
        </WithMessage>
    </ModalDialogBase>
);
