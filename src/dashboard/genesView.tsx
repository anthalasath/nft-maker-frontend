import { BigNumberish } from "ethers";
import React from "react";

export interface GenesViewProps {
    genes: BigNumberish[]
}

export function GenesView(props: GenesViewProps) {
    return <>
        {props.genes.map((g, i) => <p key={i}>{g.toString()}</p>)}
    </>;
}