import * as React from "react";
import { JoinPhaseSpectatorView } from "../../interfaces/game/view/spectatorview";
import { MainContent } from "../MainContent";
import { Header } from "../Header";
import { AllPendingPlayersUI } from "../PendingPlayersUI";
import { AllPlayerIndices } from "../../interfaces/game/player/player";

interface JoinPhaseUIProps {
    readonly gameState: JoinPhaseSpectatorView;
    readonly requestJoin: () => void;
}

export const JoinPhaseUI = (props: JoinPhaseUIProps) => {
    const s = props.gameState;
    const remainingSlots = AllPlayerIndices.length - s.numPlayers;
    const plural = remainingSlots !== 1;
    return (
        <MainContent backdrop="tin_and_decks">
            <Header phase={s.phase} />
            <div className="join-game-dialog">
                {remainingSlots > 0 ? (
                    <div className="remaining-spots">
                        <p>
                            There {plural ? "are" : "is"} {remainingSlots} spot
                            {plural ? "s" : ""} still available
                        </p>
                        <button onClick={props.requestJoin}>
                            Join the Game
                        </button>
                    </div>
                ) : (
                    <div className="remaining-spots">
                        <p>All spots are taken.</p>
                    </div>
                )}
            </div>
            <AllPendingPlayersUI
                players={s.players}
                yourPosition={null}
                spectating={true}
            />
        </MainContent>
    );
};
