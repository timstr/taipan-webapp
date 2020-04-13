import * as React from "react";
import { MainContent } from "../MainContent";
import { Header } from "../Header";
import { DealPhaseTag } from "../../interfaces/game/state/state";
import { OtherPlayerDealUI } from "../OtherPlayerDealUI";
import { DealPhaseSpectatorView } from "../../interfaces/game/view/spectatorview";

interface Props {
    readonly gameState: DealPhaseSpectatorView;
}

export const DealPhaseUI = (props: Props) => {
    const s = props.gameState;
    return (
        <MainContent backdrop="floor">
            <Header phase={DealPhaseTag} />
            <div className="other-players-deal-phase-spectator">
                <div className="other-players-deal-phase">
                    <OtherPlayerDealUI
                        player={s.players.north}
                        positionTitle="North"
                        facing="Down"
                    />
                    <OtherPlayerDealUI
                        player={s.players.east}
                        positionTitle="East"
                        facing="Down"
                    />
                </div>
                <div className="other-players-deal-phase">
                    <OtherPlayerDealUI
                        player={s.players.west}
                        positionTitle="West"
                        facing="Up"
                    />
                    <OtherPlayerDealUI
                        player={s.players.south}
                        positionTitle="South"
                        facing="Up"
                    />
                </div>
            </div>
        </MainContent>
    );
};
