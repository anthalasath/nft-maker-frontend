import { Button, Grid } from "@mui/material";
import { ethers } from "ethers";
import React from "react";
import { BreedableNFT } from "../nft-maker/typechain-types";
import { CreatureStruct } from "../nft-maker/typechain-types/contracts/BreedableNFT";
import { BackButtonView } from "../utils/backButtonView";
import { CreatureView } from "./creatureView";

export interface MintedNftsViewProps {
    contract: BreedableNFT
}

interface MintedNftsViewState {
    creatures: CreatureStruct[]
}

export class MintedNftsView extends React.Component<MintedNftsViewProps, MintedNftsViewState> {

    constructor(props: MintedNftsViewProps) {
        super(props);
        this.state = {
            creatures: []
        };
    }

    async componentDidMount() {
        const filter = this.props.contract.filters.Transfer(ethers.constants.AddressZero);
        // TODO: performance, e.g use pagination
        const tokenIds = (await this.props.contract.queryFilter(filter)).map(e => e.args.tokenId);
        const creatures: CreatureStruct[] = await Promise.all(tokenIds.map(tokenId => this.props.contract.getCreature(tokenId)));
        this.setState({ creatures });
    }

    render() {
        return <>
            <Grid container>
                {this.state.creatures.map(c => {
                    return <CreatureView key={c.tokenId.toString()} creature={c}></CreatureView>
                })}
            </Grid>
        </>
    }
}