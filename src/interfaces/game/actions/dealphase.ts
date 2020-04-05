// import { createAction } from "./createaction";

// // Must be come from dealer
// export const SHUFFLE_DECK = "SHUFFLE_DECK";
// export const shuffleDeckAction = () => createAction(DealPhase, SHUFFLE_DECK);
// export type ShuffleDeckAction = ReturnType<typeof shuffleDeckAction>;

// // Must be come from dealer
// // advances game to pass phase
// export const DEAL_CARDS = "DEAL_CARDS";
// export const dealCardsAction = () => createAction(DealPhase, DEAL_CARDS);
// export type DealCardsAction = ReturnType<typeof dealCardsAction>;

// export type DealPhaseAction = ShuffleDeckAction | DealCardsAction;

// export function validateDealPhaseAction(
//     type: string,
//     _: object
// ): DealPhaseAction {
//     switch (type) {
//         case SHUFFLE_DECK:
//             return shuffleDeckAction();
//         case DEAL_CARDS:
//             return dealCardsAction();
//         default:
//             throw new Error("Invalid action");
//     }
// }
