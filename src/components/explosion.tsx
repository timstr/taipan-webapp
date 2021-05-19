import * as React from "react";

interface Props {
    readonly offsetX: number;
    readonly offsetY: number;
    readonly progress: number;
    readonly centerX: number;
    readonly centerY: number;
    readonly seed: number;
    readonly numParticles: number;
}

const splerp = (t: number, values: number[]): number => {
    t = Math.min(1.0, Math.max(0.0, t));
    const n = values.length;
    const x = (n - 1) * t;
    const x0 = Math.floor(x);
    const x1 = Math.ceil(x);
    const d = x - x0;
    const v0 = values[x0];
    const v1 = values[x1];
    return v0 + d * (v1 - v0);
};

const color_string = (r: number, g: number, b: number, a: number): string => {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const pseudorand = (x: number): number => {
    return 0.5 + 0.5 * Math.sin(5129.6235 * Math.sin(7123.82376271 * x));
};

const makeParticle = (
    t: number,
    radius: number,
    theta: number,
    size: number,
    centerX: number,
    centerY: number,
    speed: number,
    key: number
): React.ReactNode => {
    const radScales = [0.0, 1.0, 1.2, 1.3, 1.35, 1.4, 1.45, 1.5];
    const r = radius * splerp(t, radScales);
    const yOffsets = [0.0, 0.1, 0.2, 0.3, 0.4, 0.55, 0.75, 1.0];
    const dx = r * Math.cos(theta);
    const dy = 0.25 * r * Math.sin(theta) - 2.0 * speed * splerp(t, yOffsets);
    const x = centerX + dx;
    const y = centerY + dy;

    const sizeScales = [0.0, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3];
    const s = size * splerp(t, sizeScales);

    const irs = [255, 247, 242, 206, 109, 38, 45];
    const igs = [255, 236, 148, 83, 32, 6, 34];
    const ibs = [255, 81, 26, 16, 6, 1, 21];
    const ias = [1.0, 1.0, 0.8, 0.5, 0.4, 0.2, 0.0];

    const ors = [255, 0, 0];
    const ogs = [255, 0, 0];
    const obs = [128, 0, 0];
    const oas = [1.0, 1.0, 0.0];

    const inner_color = color_string(
        splerp(t, irs),
        splerp(t, igs),
        splerp(t, ibs),
        splerp(t, ias)
    );
    const outer_color = color_string(
        splerp(t, ors),
        splerp(t, ogs),
        splerp(t, obs),
        splerp(t, oas)
    );
    return (
        <div
            style={{
                position: "absolute",
                top: y - s,
                left: x - s,
                width: 2.0 * s,
                height: 2.0 * s,
                background: `radial-gradient(closest-side, ${inner_color}, ${outer_color}, rgba(0, 0, 0, 0))`,
            }}
            key={key}
        />
    );
};

export const Explosion = (props: Props) => {
    // inner colour components
    const irs = [255, 255, 252, 255];
    const igs = [255, 243, 140, 255];
    const ibs = [180, 196, 60, 255];
    const ias = [1.0, 0.8, 0.4, 0.0];

    // outer colour components
    const ors = [0, 25, 20, 0];
    const ogs = [0, 21, 9, 0];
    const obs = [0, 2, 2, 0];
    const oas = [0.8, 0.6, 0.2, 0.0];

    const t = props.progress;
    const inner_color = color_string(
        splerp(t, irs),
        splerp(t, igs),
        splerp(t, ibs),
        splerp(t, ias)
    );
    const outer_color = color_string(
        splerp(t, ors),
        splerp(t, ogs),
        splerp(t, obs),
        splerp(t, oas)
    );
    let particles = [];
    for (let i = 0; i < props.numParticles; ++i) {
        particles.push(
            makeParticle(
                t,
                200.0 * pseudorand(props.seed + i + 0.0),
                2.0 * Math.PI * pseudorand(props.seed + i + 0.1),
                10.0 + 190.0 * pseudorand(props.seed + i + 0.2),
                props.centerX,
                props.centerY,
                10.0 + 190.0 * pseudorand(props.seed + i + 0.3),
                i
            )
        );
    }
    return (
        <div
            className="explosion-container"
            style={{
                background: `radial-gradient(1000px at ${props.centerX}px ${props.centerY}px, ${inner_color}, ${outer_color})`,
            }}
        >
            {particles}
        </div>
    );
};
