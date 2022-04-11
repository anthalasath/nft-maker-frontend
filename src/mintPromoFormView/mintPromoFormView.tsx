import { Alert, AlertColor, Button, Stack, TextField } from '@mui/material';
import { BigNumber, ContractReceipt } from 'ethers';
import React, { useState } from 'react';
import { minutes, seconds } from '../durations';
import { BreedableNFT } from '../nft-maker/typechain-types';
import { AlertWithLifetimeView } from '../utils/alertWithLifetimeView';

export interface MintPromoFormViewProps {
    contract: BreedableNFT
}

interface MintPromoFormViewState {
    contractName: string
    genes: BigNumber[]
    ownerAddress: string
    receiverAddress: string
    mintPromoResult?: MintPromoResult
    secondsLeftForDisplayedAlert?: number
}

interface MintPromoSuccessResult {
    tokenId: BigNumber
    receipt: ContractReceipt
}

type MintPromoResult = Error | MintPromoSuccessResult;

async function mintPromo(contract: BreedableNFT, genes: BigNumber[], receiverAddress: string): Promise<MintPromoResult> {
    try {
        const tx = await contract.mintPromo(genes, receiverAddress);
        const receipt = await tx.wait();
        const filter = contract.filters.PromoCreatureMinted();
        const eventsThisBlock = await contract.queryFilter(filter, receipt.blockNumber);
        const event = eventsThisBlock.find(e => e.transactionHash === receipt.transactionHash);
        if (!event) {
            return new Error(`Cannot get event for tx ${receipt.transactionHash}`);
        }
        return { tokenId: event.args.tokenId, receipt };
    } catch (err: any) {
        if (err instanceof Error) {
            return err;
        } else {
            return new Error(`An error has occured: ${err.toString()}`);
        }
    }
}

export class MintPromoFormView extends React.Component<MintPromoFormViewProps, MintPromoFormViewState> {

    constructor(props: MintPromoFormViewProps) {
        super(props);
        this.state = {
            contractName: "",
            genes: [],
            ownerAddress: "",
            receiverAddress: "",
        };
    }

    // TODO: have this given in props
    async componentDidMount() {
        const contractName = await this.props.contract.name();
        const genesCount = await this.props.contract.getPicturePartCategoriesCount();
        const genes = Array(genesCount).fill(BigNumber.from(0));
        const ownerAddress = await this.props.contract.owner();
        this.setState({ contractName, genes, ownerAddress });
    }

    handleGeneFieldChange(index: number, gene: BigNumber) {
        const genes = this.state.genes;
        genes[index] = gene;
        this.setState({ genes });
    }

    renderGenesFields(): JSX.Element[] {
        const fields = [];
        for (let i = 0; i < this.state.genes.length; i++) {
            const geneIndex = i;
            fields.push(<TextField key={i} onChange={e => this.handleGeneFieldChange(geneIndex, BigNumber.from(e.target.value))}></TextField>)
        }
        return fields;
    }

    handleReceiverAddressChange(receiverAddress: string) {
        this.setState({ receiverAddress });
    }

    async handleMintClick() {
        const mintPromoResult = await mintPromo(this.props.contract, this.state.genes, this.state.receiverAddress);
        this.setState({ mintPromoResult });
    }

    renderAlert() {
        if (!this.state.mintPromoResult) {
            return null;
        }
        const alertExpirationDate = Date.now() + minutes(1);
        if (this.state.mintPromoResult instanceof Error) {
            return <AlertWithLifetimeView
                expirationDate={alertExpirationDate}
                severity='error'
                message={`Could not mint because an error occurred`}></AlertWithLifetimeView>
        }
        return <AlertWithLifetimeView
            expirationDate={alertExpirationDate}
            severity='success'
            message={`Minted creature ${this.state.mintPromoResult.tokenId}. Tx hash: ${this.state.mintPromoResult.receipt.transactionHash}`}></AlertWithLifetimeView>
    }

    render() {
        return <Stack spacing={1}>
            {this.renderAlert()}
            <h3>{this.state.contractName}</h3>
            <h4>Genes</h4>
            {this.renderGenesFields()}
            <h4>Receiver address</h4>
            <TextField placeholder={this.state.ownerAddress} onChange={e => this.handleReceiverAddressChange(e.target.value)}></TextField>
            <Button onClick={() => this.handleMintClick()}>Mint</Button>
        </Stack>
    }
}