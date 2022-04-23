import { Button, Card, CardContent, Dialog, DialogTitle, Grid, Modal } from "@mui/material";
import { BigNumber } from "ethers";
import React, { useEffect, useRef } from "react";
import { CreatureStruct, PictureStruct, BreedableNFT } from "nft-maker/typechain-types/contracts/BreedableNFT";
import { GenesView } from "./genesView";

export interface CreatureViewProps {
    breedableNFT: BreedableNFT
    creature: CreatureStruct
}

export interface CreatureViewState {
    showingGenes: boolean
    picturesByLayer: PictureStruct[]
}

export class CreatureView extends React.Component<CreatureViewProps, CreatureViewState> {

    constructor(props: CreatureViewProps) {
        super(props);
        this.state = {
            showingGenes: false,
            picturesByLayer: []
        };
    }


    async componentDidMount() {
        const picturesByLayer: PictureStruct[] = await Promise.all(this.props.creature.genes.map(async (gene, layer) => {
            return this.props.breedableNFT.getPicture(layer, gene);
        }));
        this.setState({ picturesByLayer });
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
                    <NFTPicView picturesByLayer={this.state.picturesByLayer}></NFTPicView>
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


export interface NFTPicViewProps {
    picturesByLayer: PictureStruct[]
}



export function NFTPicView(props: NFTPicViewProps) {

    function addImage(src: string, ctx: any, dx: number, dy: number, images: HTMLImageElement[]) {
        const image = new Image();
        image.src = src;
        image.onload = () => {
            ctx.drawImage(image, dx, dy, 50, 50);
        }
        images.push(image);
    }

    React.useEffect(() => {
        let c: any = document.getElementById("myCanvas");
        let ctx = c.getContext("2d");
        const images: HTMLImageElement[] = [];
        for (let i = 0; i < props.picturesByLayer.length; i++) {
            const uri = props.picturesByLayer[i].uri;
            const dx = BigNumber.from(props.picturesByLayer[i].position.x).div(4).toNumber();
            const dy = BigNumber.from(props.picturesByLayer[i].position.y).div(4).toNumber();
            addImage(uri, ctx, dx, dy, images);
        }
    }, [props.picturesByLayer]);

    return (
        <div>
            <canvas
                id="myCanvas"
                width="200"
                height="200"
                style={{ border: "1px solid #d3d3d3" }}
            >
                Your browser does not support the HTML canvas tag.
            </canvas>
        </div>
    );
}

