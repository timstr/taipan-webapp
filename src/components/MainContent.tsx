import * as React from "react";
import { SCATTERED_CARDS_DATA_URL } from "./data/scatteredcards";

type BackdropName =
    | "tin_and_decks"
    | "floor"
    | "floor_and_scylla"
    | "scattered_cards";

interface Props {
    readonly backdrop: BackdropName;
    readonly children: React.ReactNode;
}

const makeUrl = (name: BackdropName): string =>
    name === "scattered_cards"
        ? `url("${SCATTERED_CARDS_DATA_URL}")`
        : `url("static/img/${name}.jpg")`;

export const MainContent = (props: Props) => (
    <div
        className={"backdrop"}
        style={{ backgroundImage: makeUrl(props.backdrop) }}
    >
        <div className="main-content">{props.children}</div>
    </div>
);
