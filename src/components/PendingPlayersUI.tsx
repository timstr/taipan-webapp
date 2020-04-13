import * as React from "react";
import { WithAction } from "./MessageContext";
import { playerChosePositionAction } from "../interfaces/game/actions/joinphase";
import { PlayerPosition } from "../interfaces/game/player/position";
import { PendingPlayer } from "../interfaces/game/playerstate";
import { JoinPhaseView } from "../interfaces/game/view/stateview";

interface ClaimedPositionProps {
    readonly name?: string;
    readonly claimedByYou: boolean;
    readonly ready: boolean;
}

const ClaimedPositionUI = (props: ClaimedPositionProps) => {
    return (
        <WithAction>
            {(doAction) => (
                <div className="claimed-position">
                    <p>
                        Chosen by: {props.name || <em>Unnamed Player</em>}
                        {props.claimedByYou ? " (You)" : ""}
                        {props.ready ? " (✔ Ready)" : ""}
                    </p>
                    {props.claimedByYou ? (
                        <button
                            onClick={() =>
                                doAction(playerChosePositionAction(null))
                            }
                        >
                            Give Up
                        </button>
                    ) : null}
                </div>
            )}
        </WithAction>
    );
};

interface UnclaimedPositionProps {
    readonly position: PlayerPosition;
    readonly canClaim: boolean;
}

const UnclaimedPositionUI = (props: UnclaimedPositionProps) => (
    <WithAction>
        {(doAction) => (
            <div className="unclaimed-position">
                <p>Unclaimed</p>
                {props.canClaim ? (
                    <button
                        onClick={() =>
                            doAction(playerChosePositionAction(props.position))
                        }
                    >
                        Claim
                    </button>
                ) : null}
            </div>
        )}
    </WithAction>
);

interface PendingPlayerProps {
    readonly player: PendingPlayer;
    readonly position: PlayerPosition;
    readonly you: PlayerPosition | null;
    readonly spectating: boolean;
}

const PendingPlayerUI = (props: PendingPlayerProps) => (
    <div className="pending-player">
        <h3>{props.position}</h3>
        {props.player ? (
            <ClaimedPositionUI
                name={props.player.name}
                claimedByYou={!props.spectating && props.position === props.you}
                ready={props.player.ready}
            />
        ) : (
            <UnclaimedPositionUI
                position={props.position}
                canClaim={!props.spectating}
            />
        )}
    </div>
);

interface AllPendingPlayersProps {
    readonly players: JoinPhaseView["players"];
    readonly yourPosition: PlayerPosition | null;
    readonly spectating: boolean;
}

export const AllPendingPlayersUI = (props: AllPendingPlayersProps) => {
    const findPlayerFor = (pos: PlayerPosition): PendingPlayer =>
        props.players.find((p) => (p && p.position === pos ? p : null)) || null;
    return (
        <div className="all-pending-players">
            <PendingPlayerUI
                player={findPlayerFor("North")}
                position="North"
                you={props.yourPosition}
                spectating={props.spectating}
            />
            <PendingPlayerUI
                player={findPlayerFor("South")}
                position="South"
                you={props.yourPosition}
                spectating={props.spectating}
            />
            <PendingPlayerUI
                player={findPlayerFor("East")}
                position="East"
                you={props.yourPosition}
                spectating={props.spectating}
            />
            <PendingPlayerUI
                player={findPlayerFor("West")}
                position="West"
                you={props.yourPosition}
                spectating={props.spectating}
            />
        </div>
    );
};
