import { Button, Dialog, DialogTitle, Grid } from "@mui/material";
import { Contract, Signer } from "ethers";
import React from "react";
import { BreedableNFTForm } from "../breedableNFTForm/breedableNFTForm";
import { getDeployerContractAddress } from "../constants";
import { MintPromoFormView } from "../mintPromoFormView/mintPromoFormView";
import { BreedableNFT, BreedableNFTDeployer } from "nft-maker/typechain-types";
import BreedableNFTDeployerArtifact from "nft-maker/artifacts/contracts/BreedableNFTDeployer.sol/BreedableNFTDeployer.json";
import BreedableNFTArtifact from "nft-maker/artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import { NftContractSummary, NftContractSummaryView } from "./nftContractSummaryView";

enum DeployedNftsFormType {
    DeployNFT,
    MintPromo
}

type DeployNewNftForm = {
    type: DeployedNftsFormType.DeployNFT
}

type MintPromoForm = {
    type: DeployedNftsFormType.MintPromo
    contract: BreedableNFT
}

type DeployedNftsForm = DeployNewNftForm | MintPromoForm

interface DashboardFormConfig {
    form: DeployedNftsForm
    title: string
    view: JSX.Element
}

interface DeployedNftsViewProps {
    signer: Signer;
    handleSeeMintedNftsClick: (address: string) => void
}

interface DeployedNftsViewState {
    deployedNftContracts: NftContractSummary[]
    displayedForm?: DeployedNftsForm
}

export class DeployedNftsView extends React.Component<DeployedNftsViewProps, DeployedNftsViewState> {

    constructor(props: DeployedNftsViewProps) {
        super(props);
        this.state = {
            deployedNftContracts: []
        };
    }

    async getNftContractSummary(address: string): Promise<NftContractSummary> {
        const contract = new Contract(address, BreedableNFTArtifact.abi, this.props.signer) as BreedableNFT;
        const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
        return {
            address,
            name,
            symbol
        }
    }

    async componentDidMount() {
        const network = await this.props.signer.provider?.getNetwork();
        if (network) {
            const deployerAddress = getDeployerContractAddress(network);
            const deployer = new Contract(deployerAddress, BreedableNFTDeployerArtifact.abi, this.props.signer) as BreedableNFTDeployer;
            const filter = deployer.filters.BreedableNFTDeployed(null, await this.props.signer.getAddress());
            const events = await deployer.queryFilter(filter); // TODO: performance
            const deployedNftAddresses = events.map(e => e.args.contractAddress);
            const deployedNftContracts = await Promise.all(deployedNftAddresses.map(a => this.getNftContractSummary(a)));
            this.setState({ deployedNftContracts });
        }
    }

    async handleMintPromoClick(address: string) {
        const contract = new Contract(address, BreedableNFTArtifact.abi, this.props.signer) as BreedableNFT;
        this.setState({ displayedForm: { type: DeployedNftsFormType.MintPromo, contract } });
    }

    renderForm(config: DashboardFormConfig) {
        return <Dialog
            onClose={() => this.setState({ displayedForm: undefined })}
            open={this.state.displayedForm === config.form}>
            <DialogTitle>{config.title}</DialogTitle>
            {config.view}
        </Dialog>
    }

    pickFormToRender() {
        if (!this.state.displayedForm) {
            return null;
        }
        switch (this.state.displayedForm.type) {
            case DeployedNftsFormType.DeployNFT:
                return this.renderForm({
                    form: this.state.displayedForm,
                    title: "Deploy a new NFT collection",
                    view: <BreedableNFTForm signer={this.props.signer}></BreedableNFTForm>
                });
            case DeployedNftsFormType.MintPromo:
                return this.renderForm({
                    form: this.state.displayedForm,
                    title: `Mint a promotional creature!`,
                    view: <MintPromoFormView contract={this.state.displayedForm.contract}></MintPromoFormView>
                });
        }
    }

    handleDeployButtonClick() {
        this.setState({ displayedForm: { type: DeployedNftsFormType.DeployNFT } });
    }

    render() {
        return <>
            <Grid container>
                {this.state.deployedNftContracts.map(s => {
                    return <NftContractSummaryView
                        key={s.address}
                        handleSeeMintedNftsClick={() => this.props.handleSeeMintedNftsClick(s.address)}
                        summary={s} handleMintPromoClick={() => this.handleMintPromoClick(s.address)}></NftContractSummaryView>
                })}
            </Grid>
            <Button variant="outlined" onClick={() => this.handleDeployButtonClick()}>
                Deploy new NFT contract
            </Button>
            {this.pickFormToRender()}
        </>
    }
}
