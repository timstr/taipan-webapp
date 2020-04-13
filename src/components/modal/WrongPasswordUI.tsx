import * as React from "react";
import { ModalDialogBase } from "./ModalDialogBase";

interface WrongPasswordProps {
    readonly onAccept: () => void;
}

export const WrongPasswordUI = (props: WrongPasswordProps) => (
    <ModalDialogBase title="Wrong password">
        <p>You have entered an incorrect password.</p>
        <button onClick={props.onAccept}>Oh snap</button>
    </ModalDialogBase>
);
