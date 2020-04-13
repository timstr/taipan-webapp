import * as React from "react";
import { PassPhaseSpectatorView } from "../../interfaces/game/view/spectatorview";
import { Header } from "../Header";
import { OtherPlayerPassing } from "../OtherPlayerPassingUI";
import { MainContent } from "../MainContent";
import { PassPhaseTag } from "../../interfaces/game/state/state";

interface Props {
    readonly gameState: PassPhaseSpectatorView;
}

export const PassPhaseUI = (props: Props) => {
    const s = props.gameState;
    return (
        <MainContent backdrop="floor">
            <Header phase={PassPhaseTag} />
            <div className="players-pass-phase-spectating">
                <div className="players-pass-phase-spectating-row">
                    <OtherPlayerPassing
                        player={s.players.north}
                        positionTitle="North"
                    />
                    <OtherPlayerPassing
                        player={s.players.east}
                        positionTitle="East"
                    />
                </div>

                <div className="players-pass-phase-spectating-row">
                    <OtherPlayerPassing
                        player={s.players.west}
                        positionTitle="West"
                    />
                    <OtherPlayerPassing
                        player={s.players.south}
                        positionTitle="South"
                    />
                </div>
            </div>
        </MainContent>
    );
};
