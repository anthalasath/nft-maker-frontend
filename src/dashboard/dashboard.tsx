import { List, ListItem, ListItemText } from '@mui/material';
import { Contract, Signer } from 'ethers';
import React from 'react';
import { getDeployerContractAddress } from '../constants';
import BreedableNFTDeployerArtifact from "../nft-maker/artifacts/contracts/BreedableNFTDeployer.sol/BreedableNFTDeployer.json";
import { BreedableNFTDeployer } from '../nft-maker/typechain-types';

export interface DashboardProps {
    signer: Signer;
}

interface DashboardState {
    deployedNftAddresses: string[]
}

export class Dashboard extends React.Component<DashboardProps, DashboardState> {

    constructor(props: DashboardProps) {
        super(props);
        this.state = {
            deployedNftAddresses: []
        };
    }

    async componentDidMount() {
        const network = await this.props.signer.provider?.getNetwork();
        if (network) {
            const deployerAddress = getDeployerContractAddress(network);
            const deployer = new Contract(deployerAddress, BreedableNFTDeployerArtifact.abi, this.props.signer) as BreedableNFTDeployer;
            const filter = deployer.filters.BreedableNFTDeployed(null, await this.props.signer.getAddress());
            const events = await deployer.queryFilter(filter); // TODO: performance
            const deployedNftAddresses = events.map(e => e.args.contractAddress);
            this.setState({ deployedNftAddresses });
        }
    }

    render() {
        return <List>
            {this.state.deployedNftAddresses.map(a => {
                return <ListItem>
                    <ListItemText>{a}</ListItemText>
                </ListItem>
            })}
        </List>
    }
}