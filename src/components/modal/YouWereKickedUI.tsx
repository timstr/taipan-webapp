import * as React from "react";
import { ModalDialogBase } from "./ModalDialogBase";

export const YouWereKickedUI = () => (
    <ModalDialogBase title="You were kicked">
        <p>You were idle for too long and have been disconnected.</p>
        <button onClick={() => window.location.reload()}>
            Oh. Okay, drat. Well I guess I'll try again.
        </button>
    </ModalDialogBase>
);
