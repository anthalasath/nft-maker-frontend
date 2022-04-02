import { Card, CardContent, Grid, List, ListItem, ListItemText } from '@mui/material';
import { Contract, Signer } from 'ethers';
import React from 'react';
import { getDeployerContractAddress } from '../constants';
import BreedableNFTDeployerArtifact from "../nft-maker/artifacts/contracts/BreedableNFTDeployer.sol/BreedableNFTDeployer.json";
import BreedableNFTArtifact from "../nft-maker/artifacts/contracts/BreedableNFT.sol/BreedableNFT.json";
import { BreedableNFT, BreedableNFTDeployer } from '../nft-maker/typechain-types';

export interface DashboardProps {
    signer: Signer;
}
interface DashboardState {
    deployedNftContracts: NftContractSummary[]
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

    render() {
        return <Grid container>
            {this.state.deployedNftContracts.map(s => <NftSummaryView key={s.address} summary={s}></NftSummaryView>)}
        </Grid>
    }
}

interface NftContractSummary {
    address: string
    name: string
    symbol: string
}

function NftSummaryView(props: { summary: NftContractSummary }) {
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
