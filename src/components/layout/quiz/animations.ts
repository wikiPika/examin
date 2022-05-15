import {Anim} from "../../../Animation";

export const choicesAnim = Anim.bounceX(-50).build();
export const slideAnim = Anim.bounceY(64).spring(120, 0, 20).build(true, true);
export const choicesParent = new Anim().spring(120, 0, 20).delay_children(0.2).stagger(0.15).build();