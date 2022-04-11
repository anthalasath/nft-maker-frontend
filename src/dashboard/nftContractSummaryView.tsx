import { Button, Card, CardContent, Grid } from "@mui/material";
import React from "react";

export interface NftContractSummary {
    address: string;
    name: string;
    symbol: string;
}
interface NftContractSummaryViewProps {
    summary: NftContractSummary;
    handleMintPromoClick: () => void;
    handleSeeMintedNftsClick: () => void;
}
// TODO: check if contract owner before displaying the button
export function NftContractSummaryView(props: NftContractSummaryViewProps) {
    return <Grid item xs={4}>
        <Card>
            <CardContent>
                <p>{props.summary.name}</p>
                <p>{props.summary.symbol}</p>
                <p>{props.summary.address}</p>
                <Button variant="outlined" onClick={props.handleMintPromoClick}>Mint promotional creature</Button>
                <Button variant="outlined" onClick={props.handleSeeMintedNftsClick}>See minted nfts</Button>
            </CardContent>
        </Card>
    </Grid>;
}
