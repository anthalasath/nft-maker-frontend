import { Button, Card, CardContent, Dialog, DialogTitle, Grid, List, ListItem, ListItemText, Modal } from '@mui/material';
import { Contract, Signer } from 'ethers';
import React from 'react';
import { getDeployerContractAddress } from '../constants';
import BreedableNFTDeployerArtifact from "../nft-maker/artifacts/contracts/BreedableNFTDeployer.sol/BreedableNFTDeployer.json";
import BreedableNFTArtifact from "../nft-maker/artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import { BreedableNFT, BreedableNFTDeployer } from '../nft-maker/typechain-types';
import { BreedableNFTForm } from '../breedableNFTForm/breedableNFTForm';

export interface DashboardProps {
    signer: Signer;
}
interface DashboardState {
    deployedNftContracts: NftContractSummary[]
    showingDeployNftForm: boolean
}

export class Dashboard extends React.Component<DashboardProps, DashboardState> {

    constructor(props: DashboardProps) {
        super(props);
        this.state = {
            deployedNftContracts: [],
            showingDeployNftForm: false
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
        this.setState({ showingDeployNftForm: true });
    }

    render() {
        return <>
            <Grid container>
                {this.state.deployedNftContracts.map(s => <NftContractSummaryView key={s.address} summary={s}></NftContractSummaryView>)}
            </Grid>
            <Button variant="outlined" onClick={() => this.handleDeployButtonClick()}>
                Deploy new NFT contract
            </Button>
            <Dialog
                onClose={() => this.setState({ showingDeployNftForm: false })}
                open={this.state.showingDeployNftForm}>
                <DialogTitle>Deploy a new NFT collection</DialogTitle>
                <BreedableNFTForm signer={this.props.signer}></BreedableNFTForm>
            </Dialog>
        </>
    }
}

interface NftContractSummary {
    address: string
    name: string
    symbol: string
}

function NftContractSummaryView(props: { summary: NftContractSummary }) {
    return <Grid item xs={4}>
        <Card>
            <CardContent>
                <p>{props.summary.name}</p>
                <p>{props.summary.symbol}</p>
                <p>{props.summary.address}</p>
            </CardContent>
        </Card>
    </Grid>
}
