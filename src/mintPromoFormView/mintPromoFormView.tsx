import { Stack, TextField } from '@mui/material';
import { BigNumber } from 'ethers';
import React from 'react';
import { BreedableNFT } from '../nft-maker/typechain-types';

export interface MintPromoFormViewProps {
    contract: BreedableNFT
}

interface MintPromoFormViewState {
    contractName: string
    genes: BigNumber[]
    ownerAddress: string
    receiverAddress: string
}

export class MintPromoFormView extends React.Component<MintPromoFormViewProps, MintPromoFormViewState> {

    constructor(props: MintPromoFormViewProps) {
        super(props);
        this.state = {
            contractName: "",
            genes: [],
            ownerAddress: "",
            receiverAddress: ""
        };
    }

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

    render() {
        return <Stack spacing={1}>
            <h3>{this.state.contractName}</h3>
            <h4>Genes</h4>
            {this.renderGenesFields()}
            <h4>Receiver address</h4>
            <TextField placeholder={this.state.ownerAddress} onChange={e => this.handleReceiverAddressChange(e.target.value)}></TextField>
        </Stack>
    }
}