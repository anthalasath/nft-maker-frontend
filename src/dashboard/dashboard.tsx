import { Button, Card, CardContent, Dialog, DialogTitle, Grid, List, ListItem, ListItemText, Modal } from '@mui/material';
import { Contract, ethers, Signer } from 'ethers';
import React from 'react';
import { getDeployerContractAddress } from '../constants';
import BreedableNFTDeployerArtifact from "../nft-maker/artifacts/contracts/BreedableNFTDeployer.sol/BreedableNFTDeployer.json";
import BreedableNFTArtifact from "../nft-maker/artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import { BreedableNFT, BreedableNFTDeployer } from '../nft-maker/typechain-types';
import { BreedableNFTForm } from '../breedableNFTForm/breedableNFTForm';
import { MintPromoFormView } from '../mintPromoFormView/mintPromoFormView';

enum DashboardFormType {
    DeployNFT,
    MintPromo
}

type DeployNFTForm = {
    type: DashboardFormType.DeployNFT
}

type MintPromoForm = {
    type: DashboardFormType.MintPromo
    contract: BreedableNFT
}

type DashboardForm = DeployNFTForm | MintPromoForm

interface DashboardFormConfig {
    form: DashboardForm
    title: string
    view: JSX.Element
}
export interface DashboardProps {
    signer: Signer;
}

interface DashboardState {
    deployedNftContracts: NftContractSummary[]
    displayedForm?: DashboardForm
}

export class Dashboard extends React.Component<DashboardProps, DashboardState> {

    constructor(props: DashboardProps) {
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

    handleDeployButtonClick() {
        this.setState({ displayedForm: { type: DashboardFormType.DeployNFT } });
    }

    async handleMintPromoClick(address: string) {
        const contract = new Contract(address, BreedableNFTArtifact.abi, this.props.signer) as BreedableNFT;
        this.setState({ displayedForm: { type: DashboardFormType.MintPromo, contract } });
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
            case DashboardFormType.DeployNFT:
                return this.renderForm({
                    form: this.state.displayedForm,
                    title: "Deploy a new NFT collection",
                    view: <BreedableNFTForm signer={this.props.signer}></BreedableNFTForm>
                });
            case DashboardFormType.MintPromo:
                return this.renderForm({
                    form: this.state.displayedForm,
                    title: `Mint a promotional creature!`,
                    view: <MintPromoFormView contract={this.state.displayedForm.contract}></MintPromoFormView>
                });
        }
    }

    render() {
        return <>
            <Grid container>
                {this.state.deployedNftContracts.map(s => {
                    return <NftContractSummaryView key={s.address} summary={s} handleMintPromoClick={() => this.handleMintPromoClick(s.address)}></NftContractSummaryView>
                })}
            </Grid>
            <Button variant="outlined" onClick={() => this.handleDeployButtonClick()}>
                Deploy new NFT contract
            </Button>
            {this.pickFormToRender()}
        </>
    }
}


interface NftContractSummary {
    address: string
    name: string
    symbol: string
}

interface NftContractSummaryViewProps {
    summary: NftContractSummary
    handleMintPromoClick: () => void
}

function NftContractSummaryView(props: NftContractSummaryViewProps) {
    return <Grid item xs={4}>
        <Card>
            <CardContent>
                <p>{props.summary.name}</p>
                <p>{props.summary.symbol}</p>
                <p>{props.summary.address}</p>
                <Button variant="outlined" onClick={props.handleMintPromoClick}>Mint promotional creature</Button>
            </CardContent>
        </Card>
    </Grid>
}
