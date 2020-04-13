import * as React from "react";
import { ModalDialogBase } from "./ModalDialogBase";

interface GameIsFullProps {
    readonly onAccept: () => void;
}

export const GameIsFullUI = (props: GameIsFullProps) => (
    <ModalDialogBase title="The game is full">
        <p>
            The game already has enough players and a game is being played by
            other people.
        </p>
        <button onClick={props.onAccept}>
            Shoot! I guess I'll just watch for now.
        </button>
    </ModalDialogBase>
);
