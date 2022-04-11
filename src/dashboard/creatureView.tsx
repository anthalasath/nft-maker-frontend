import { Button, Card, CardContent, Dialog, DialogTitle, Grid, Modal } from "@mui/material";
import { BigNumber } from "ethers";
import React from "react";
import { CreatureStruct } from "../nft-maker/typechain-types/contracts/BreedableNFT";
import { GenesView } from "./genesView";

export interface CreatureViewProps {
    creature: CreatureStruct
}

export interface CreatureViewState {
    showingGenes: boolean
}

export class CreatureView extends React.Component<CreatureViewProps, CreatureViewState> {

    constructor(props: CreatureViewProps) {
        super(props);
        this.state = {
            showingGenes: false
        };
    }

    renderBreedingBlock() {
        if (BigNumber.from(Date.now()).gte(this.props.creature.breedingBlockedUntil)) {
            return null;
        }
        return <p>Breeding blocked until: {new Date(BigNumber.from(this.props.creature.breedingBlockedUntil).toNumber())}</p>
    }

    renderGenes() {
        return <>
            <Button onClick={() => this.setState({ showingGenes: !this.state.showingGenes })}>{this.state.showingGenes ? "Hide" : "Show"} genes</Button>
            {this.state.showingGenes ? <GenesView genes={this.props.creature.genes}></GenesView> : null}
        </>
    }

    render() {
        return <Grid xs={4} item>
            <Card>
                <CardContent>
                    <p>ID: {this.props.creature.tokenId.toString()}</p>
                    <p>Father ID: {this.props.creature.fatherId.toString()}</p>
                    <p>Mother ID: {this.props.creature.motherId.toString()}</p>
                    {this.renderBreedingBlock()}
                    {this.renderGenes()}
                </CardContent>
            </Card>
        </Grid>
    }
}