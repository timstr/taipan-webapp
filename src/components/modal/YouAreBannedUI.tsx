import * as React from "react";
import { ModalDialogBase } from "./ModalDialogBase";

interface YouAreBannedProps {
    readonly onAccept: () => void;
}

export const YouAreBannedUI = (props: YouAreBannedProps) => (
    <ModalDialogBase title="You are banned">
        <p>
            Maybe it's personal. Maybe you've been caught trying to hack the
            game. Maybe you've committed intangible but nonetheless serious
            thought crimes. But anyhowm there unfortunately will not be any
            official word on why this is. The simple fact is that you
            specifically are not permitted to play.
        </p>
        <p>
            Hopefully you will find comfort in knowing that you may still watch
            while others play the game.
        </p>
        <button onClick={props.onAccept}>
            This isn't over! You ain't seen the last of me
        </button>
    </ModalDialogBase>
);
