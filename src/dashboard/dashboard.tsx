import { Contract, Signer } from 'ethers';
import React from 'react';
import { BreedableNFT } from '../nft-maker/typechain-types';
import { DeployedNftsView } from './deployedNftsView';
import { MintedNftsView } from './mintedNftsView';
import BreedableNFTArtifact from "../nft-maker/artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import { BackButtonView } from '../utils/backButtonView';

enum DashboardPageType {
    DeployedContracts,
    MintedNfts
}

type DeployedContractsPage = {
    type: DashboardPageType.DeployedContracts
}

type MintedNftsPage = {
    type: DashboardPageType.MintedNfts
    contract: BreedableNFT
}

type DashboardPage = DeployedContractsPage | MintedNftsPage

export interface DashboardProps {
    signer: Signer;
}

interface DashboardState {
    displayedPage: DashboardPage
}

export class Dashboard extends React.Component<DashboardProps, DashboardState> {

    constructor(props: DashboardProps) {
        super(props);
        this.state = {
            displayedPage: { type: DashboardPageType.DeployedContracts }
        };
    }

    handleSeeNftsClick(address: string) {
        const contract = new Contract(address, BreedableNFTArtifact.abi, this.props.signer) as BreedableNFT;
        this.setState({ displayedPage: { type: DashboardPageType.MintedNfts, contract } });
    }

    handleBackButtonClick() {
        this.setState({ displayedPage: { type: DashboardPageType.DeployedContracts } });
    }

    render() {
        switch (this.state.displayedPage.type) {
            case DashboardPageType.DeployedContracts:
                return <DeployedNftsView signer={this.props.signer} handleSeeMintedNftsClick={address => this.handleSeeNftsClick(address)}></DeployedNftsView>
            case DashboardPageType.MintedNfts:
                return <>
                    <BackButtonView onClick={() => this.handleBackButtonClick()}></BackButtonView>
                    <MintedNftsView contract={this.state.displayedPage.contract}></MintedNftsView>
                </>
        }
    }
}


